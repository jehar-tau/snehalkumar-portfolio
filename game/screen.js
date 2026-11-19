// Only this page mounts a game. Both modes read the same story chapters.
(() => {
  const raw=new URL(location.href).searchParams.get('stage');
  const stage=/^[1-7]$/.test(raw)?Number(raw)-1:0;
  const game=document.createElement('field-arcade');
  game.startAt=stage;
  game.chapters=window.FieldworkChapters.map(chapter=>({...chapter,path:'../?view=fieldwork'+chapter.path}));
  game.addEventListener('stage-change',event=>{
    const url=new URL(location.href);
    if(event.detail===0)url.searchParams.delete('stage');else url.searchParams.set('stage',event.detail+1);
    history.replaceState(null,'',url);
  });
  document.querySelector('#cabinet').append(game);
})();
