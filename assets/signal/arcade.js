(() => {
  const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump'};
  const saveKey='fieldwork-run-v1';
  class FieldArcade extends HTMLElement{
    connectedCallback(){
      if(!this.chapters||this.events)return;
      this.events=new AbortController();this.held=new Map();this.trail=Array.from({length:7},()=>[]);this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const initial=this.startAt||0;
      try{const s=JSON.parse(sessionStorage.getItem(saveKey));if(s&&Array.isArray(s.pages)&&s.pages.length===7&&s.pages.every(p=>Array.isArray(p)&&p.every(i=>[0,1,2].includes(i)))){this.trail=s.pages}}catch{}
      this.innerHTML=`
        <div class="run-hud"><div><small class="run-number"></small><strong class="run-name"></strong></div><div class="run-score"><i aria-hidden="true">▤</i> <span></span></div><button type="button" data-act="pause">Pause</button></div>
        <div class="run-view" tabindex="0" role="region" aria-label="Journey platform game. Left and right arrows or A and D to move. Space, W or up arrow to jump. Escape pauses."><canvas aria-hidden="true"></canvas><div class="run-notice" role="status"></div><div class="run-panel" hidden></div></div>
        <div class="run-meter" aria-hidden="true"><i></i></div>
        <div class="run-pad"><div><button type="button" data-key="left" aria-label="Move left">◀</button><button type="button" data-key="right" aria-label="Move right">▶</button></div><button type="button" data-key="jump">Jump</button></div>
        <div class="run-foot"><span><kbd>←</kbd> <kbd>→</kbd> Move &nbsp; <kbd>Space</kbd> Jump</span><div><button type="button" data-act="sound" aria-pressed="false">Sound off</button><label class="run-stage"><span>Stage</span><select aria-label="Choose a stage"></select></label><a href="../?view=fieldwork#/work">Browse work</a></div></div>`;
      this.cv=this.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.bg=document.createElement('canvas');this.view=this.querySelector('.run-view');this.panel=this.querySelector('.run-panel');this.meter=this.querySelector('.run-meter i');
      const on=(el,ev,fn,opts={})=>el.addEventListener(ev,fn,{...opts,signal:this.events.signal});
      on(this,'click',e=>{const a=e.target.closest('[data-act]')?.dataset.act;if(a==='pause')this.pause();if(a==='resume'){this.play()}if(a==='next'){this.load(this.run.n+1);this.play()}if(a==='repeat'){this.load(this.run.n);this.play()}if(a==='replay'){this.trail=this.trail.map(()=>[]);this.load(0);this.play()}if(a==='sound'){this.sound=!this.sound;if(this.sound){try{this.audio??=new AudioContext();this.audio.resume().catch(()=>{});this.beep(540)}catch{this.sound=false}}const b=this.querySelector('[data-act=sound]');b.textContent=this.sound?'Sound on':'Sound off';b.setAttribute('aria-pressed',String(this.sound));if(this.mode==='play')this.view.focus({preventScroll:true})}});
      on(this.view,'keydown',e=>{if(e.target!==this.view)return;if(e.code==='Escape'){e.preventDefault();this.pause();return}if(this.mode!=='play'||!keys[e.code])return;e.preventDefault();this.held.set(e.code,keys[e.code])});
      on(window,'keyup',e=>this.held.delete(e.code));
      const picker=this.querySelector('.run-stage select');this.chapters.forEach((s,i)=>picker.add(new Option((i+1)+'. '+s.name,String(i))));
      on(picker,'change',e=>{this.load(Number(e.target.value));this.play()});
      for(const btn of this.querySelectorAll('[data-key]')){
        on(btn,'pointerdown',e=>{if(this.mode!=='play')return;e.preventDefault();btn.setPointerCapture(e.pointerId);this.held.set(e.pointerId,btn.dataset.key);btn.classList.add('pressed')});
        const up=e=>{this.held.delete(e.pointerId);btn.classList.remove('pressed')};on(btn,'pointerup',up);on(btn,'lostpointercapture',up);
      }
      on(window,'blur',()=>this.pause());on(document,'visibilitychange',()=>{if(document.hidden)this.pause()});on(this,'focusout',e=>{if(e.relatedTarget&&!this.contains(e.relatedTarget))this.pause(false)});
      this.visibility=new IntersectionObserver(([v])=>{if(!v.isIntersecting)this.pause(false)});this.visibility.observe(this);
      this.size=new ResizeObserver(()=>this.draw());this.size.observe(this.view);
      this.load(initial);this.play();
    }
    persist(){try{sessionStorage.setItem(saveKey,JSON.stringify({n:this.run.n,pages:this.trail}))}catch{}}
    load(n){this.run=new FieldRun.Run(n,this.trail[n]);this.querySelector('.run-stage select').value=String(n);this.dispatchEvent(new CustomEvent('stage-change',{detail:n}));this.camera=0;this.bgIndex=null;this.particles=[];this.querySelector('.run-number').textContent='STAGE '+(n+1)+' / 7 · '+this.chapters[n].name.toUpperCase();this.querySelector('.run-name').textContent=this.run.name;this.notice(n===0?'Collect notebook pages. Reach the yellow flag.':this.run.hint,4);this.score();this.persist()}
    score(){this.querySelector('.run-score span').textContent=this.trail[this.run.n].length+' / 3 pages'}
    notice(s,duration=2){this.noticeUntil=this.run.t+duration;this.querySelector('.run-notice').textContent=s}
    beep(f,duration=.09){if(!this.sound||!this.audio)return;const a=this.audio,o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.setValueAtTime(f,a.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.32,a.currentTime+duration);g.gain.setValueAtTime(.06,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+duration);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+duration)}
    play(){this.mode='play';this.panel.hidden=true;this.querySelector('[data-act=pause]').disabled=false;this.held.clear();this.view.focus({preventScroll:true});this.last=0;this.debt=0;cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(t=>this.tick(t))}
    pause(focus=true){if(this.mode!=='play')return;this.mode='paused';this.held.clear();cancelAnimationFrame(this.frame);this.overlay('GAME PAUSED','Take a breather.','Your place on the trail is safe.','resume','Resume game',focus)}
    overlay(k,title,body,act,label,focus=true){this.querySelector('[data-act=pause]').disabled=true;this.panel.hidden=false;this.panel.innerHTML='<div><small></small><h2></h2><p></p><div class="run-actions"><button type="button"></button><a></a></div></div>';this.panel.querySelector('small').textContent=k;this.panel.querySelector('h2').textContent=title;this.panel.querySelector('p').textContent=body;const btn=this.panel.querySelector('button');btn.dataset.act=act;btn.textContent=label;const a=this.panel.querySelector('a'),s=this.chapters[this.run.n];a.href=s.path;a.textContent=s.link;if(this.mode==='finished'&&this.trail[this.run.n].length<3){const repeat=document.createElement('button');repeat.type='button';repeat.dataset.act='repeat';repeat.textContent='Find missed pages';a.before(repeat)}if(focus)btn.focus({preventScroll:true})}
    tick(ms){if(this.mode!=='play')return;this.debt+=this.last?Math.min(.06,(ms-this.last)/1000):0;this.last=ms;const input={};for(const v of this.held.values())input[v]=true;
      while(this.debt>=FieldRun.DT){this.run.step(input);this.debt-=FieldRun.DT}
      for(const event of this.run.events.splice(0)){
        if(event.startsWith('page:')){const i=Number(event.slice(5));this.trail[this.run.n].push(i);this.score();this.persist();this.beep(820);if(!this.reduced)this.particles.push({x:this.run.coins[i].x,y:this.run.coins[i].y,t:this.run.t})}
        if(event==='jump')this.beep(245,.07);if(event==='bounce'){this.beep(415);this.notice('Clockwork bounce!',1)}
        if(event==='checkpoint'){this.notice('Checkpoint stamped');this.beep(620)}
        if(event==='retry'){this.camera=null;this.notice('Back on the trail. Try that jump again.',2)}
        if(event==='finish'){const n=this.run.n,last=n===6;this.mode='finished';this.beep(730,.24);this.overlay(last?'FINAL FLAG · '+this.trail.flat().length+' / 21 PAGES':'STAGE CLEAR · '+this.trail[n].length+' / 3 PAGES',last?'You made it to Precisely.':this.chapters[n].title.join(' ')+'.',this.chapters[n].text,last?'replay':'next',last?'Play again':'Next: '+this.chapters[n+1].name);if(last){try{sessionStorage.removeItem(saveKey)}catch{}}}
      }
      this.draw();if(this.mode==='play')this.frame=requestAnimationFrame(t=>this.tick(t))
    }
    draw(){if(!this.run||!this.view.clientWidth)return;const h=234,w=Math.max(255,Math.round(this.view.clientWidth/this.view.clientHeight*h)),r=this.run,c=this.ctx,art=window.FieldArcadeArt;if(!art)return;
      if(this.cv.width!==w||this.cv.height!==h){this.cv.width=this.bg.width=w;this.cv.height=this.bg.height=h;this.bgIndex=null}
      const dest=Math.max(0,Math.min(r.length-w,r.x-w*.32));this.camera=this.camera==null?dest:this.camera+(dest-this.camera)*(this.reduced?1:.15);const cam=Math.round(this.camera);
      const travel=r.n+(this.reduced?0:(cam/Math.max(1,r.length-w)-.20)*.65),key=Math.round(travel*72);
      if(this.bgIndex!==key){window.FieldScenery(this.bg.getContext('2d'),w,h,key/72);this.bgIndex=key}
      c.drawImage(this.bg,0,0);c.save();c.translate(-cam,0);const visible=(x,width=25)=>x+width>=cam&&x<cam+w+20;
      for(let i=1;i<r.ground.length;i++){const a=r.ground[i-1],x=a.x+a.w,end=r.ground[i].x;if(!visible(x,end-x))continue;c.fillStyle='#599a8a';c.fillRect(x,216,end-x,18);c.fillStyle='#bdd89e';for(let q=x+3;q<end-5;q+=13)c.fillRect(q,219+Math.round(Math.sin(q+(this.reduced?0:r.t*3))*1.8),6,1)}
      for(const g of r.ground)if(visible(g.x,g.w))art.ground(c,g.x,g.y,g.w,r.n);
      for(const p of r.platforms)if(visible(p.x,p.w))art.platform(c,Math.round(p.x),p.y,p.w,p.kind,r.n);
      if(visible(r.post))art.sign(c,r.post,FieldRun.FLOOR,r.checkpoint===38?'SAVE':'OK');
      if(visible(r.finish))art.flag(c,r.finish,FieldRun.FLOOR,r.t,r.n);
      for(const coin of r.coins)if(!coin.taken&&visible(coin.x))art.token(c,coin.x,coin.y,this.reduced?0:r.t,r.n);
      for(const bug of r.bugs)if(bug.alive&&visible(bug.x))art.beetle(c,Math.round(bug.x),bug.y,r.t,bug.dir,r.n);
      art.player(c,Math.round(r.x),Math.round(r.y),r.t,r.dir,!r.grounded?(r.vy<0?'jump':'fall'):Math.abs(r.vx)>5?'run':'idle');
      this.particles=this.particles.filter(p=>r.t-p.t<.35);c.fillStyle='#fff8ae';for(const p of this.particles){const age=(r.t-p.t)*42;for(let i=0;i<6;i++)c.fillRect(p.x+Math.cos(i)*age,p.y+Math.sin(i)*age-age*.5,2,2)}
      c.restore();this.meter.style.width=Math.round(r.x/r.finish*100)+'%';this.querySelector('.run-notice').hidden=r.t>this.noticeUntil||this.mode!=='play';
    }
    disconnectedCallback(){this.mode='closed';cancelAnimationFrame(this.frame);this.events?.abort();this.events=null;this.visibility?.disconnect();this.size?.disconnect();this.audio?.close().catch(()=>{})}
  }
  customElements.define('field-arcade',FieldArcade);
})();
