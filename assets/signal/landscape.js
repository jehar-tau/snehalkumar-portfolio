/* Seven original low-resolution sets. The landscape is cached while ambient
   details and the walking character play on a separate foreground layer. */
(() => {
  const rand=n=>{const t=Math.sin(n*127.1+311.7)*43758.5453;return t-Math.floor(t)};
  const ink='#183f30', leaf='#37743c', grain='#ebcc59', light='#fff1a8';
  function brush(c){
    const box=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
    const poly=(pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x|0,y|0):c.moveTo(x|0,y|0));c.closePath();c.fill()};
    const line=(x,y,xx,yy,col,d=1)=>{let n=Math.max(1,Math.ceil(Math.max(Math.abs(xx-x),Math.abs(yy-y))));for(let i=0;i<=n;i++)box(x+(xx-x)*i/n,y+(yy-y)*i/n,d,d,col)};
    const oval=(x,y,rx,ry,col)=>{for(let j=-ry;j<=ry;j++){let r=Math.sqrt(Math.max(0,1-(j/ry)**2))*rx;box(x-r,y+j,Math.max(1,2*r),1,col)}};
    return {box,poly,line,oval};
  }
  // Broad, irregular mango canopies: branches remain visible below the leaves.
  function tree(g,x,y,h,seed,far=false){
    const {line,oval,box}=g;let sc=h/44;
    line(x,y,x+2*sc,y-28*sc,far?'#4d753e':'#68562f',Math.max(2,3*sc));
    line(x+1*sc,y-14*sc,x-10*sc,y-27*sc,far?'#4d753e':'#58512e',2*sc);
    line(x+2*sc,y-16*sc,x+13*sc,y-29*sc,far?'#4d753e':'#58512e',2*sc);
    for(let i=0;i<12;i++){let a=i*2.4,r=Math.sqrt(i/12),xx=x+Math.cos(a)*r*17*sc, yy=y-31*sc+Math.sin(a)*r*8*sc;
      oval(xx,yy,Math.max(2,(9+rand(seed+i)*5)*sc),Math.max(2,Math.round((5+rand(i+32)*4)*sc)),far?'#598344':'#285b36')}
    for(let i=0;i<19;i++){let a=i*2.4,r=Math.sqrt(i/19),xx=x-2*sc+Math.cos(a)*r*18*sc,yy=y-36*sc+Math.sin(a)*r*7*sc;
      oval(xx,yy,Math.max(2,(4+rand(seed+i)*4)*sc),Math.max(1,Math.round(3*sc)),far?'#759446':i%4?'#548b39':'#779d3b')}
    if(!far)for(let i=0;i<29;i++){let a=i*2.4,r=Math.sqrt(i/29);box(x+Math.cos(a)*r*18*sc,y-36*sc+Math.sin(a)*r*7*sc,2*sc,sc,i%4?'#88a63f':'#c5ca56')}
  }
  function farm(g){
    const {box,poly,line,oval}=g;
    tree(g,49,2,74,53);tree(g,-52,-1,42,28);
    oval(-4,0,57,5,'#64763a');
    // Plaster walls, deep veranda, a clay-tile hip roof and turquoise joinery.
    poly([[-44,-28],[-18,-35],[33,-28],[33,-2],[-44,0]],'#f4dc91');
    poly([[19,-26],[36,-31],[36,-5],[19,-1]],'#d4ac69');
    box(-40,-23,55,21,'#efd994');box(-40,-5,60,4,'#ac7047');
    box(-32,-18,9,10,'#315e52');box(-34,-19,13,2,'#ffedac');line(-28,-18,-28,-8,'#89b177');
    box(-15,-21,11,19,'#346858');box(-13,-19,7,17,'#204b3c');box(-8,-11,1,2,'#e8ce71');
    box(4,-18,8,10,'#336c55');line(7,-17,7,-10,'#98ad70');
    poly([[-51,-24],[-37,-44],[14,-48],[29,-29],[19,-24]],'#974b30');
    poly([[-37,-44],[14,-48],[4,-31],[-51,-24]],'#bc6234');
    poly([[14,-48],[40,-36],[43,-28],[28,-25],[4,-31]],'#9e4c2c');
    for(let i=0;i<13;i++)line(-37+i*4,-43-i*.3,-48+i*4,-26-i*.4,i%3?'#d67d41':'#e3924d');
    line(-49,-25,3,-31,'#743d2b',2);line(3,-31,29,-26,'#713f2a',2);
    poly([[-39,-13],[-35,-18],[17,-21],[21,-16]],'#ba753d');line(-39,-13,21,-16,'#84522e');
    for(let j=0;j<4;j++)box(-36+j*18,-14-j*.5,2,14+j*.5,'#9b703c');
    box(-43,0,66,2,'#ebc780');box(-19,2,20,2,'#d9bb76');box(-17,4,22,2,'#b7a361');
    // Stone well, pulley and earthen pots at the edge of the courtyard.
    oval(47,2,9,3,'#6e7646');box(38,-3,18,6,'#ada47b');oval(47,-3,9,3,'#dad2a1');oval(47,-3,6,2,'#4b6548');
    box(40,-15,2,12,'#71603a');box(52,-15,2,12,'#71603a');box(39,-16,16,2,'#7d6035');line(47,-15,47,-5,'#887143');
    oval(13,1,3,3,'#b75e36');box(11,-3,4,2,'#e59455');
  }
  function factory(g){
    const {box,poly,line,oval}=g;
    box(-41,-49,9,47,'#d0ad76');box(-39,-49,3,47,'#f6dba5');box(-43,-51,13,3,ink);
    box(-22,-60,8,53,'#ba8660');box(-20,-59,2,51,'#f0c490');for(let j=0;j<3;j++)box(-22,-54+j*11,8,3,'#a54936');
    box(-50,-26,97,26,'#a9b4a0');box(-50,-4,97,4,'#678476');
    for(let i=0;i<4;i++){let x=-50+i*24;poly([[x,-26],[x+22,-39],[x+24,-39],[x+24,-25]],'#678b83');line(x,-27,x+21,-39,'#dce1be',2)}
    box(-44,-21,59,16,'#33574f');box(18,-23,25,20,'#d6bd80');box(23,-17,14,14,'#9d4936');
    for(let i=0;i<7;i++){let x=-42+i*8;box(x,-11,4,5,'#cf6444');box(x+1,-14,2,4,'#eee2ac');box(x,-9,4,1,light)}
    box(-45,-5,61,2,'#eebe73');for(let i=0;i<5;i++)oval(-39+i*12,-2,2,2,'#254f43');
  }
  function campus(g){
    const {box,line,oval,poly}=g;
    tree(g,-52,1,45,31);tree(g,45,-2,52,44);
    // NID Bengaluru: pale cylindrical wing and glazed ribbon, orange
    // entrance overhang, and tall ochre tower as seen in NID's campus photos.
    box(-38,-41,51,36,'#edeed0');box(-38,-40,49,8,'#7fa39a');box(-38,-26,49,7,'#76998b');
    for(let j=0;j<6;j++)box(-36+j*8,-40,2,25,'#e9e9c5');
    box(2,-48,32,40,'#d8dfc4');oval(18,-48,16,4,'#fff2ba');
    for(let j=0;j<3;j++){let y=-45+j*13;oval(18,y+3,18,5,'#f5eed3');box(0,y,36,3,'#faf0ce');box(3,y+6,29,4,'#84a49b');box(16,y+6,1,4,'#cdd9bd')}
    box(-30,-59,12,48,'#dca63a');box(-19,-59,3,48,'#b58635');box(-28,-54,5,5,ink);box(-27,-53,3,3,'#dca63a');
    box(-39,-17,54,5,'#dc8136');box(-39,-12,54,2,'#ae6731');for(let i=0;i<3;i++)box(-35+i*18,-10,2,10,'#eee6c7');
    for(let i=0;i<3;i++)poly([[-30-i*4,-1+i*2],[18+i*2,-2+i*2],[23+i*2,i*2],[-34-i*4,1+i*2]],i%2?'#b8b499':'#dfdcbc');
  }
  function workshop(g){
    const {box,line,poly,oval}=g;box(-48,-39,91,39,'#c49054');box(-42,-34,79,30,'#755936');
    poly([[-52,-39],[-28,-52],[29,-52],[49,-39]],'#376443');line(-51,-39,47,-39,'#d6cc77',2);
    for(let i=0;i<4;i++){let x=-41+i*21;box(x,-32,18,11,'#a0b08c');box(x+2,-31,6,8,'#d4dbaa')}
    box(-51,-8,100,4,'#e6b257');box(-47,-4,4,6,'#80552c');box(40,-4,4,6,'#80552c');
    // Wooden pull-along elephant, ring stack and a row of coloured block toys.
    oval(-24,-16,8,6,'#659f94');box(-20,-23,8,9,'#82b6a2');box(-15,-17,4,7,'#82b6a2');box(-15,-21,1,1,ink);
    for(const x of [-30,-20])oval(x,-10,3,3,'#d89848');
    box(-1,-27,2,19,'#cfac69');for(let k=0;k<4;k++)box(-7+k,-12-k*3,14-k*2,3,['#bc6040','#edbd50','#7f9c5c','#e7dca1'][k]);
    for(let j=0;j<3;j++)box(13+j*6,-14,5,6,['#a5c982','#dda751','#c96c49'][j]);poly([[21,-15],[25,-21],[29,-15]],'#d9bf67');
  }
  function digital(g,stop){
    const {box,line,oval,poly}=g;
    const paper='#e2e7b1', glass='#589988', hi='#a4c5a0';
    if(stop===4){
      // A workplace made from glass wings with an open, shaded atrium.
      for(let j=0;j<2;j++){let x=-49+j*57;box(x,-44+j*11,39,44-j*11,j?glass:'#53867c');
        for(let k=0;k<4;k++)box(x+2+k*9,-42+j*11,2,40-j*11,hi);
        for(let k=0;k<3;k++)box(x,-37+j*11+k*12,39,2,paper)}
      poly([[-12,-21],[9,-26],[12,-21],[-12,-15]],'#d2c37b');box(-10,-16,2,16,ink);box(6,-20,2,20,ink);tree(g,45,1,24,53);
    }else if(stop===5){
      // A stepped engineering lab, kit silhouette, and connected workstations.
      box(-48,-28,90,28,'#e0d9ac');box(-30,-40,61,12,glass);box(-15,-46,28,6,'#87aa92');
      for(let i=0;i<5;i++){box(-43+i*17,-23,12,14,ink);box(-42+i*17,-22,9,7,glass);box(-40+i*17,-21,4,2,'#c2d895')}
      line(21,-40,25,-58,ink,2);line(25,-58,29,-40,ink,2);line(19,-52,31,-52,'#759685',2);box(-51,-6,97,2,'#9caa70');
    }else{
      // The canopy and its node-link mural echo Precisely's lineage diagrams.
      poly([[-53,-34],[-28,-44],[39,-44],[51,-37],[51,-33]],'#638567');box(-48,-34,94,33,'#94af8d');box(-42,-30,66,24,'#264d43');
      const pts=[[-37,-19],[-22,-25],[-21,-13],[-6,-20],[8,-14],[17,-24]];for(const [a,b] of [[0,1],[0,2],[1,3],[2,3],[3,4],[4,5]])line(...pts[a],...pts[b],'#a4bf7b');
      pts.forEach(([x,y],i)=>box(x-2,y-2,5,4,i%2?'#ead478':'#8dbf91'));box(29,-28,11,27,'#497968');box(31,-25,7,12,'#95bd9a');
      box(-49,-3,94,3,paper);tree(g,48,0,32,11);
    }
  }
  function backdrop(c,w,h,travel,game=false){
    const g=brush(c),{box,oval,poly,line}=g;const cam=travel*w*.78;
    const sky=c.createLinearGradient(0,0,0,h*.72);sky.addColorStop(0,'#a9cc84');sky.addColorStop(.45,'#f4dd88');sky.addColorStop(1,'#ffe6a2');c.fillStyle=sky;c.fillRect(0,0,w,h);
    const sun=w*.74-Math.sin(travel)*w*.045;oval(sun,h*.22,h*.091,Math.round(h*.091),'#fff4b0');
    for(let i=0;i<22;i++){let x=((rand(i+14)*w-cam*.07)%(w+45)+w+45)%(w+45)-22,y=rand(i+21)*h*.39;box(x,y,11+rand(i)*24,1,'#f9ebac');box(x+6,y-2,7+rand(i+13)*12,2,'#f6e6a0')}
    // Flat-topped Deccan escarpments, with stepped basalt ledges and fields.
    for(const [n,level,col,shade] of [[0,.57,'#abbc71','#a3b36d'],[1,.66,'#8ea559','#809a51'],[2,.74,'#749347','#678b42']]){
      const step=92+n*28,off=cam*(.1+n*.11),start=Math.floor(off/step)-2;
      for(let i=start;i<start+w/step+4;i++){let x=i*step-off,y=h*level,top=y-(.08+.10*rand(i+51*n))*h, k=step*(.29+.08*rand(i+9));
        poly([[x-step*.4,y],[x-5,top+12],[x+4,top+11],[x+11,top],[x+k,top-1],[x+k+4,top+4],[x+k+15,top+5],[x+step*.71,y-4],[x+step*1.1,y],[x+step*1.1,h],[x-step*.4,h]],col);
        poly([[x+k,top],[x+k+16,top+5],[x+step*.71,y-4],[x+step*.53,y],[x+k+6,top+13]],shade);
        box(x+11,top+2,Math.max(6,k-12),1,'#b2bc70');
      }
    }
    box(0,h*.71,w,h*.29,'#aab653');
    for(let i=0;i<6;i++){let y=h*(.72+i*.03),d=6+i*3;poly([[-4,y],[w,y-d*.6],[w,y+d],[0,y+d*.5]],['#bbbd52','#9daf4b','#d7c15c','#a4b550','#779640','#90ad49'][i]);line(0,y+d*.5,w,y+d,'#788e3e')}
    for(let i=0;i<18;i++){let x=((i*97+rand(i)*67-cam*.47)%(w+90)+w+90)%(w+90)-40,y=h*(.70+rand(i+20)*.055);tree(g,x,y,(7+rand(i)*8)*h/244,i,true)}
    for(let i=0;i<17;i++){let x=i*w/11-cam*.28%w;line(x,h*.76,x-80,h*.88,'#b8b756',2)}
    const narrow=w/h<1.45,s=h/244*(narrow?.79:1.14),mid=w*(narrow?.64:.75),base=h*(narrow?.855:.824);
    for(let i=0;i<7;i++){let x=mid+(i-travel)*Math.max(w*.92,s*165);if(x+s*85<0||x-s*85>w)continue;
      c.save();c.translate(Math.round(x),Math.round(base));c.scale(s,s);oval(2,2,65,6,'#a1a14a');if(i===0)farm(g);else if(i===1)factory(g);else if(i===2)campus(g);else if(i===3)workshop(g);else digital(g,i);c.restore()}
    if(game)return;
    // Foreground side of the field: stalks, seed heads and an ochre footpath.
    let path=h*.939;box(0,path-3,w,h-path+4,'#517d36');box(0,path,w,3,'#c3a34f');box(0,path+3,w,3,'#a4813f');box(0,path+6,w,h,'#537b35');
    for(let i=0;i<w*.32;i++){let x=((i*13+rand(i)*19-cam) %w+w)%w,y=path-2+rand(i+18)*2,hh=(1+rand(i+44)*5)*h/244;line(x,y,x-2,y-hh,'#76903a');box(x-3,y-hh,2,2,i%3?'#c4b947':'#e5c85b')}
    for(let i=0;i<w*.33;i++){let x=((i*17-cam)%w+w)%w;box(x,path+9+rand(i+21)*5,2,1,'#779943')}
    if(!narrow){tree(g,w*.998-cam*.13%13,path,59*h/244,73);tree(g,-15,path+2,48*h/244,90)}
  }
  function walker(g,x,y,t,walk){
    const {box}=g,step=walk?(Math.floor(t*9)%4):0;g.oval(x,y,7,1,'#8d833f');x=Math.round(x);y=Math.round(y)-(step===1||step===3?1:0);
    box(x-3-(step===1?2:0),y-5,3,5,'#284836');box(x+1+(step===3?2:0),y-5,3,5,ink);
    box(x-3,y-12,7,8,'#e49c32');box(x+2,y-11,3,5,'#fbd374');box(x+3,y-6,2,2,'#ad673d');
    box(x-6,y-11,4,7,'#336043');box(x-6,y-10,3,1,'#8ba363');box(x-1,y-17,6,5,'#ae6b3e');box(x+4,y-15,2,2,'#c08049');
    box(x-2,y-19,6,3,'#2c4933');box(x-3,y-17,8,2,'#344332');box(x-2,y-16,2,3,'#493e27');
  }
  window.FieldScenery=(context,width,height,travel)=>backdrop(context,width,height,travel,true);
  window.SignalLandscape=class {
    constructor(canvas,compact=false){
      this.canvas=canvas;this.compact=compact;this.bg=document.createElement('canvas');this.travel=this.target=0;this.last=0;this.visible=false;this.dirty=true;
      this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.paint=this.paint.bind(this);this.wake=this.wake.bind(this);
      this.resize=new ResizeObserver(()=>{this.dirty=true;this.wake()});this.resize.observe(canvas);
      this.observer=new IntersectionObserver(([v])=>{this.visible=v.isIntersecting;this.wake()});this.observer.observe(canvas);
      this.motion.addEventListener('change',this.wake);document.addEventListener('visibilitychange',this.wake);
    }
    set(n){this.target=Math.min(6,Math.max(0,n));this.wake()}
    wake(){if(this.visible&&!document.hidden&&!this.frame)this.frame=requestAnimationFrame(this.paint)}
    paint(ms){
      this.frame=0;if(!this.visible||document.hidden)return;if(ms-this.last<55){this.wake();return}this.last=ms;
      const cv=this.canvas,h=this.compact?144:244,w=Math.max(1,Math.round(cv.clientWidth/Math.max(1,cv.clientHeight)*h)),delta=this.target-this.travel,moving=Math.abs(delta)>.001;
      if(moving)this.travel=this.motion.matches||Math.abs(delta)<.01?this.target:this.travel+delta*.19;
      if(this.dirty||moving||cv.width!==w||cv.height!==h){cv.width=this.bg.width=w;cv.height=this.bg.height=h;backdrop(this.bg.getContext('2d'),w,h,this.travel);this.dirty=false}
      const c=cv.getContext('2d'),g=brush(c),t=this.motion.matches?0:ms*.001;c.drawImage(this.bg,0,0);
      const z=h/244*(this.compact?1.25:1.05);c.save();c.translate(Math.round(w*(.54+.034*Math.sin(this.travel))),Math.round(h*.941));c.scale(z,z);walker(g,0,0,t,moving);c.restore();
      for(let i=0;i<4;i++){let x=(w*(.58+rand(i)*.3)+t*(1+i*.25))%(w+22),y=h*(.15+rand(i+4)*.18)+Math.sin(t+i)*.8;let v=(Math.floor(t*2+i)%3===0)?1:-1;g.line(x-3,y+v,x,y,'#536f45');g.line(x,y,x+3,y+v,'#536f45')}
      if(!this.motion.matches&&!this.compact)this.wake()
    }
    destroy(){cancelAnimationFrame(this.frame);this.resize.disconnect();this.observer.disconnect();this.motion.removeEventListener('change',this.wake);document.removeEventListener('visibilitychange',this.wake)}
  };
})();
