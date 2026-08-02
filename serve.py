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
import socketserver
import sys
import urllib.parse

ALLOWED_FILES = {'.image-slots.state.json'}


class Handler(http.server.SimpleHTTPRequestHandler):
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
    with socketserver.TCPServer(('', port), Handler) as httpd:
        print(f'Serving with upload support on port {port}')
        httpd.serve_forever()
