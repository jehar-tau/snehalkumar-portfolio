#!/usr/bin/env python3
"""Local dev server for the portfolio site with a save endpoint for image-slot uploads.

Plain `python3 -m http.server` can only ever serve files — it has no way to
persist a drag-and-drop upload back to .image-slots.state.json. This adds one
POST endpoint that image-slot.js's window.omelette.writeFile shim (see
index.html) calls whenever a slot is filled or cleared, so edits made
directly on the site save straight to disk. Not used by the deployed GitHub
Pages site — local editing only.
"""
import http.server
import json
import os
import re
import socketserver
import sys
import urllib.parse

ALLOWED_FILES = {'.image-slots.state.json'}


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Byte-range support, so <video> can seek and loop (http.server alone
        # always answers 200 with the whole file).
        path = self.translate_path(self.path)
        m = re.fullmatch(r'bytes=(\d*)-(\d*)', (self.headers.get('Range') or '').strip())
        if not m or not os.path.isfile(path):
            return super().do_GET()
        size = os.path.getsize(path)
        if m.group(1):
            start = int(m.group(1))
            end = min(int(m.group(2)) if m.group(2) else size - 1, size - 1)
        elif m.group(2):
            start, end = max(0, size - int(m.group(2))), size - 1
        else:
            return super().do_GET()
        if start > end:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.end_headers()
            return
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        with open(path, 'rb') as f:
            f.seek(start)
            remaining = end - start + 1
            while remaining > 0:
                chunk = f.read(min(1 << 16, remaining))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    break
                remaining -= len(chunk)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != '/__write':
            self.send_response(404)
            self.end_headers()
            return

        rel = urllib.parse.parse_qs(parsed.query).get('path', [''])[0]
        if rel not in ALLOWED_FILES:
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b'{"ok":false,"error":"path not allowed"}')
            return

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        try:
            json.loads(body)  # reject anything that isn't valid JSON
        except ValueError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"ok":false,"error":"invalid json"}')
            return

        with open(rel, 'wb') as f:
            f.write(body)

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    # Threaded, so a streaming video doesn't block every other request.
    with socketserver.ThreadingTCPServer(('', port), Handler) as httpd:
        print(f'Serving with upload support on port {port}')
        httpd.serve_forever()
