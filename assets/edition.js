// The two complete portfolio presentations share routes and project data.
(() => {
  const query = new URLSearchParams(location.search);
  const green = query.get('view') === 'fieldwork' || ['fieldwork','fieldwork-arcade'].includes(query.get('preview'));
  window.isFieldworkEdition = green;
  document.documentElement.dataset.edition = green ? 'fieldwork' : 'classic';
  function style(path) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = './assets/' + path;
    document.head.append(link);
  }
  const key='portfolio-classic-appearance';
  const system=matchMedia('(prefers-color-scheme: dark)');
  const valid=v=>v==='light'||v==='dark'?v:null;
  let choice=valid(query.get('theme'));
  if(!choice){try{choice=valid(localStorage.getItem(key))}catch{}}
  const current=()=>green?'game':choice||(system.matches?'dark':'light');
  function sync() {
    if(!green){
      document.documentElement.dataset.theme=current();
      document.querySelector('meta[name="theme-color"]').content=current()==='dark'?'#0c0b09':'#fafaf8';
    }
    for(const el of document.querySelectorAll('portfolio-mode'))el.refresh?.();
  }
  function change(next){
    const url=new URL(location.href);
    url.searchParams.delete('preview');url.searchParams.delete('theme');
    if(next==='game'){url.searchParams.set('view','fieldwork');location.assign(url.href);return}
    choice=valid(next);if(!choice)return;
    try{localStorage.setItem(key,choice)}catch{url.searchParams.set('theme',choice)}
    if(green){url.searchParams.delete('view');location.assign(url.href);return}
    if(url.href!==location.href)history.replaceState(history.state,'',url.href);
    sync();
  }
  const modes = [
    ['light','Light','<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'],
    ['dark','Dark','<path d="M20.6 14A8.8 8.8 0 0 1 10 3.4 8.8 8.8 0 1 0 20.6 14Z"/>'],
    ['game','Game Style','<path d="M7.4 6.7h9.2c2.1 0 3.6 1.5 4.1 3.6l1.1 5.3c.6 3-1.8 4.6-4 2.7l-2.4-2.1H8.6l-2.4 2.1c-2.2 1.9-4.6.3-4-2.7l1.1-5.3c.5-2.1 2-3.6 4.1-3.6Z"/><path d="M7.5 9.4v4m-2-2h4"/><circle fill="currentColor" stroke="none" cx="15.6" cy="12.2" r="1"/><circle fill="currentColor" stroke="none" cx="18.1" cy="10" r="1"/>']
  ].map(([value,label,paths])=>({value,label,icon:'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+paths+'</svg>'}));
  let nextId=0;
  customElements.define('portfolio-mode',class extends HTMLElement {
    connectedCallback(){
      if(this.closest('x-dc')||this.events)return;
      const id='portfolio-mode-options-'+(++nextId);
      this.innerHTML='<button type="button" class="mode-trigger" aria-controls="'+id+'" aria-expanded="false"></button><div class="mode-options" id="'+id+'" role="group" aria-label="Portfolio modes" hidden>'+modes.map(m=>'<button type="button" data-mode="'+m.value+'" aria-label="'+m.label+'" title="'+m.label+'">'+m.icon+'</button>').join('')+'</div>';
      this.trigger=this.querySelector('.mode-trigger');this.group=this.querySelector('.mode-options');
      this.events=new AbortController();const opt={signal:this.events.signal};
      this.trigger.addEventListener('click',()=>this.expand(),opt);
      this.group.addEventListener('click',e=>{
        const next=e.target.closest('[data-mode]')?.dataset.mode;if(!next)return;
        this.collapse(true);if(next!==current())change(next);
      },opt);
      this.addEventListener('keydown',e=>{
        if(this.group.hidden)return;
        if(e.key==='Escape'){e.preventDefault();this.collapse(true);return}
        const buttons=[...this.group.children],i=buttons.indexOf(document.activeElement);
        const dest={ArrowLeft:(i+2)%3,ArrowRight:(i+1)%3,Home:0,End:2}[e.key];
        if(dest!==undefined){e.preventDefault();buttons[dest].focus()}
      },opt);
      document.addEventListener('pointerdown',e=>{if(!this.contains(e.target))this.collapse(false)},opt);
      this.addEventListener('focusout',e=>{if(e.relatedTarget&&!this.contains(e.relatedTarget))this.collapse(false)},opt);
      this.refresh();
    }
    refresh(){
      if(!this.trigger)return;
      const mode=modes.find(m=>m.value===current());
      this.trigger.innerHTML=mode.icon;
      this.trigger.setAttribute('aria-label','Choose portfolio mode. Current: '+mode.label);
      this.trigger.title='Portfolio mode: '+mode.label;
      for(const b of this.group.children)b.setAttribute('aria-pressed',String(b.dataset.mode===mode.value));
    }
    expand(){
      this.setAttribute('data-open','');this.trigger.setAttribute('aria-expanded','true');
      this.group.hidden=false;this.trigger.hidden=true;
      this.group.querySelector('[aria-pressed=true]').focus({preventScroll:true});
    }
    collapse(focus){
      if(this.group.hidden)return;
      this.removeAttribute('data-open');this.trigger.setAttribute('aria-expanded','false');
      this.trigger.hidden=false;this.group.hidden=true;if(focus)this.trigger.focus({preventScroll:true});
    }
    disconnectedCallback(){this.events?.abort();this.events=null;}
  });
  system.addEventListener('change',sync);
  window.addEventListener('storage',e=>{if(e.key===key||e.key===null){choice=valid(e.newValue);sync()}});
  window.addEventListener('pageshow',e=>{if(e.persisted){try{choice=valid(localStorage.getItem(key))}catch{}sync()}});
  style('mode.css');sync();
  if(!green){style('classic.css');return}
  document.title = 'Fieldwork — Snehalkumar Shinde, Senior Product Designer';
  document.querySelector('meta[name="theme-color"]').content = '#194935';
  style('signal/story.css'); style('signal/fieldwork.css');
  for (const file of ['landscape','chapters','story','fieldnotes']) {
    const script = document.createElement('script');
    script.async = false; script.src = './assets/signal/' + file + '.js';
    document.head.append(script);
  }
})();
