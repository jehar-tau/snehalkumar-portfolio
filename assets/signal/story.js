(() => {
  const stops = window.FieldworkChapters;
  const last=stops.length-1;
  const pages = {
    work:[6,'Field notes / Projects','The work, in use','These are the decisions behind five products. Pick a project to follow the people using it.','case/data-lineage','Explore data lineage'],
    experience:[1,'Field notes / Experience','From floor to screen','A year in maintenance, a design education, and a move into digital products.','about','Meet the designer'],
    about:[0,'Field notes / Home','A house in the fields','My story starts in a village in Maharashtra.','work','Explore the work'],
    playground:[3,'Field notes / Experiments','The workbench','Small experiments you can pick up and try.','agentfence','Try AgentFence'],
    contact:[0,'Field notes / Contact','Come say hello','Have a project in mind? I’d love to hear what you’re working on.','','Walk the trail again'],
    agentfence:[3,'Experiment / AgentFence','A boundary you can test','Follow a piece of information from one site to another.','guestbook','Visit the guestbook'],
    guestbook:[0,'Visitor notes','The guestbook','A few words from the people who passed through.','crawlerlog','Explore crawler sightings'],
    crawlerlog:[5,'Experiment / Sightings','Who reads a website?','An experiment in how automated visitors encounter the site.','playground','Back to the workbench'],
    'data-lineage':[6,'Precisely / Data lineage','Follow one field','If a value looks wrong, where do you go looking for its source?','case/asset-impact-diagram','Explore asset impact'],
    'asset-impact-diagram':[6,'Precisely / Asset impact','Before you change it','One asset is about to change. Who else depends on it?','case/ai-workflows','Explore AI review'],
    'ai-workflows':[6,'Precisely / AI review','Who decides?','A model proposes a description. Someone still has to decide whether it belongs.','case/mm-crm','Explore the mortgage CRM'],
    'mm-crm':[4,'Infosys / Movement Mortgage','The next call','Put yourself at a loan officer’s desk. Which borrower needs you today?','case/bdo-onboarding','Explore digital onboarding'],
    'bdo-onboarding':[4,'Infosys / BDO Bank','Past the branch door','What does opening an account look like when the branch is no longer the starting point?','contact','Get in touch']
  };
  const count = n => String(n+1).padStart(2,'0');
  class Journey extends HTMLElement {
    connectedCallback() {
      if(this.closest('x-dc')||this.field)return;
      this.index=0;
      this.innerHTML = `<div class="atlas-meta"><span><b class="crosshair" aria-hidden="true"></b> FIELDWORK / SNEHAL’S PORTFOLIO</span><span>MAHARASHTRA <b>/</b> INDIA</span></div>
        <section class="atlas-screen" tabindex="0" aria-label="Fieldwork, an interactive portfolio. Use the left and right arrow keys to travel.">
          <canvas aria-hidden="true"></canvas><div class="scene-shade"></div>
          <div class="scene-coords" aria-hidden="true"><i></i> <span></span></div>
          <div class="scene-copy"><div class="scene-label"><i></i><span aria-live="polite" aria-atomic="true"></span></div><h1></h1><p></p>
          <div class="scene-actions"><button type="button" class="scene-action"></button><a class="scene-link"></a></div></div>
          <div class="travel-tip">Scroll or use the arrow keys to travel</div><div class="scene-plate" aria-hidden="true"><i></i><span></span></div>
        </section>
        <div class="atlas-console"><div class="console-lead"><b class="path-icon" aria-hidden="true">▥</b><span>Journey map</span></div>
          <div role="group" aria-label="Journey stops" class="atlas-stops">${stops.map((s,i)=>`<button type="button" data-stop="${i}" aria-label="Stop ${i+1}, ${s.name}"><i></i><span>${s.name}</span></button>`).join('')}</div>
          <div class="step-actions"><button aria-label="Previous stop" type="button">←</button><button aria-label="Next stop" type="button">→</button></div>
        </div><div class="mode-invite"><span>Prefer to play the story?</span><a href="./game/">Open Game Mode</a></div>`;
      this.stage=this.querySelector('.atlas-screen');this.field=new window.SignalLandscape(this.querySelector('canvas'));
      this.events=new AbortController();const on=(el,ev,fn,opts={})=>el.addEventListener(ev,fn,{...opts,signal:this.events.signal});
      const step=(n)=>this.select(Math.max(0,Math.min(stops.length-1,this.index+n)));
      on(this,'click',e=>{
        const btn=e.target.closest('button');if(!btn)return;
        if(btn.hasAttribute('data-stop'))this.select(Number(btn.dataset.stop));
        else if(btn.classList.contains('scene-action')){if(this.index===last)location.hash='/work';else step(1);}
        else if(btn.closest('.step-actions'))step(btn===btn.parentElement.firstElementChild?-1:1);
      });
      on(this,'keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
      let down=null;on(this.stage,'pointerdown',e=>{if(!e.target.closest('a,button')){down=e.clientX;this.stage.setPointerCapture(e.pointerId);}});
      on(this.stage,'pointerup',e=>{if(down!==null&&Math.abs(e.clientX-down)>34)step(e.clientX<down?1:-1);down=null;});
      on(this.stage,'pointercancel',()=>{down=null;});
      let lastWheel=0,wheelSum=0,stepped=false;
      on(this.stage,'wheel',e=>{
        if(e.ctrlKey)return;
        const horizontal=Math.abs(e.deltaX)>Math.abs(e.deltaY);
        const dx=horizontal?e.deltaX:e.deltaY;if(!dx)return;
        const now=performance.now();if(now-lastWheel>160){wheelSum=0;stepped=false;}
        lastWheel=now;
        if(!stepped&&((dx>0&&this.index===last)||(dx<0&&this.index===0)))return;
        e.preventDefault();wheelSum+=dx*(e.deltaMode===1?16:e.deltaMode===2?160:1);
        if(!stepped&&Math.abs(wheelSum)>=32){step(wheelSum>0?1:-1);stepped=true;}
      },{passive:false});
      this.select(0);
    }
    select(i){
      const s=stops[i],changed=this.index!==i;this.index=i;this.field.set(i);
      this.querySelector('.scene-label span').textContent='CH. '+count(i)+'  /  '+s.label.toUpperCase();
      this.querySelector('.scene-coords span').textContent='SCENE '+count(i)+' / '+count(last);
      this.querySelector('.scene-plate span').textContent=s.name;
      this.querySelector('.mode-invite a').href='./game/'+(i?'?stage='+(i+1):'');
      const title=this.querySelector('h1');title.replaceChildren(document.createTextNode(s.title[0]+' '),Object.assign(document.createElement('em'),{textContent:s.title[1]+'.'}));
      this.querySelector('.scene-copy p').textContent=s.text;
      this.querySelector('.scene-action').textContent=i===0?'Start the journey':i===last?'Explore all projects':'Keep walking';
      const link=this.querySelector('.scene-link');link.href=s.path;link.textContent=s.link;
      this.querySelectorAll('[data-stop]').forEach((btn,k)=>btn.setAttribute('aria-pressed',String(i===k)));
      const [prev,next]=this.querySelectorAll('.step-actions button');prev.disabled=i===0;next.disabled=i===last;
      if(changed&&!matchMedia('(prefers-reduced-motion: reduce)').matches)this.querySelector('.scene-copy').animate([{opacity:.55,translate:'7px 0'},{opacity:1,translate:'0 0'}],{duration:240});
    }
    disconnectedCallback(){this.events?.abort();this.field?.destroy();this.field=null;}
  }
  class Banner extends HTMLElement {
    static get observedAttributes(){return ['place'];}
    connectedCallback(){this.update();}
    attributeChangedCallback(){if(this.isConnected)this.update();}
    update(){
      const entry=pages[this.getAttribute('place')];if(!entry||this.closest('x-dc'))return;
      const [scene,kicker,title,desc]=entry;
      if(!this.field){
        this.innerHTML='<div class="chapter-art"><canvas aria-hidden="true"></canvas><div class="scene-shade"></div><div class="chapter-copy"><a href="#/" class="chapter-back">← Journey map</a><small></small><h2></h2><p></p></div></div>';
        this.field=new window.SignalLandscape(this.querySelector('canvas'),true);
      }
      this.field.travel=scene;this.field.dirty=true;this.field.set(scene);
      this.querySelector('small').textContent=kicker;this.querySelector('h2').textContent=title;this.querySelector('p').textContent=desc;
    }
    disconnectedCallback(){this.field?.destroy();this.field=null;}
  }
  class Next extends HTMLElement {
    static get observedAttributes(){return ['place'];}
    connectedCallback(){this.update();}
    attributeChangedCallback(){if(this.isConnected)this.update();}
    update(){const data=pages[this.getAttribute('place')];if(!data||this.closest('x-dc'))return;
      this.innerHTML=`<a class="next-stop" href="#/${data[4]}"><span><small>CONTINUE THE JOURNEY</small>${data[5]}</span><b>→</b></a>`;
    }
  }
  class Reader extends HTMLElement {
    static get observedAttributes(){return ['place'];}
    connectedCallback(){this.queue();}
    attributeChangedCallback(){if(this.isConnected)this.queue();}
    disconnectedCallback(){cancelAnimationFrame(this.frame);this.events?.abort();this.observer?.disconnect();}
    queue(){if(this.closest('x-dc'))return;cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(()=>this.setup());}
    setup(){
      this.events?.abort();this.observer?.disconnect();this.events=new AbortController();
      const headings=Array.from(this.closest('main').querySelectorAll('h1,h2')).filter(el=>el.offsetHeight&&el.textContent.trim());
      this.hidden=headings.length<2;if(this.hidden)return;
      this.innerHTML='<div class="reader-line"><span>FIELD JOURNAL</span><div class="reader-path" aria-hidden="true"><img src="./assets/signal/walker.svg" alt=""></div><label><span>Jump to section</span><select aria-label="Jump to case study section"></select></label></div>';
      const article=this.closest('main'),track=this.querySelector('.reader-path');
      const walk=()=>{const rect=article.getBoundingClientRect(),p=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height-innerHeight)));track.style.setProperty('--walk',(100*p).toFixed(1)+'%');};walk();
      window.addEventListener('scroll',walk,{passive:true,signal:this.events.signal});
      const menu=this.querySelector('select');headings.forEach((el,i)=>menu.add(new Option((i===0?'Overview':el.textContent.trim()),String(i))));
      menu.addEventListener('change',()=>headings[+menu.value]?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}),{signal:this.events.signal});
      this.observer=new IntersectionObserver(()=>{let i=0;while(i+1<headings.length&&headings[i+1].getBoundingClientRect().top<innerHeight*.45)i++;if(document.activeElement!==menu)menu.value=String(i);},{rootMargin:'-12% 0px -52% 0px'});
      headings.forEach(el=>this.observer.observe(el));
    }
  }
  customElements.define('signal-journey',Journey);customElements.define('signal-banner',Banner);customElements.define('signal-next',Next);customElements.define('signal-reader',Reader);
})();
