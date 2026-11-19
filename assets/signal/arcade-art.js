/* Fieldwork Run: original foreground tiles and animated pixel sprites.
   Positions are logical pixels; characters and signs are anchored at the feet. */
(() => {
  'use strict';
  const ink='#243f32',paper='#fff4bd';
  const terrains=[
    ['#e0d75b','#799b40','#537635','#bb9852','#886d3e','#e4bd69'], // planted fields
    ['#f2cd64','#a38443','#555c46','#72705a','#495446','#aaa183'], // bottling line
    ['#f3e4a8','#b5bc83','#70815d','#cabd90','#948d6d','#e6d7ae'], // campus paving
    ['#f2c26b','#b78449','#7b5936','#a47947','#775836','#d5a05c'], // toy workshop
    ['#c8dab1','#83aa85','#4d7767','#829280','#596f68','#adbd9c'], // software campus
    ['#cbd768','#8caa64','#55745c','#788575','#4d685b','#a9b49a'], // lab
    ['#cde2a4','#81b18b','#436f62','#698c79','#466757','#a3c3a3']  // data studio
  ];
  const pal=t=>terrains[t]||terrains[0];
  const rect=(c,x,y,w,h,col)=>{if(w<=0||h<=0)return;c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const local=(c,x,y,dir,draw)=>{c.save();c.translate(Math.round(x),Math.round(y));if(dir<0)c.scale(-1,1);draw((x,y,w,h,col)=>rect(c,x,y,w,h,col));c.restore();};
  function ground(c,x,y,width,theme=0){
    const w=Math.ceil(width);if(w<1)return;
    const [hi,top,edge,body,shade,fleck]=pal(theme);
    c.save();c.translate(Math.round(x),Math.round(y));c.beginPath();c.rect(0,0,w,100);c.clip();
    const b=(x,y,w,h,col)=>rect(c,x,y,w,h,col);
    b(0,0,w,100,body);b(0,0,w,2,hi);b(0,2,w,3,top);b(0,5,w,2,edge);b(0,7,w,2,shade);
    if(theme===0){
      for(let p=0;p<w;p+=23){b(p+3,1,7,1,'#f0e483');b(p+4,5,5,2,top);b(p+7,7,2,2,edge);b(p+10,3,4,1,edge);}
      for(let row=0;row<5;row++){for(let p=(row%2?-13:2);p<w;p+=35){const yy=12+row*16+(Math.abs(p+row)%5);b(p+8,yy,6,2,shade);b(p+7,yy,4,1,fleck);b(p+21,yy+5,3,2,shade);}}
    }else if(theme===3){
      for(let row=0;row<7;row++){const yy=9+row*14;b(0,yy,w,1,shade);for(let p=(row%2?-23:0);p<w;p+=49){b(p,yy,2,14,shade);b(p+4,yy+3,2,1,ink);b(p+7,yy+8,15,1,fleck);b(p+23,yy+7,9,1,fleck);}}
    }else if(theme===2){
      for(let row=0;row<6;row++){const yy=9+row*16;b(0,yy,w,1,shade);for(let p=(row%2?-18:0);p<w;p+=38){b(p,yy,1,16,shade);b(p+2,yy+1,33,1,fleck);b(p+8,yy+8,4,1,shade);}}
    }else{
      for(let p=0;p<w;p+=32){
        b(p,2,1,4,edge);b(p+2,8,1,90,shade);b(p+3,9,1,88,fleck);b(p+6,12,2,2,shade);b(p+27,12,2,2,shade);
        if(theme===1){for(let i=0;i<3;i++)b(p+8+i*5,16,2,5,shade);b(p+8,23,14,1,fleck);}
        else if(theme===6){b(p+8,17,10,1,fleck);b(p+17,18,1,6,fleck);b(p+17,23,6,1,fleck);b(p+21,22,3,3,hi);}
        else {b(p+9,17,15,2,shade);b(p+9,20,15,1,fleck);if(theme===5)b(p+24,25,3,2,hi);}
      }
    }
    c.restore();
  }
  function platform(c,x,y,width,kind,theme){
    const w=Math.ceil(width);if(w<1)return;const [hi,top,edge]=pal(theme);
    c.save();c.translate(Math.round(x),Math.round(y));c.beginPath();c.rect(0,0,w,14);c.clip();
    const b=(x,y,w,h,col)=>rect(c,x,y,w,h,col);
    b(0,0,w,9,ink);
    if(kind==='wood'){
      b(1,1,w-2,2,'#e3bc6a');b(1,3,w-2,4,'#b68345');b(2,7,w-4,2,'#795d37');
      for(let p=0;p<w;p+=14){b(p,1,1,7,'#755636');b(p+3,3,1,1,ink);b(p+6,4,4,1,'#ca9a58');}
      b(3,9,5,2,ink);b(w-8,9,5,2,ink);
    }else if(kind==='lift'){
      b(1,1,w-2,2,'#f4cf61');b(1,3,w-2,4,'#657c61');for(let p=4;p<w;p+=12){b(p,1,4,1,ink);b(p-1,2,4,1,ink);b(p+3,5,3,1,'#c4d293');}
      for(const p of [4,w-9]){b(p,8,5,3,'#53654f');b(p+1,11,3,1,'#eabd52');}
    }else{
      b(1,1,w-2,2,hi);b(1,3,w-2,4,top);b(2,7,w-4,1,edge);
      for(let p=0;p<w;p+=15){b(p,1,1,3,edge);b(p+6,5,1,3,edge);b(p+1,4,14,1,edge);}
    }c.restore();
  }
  function token(c,x,y,t=0){
    local(c,x,y,1,b=>{
      b(-5,-6,9,13,'#674d26');b(-3,-8,6,2,'#674d26');b(4,-4,2,10,'#674d26');
      b(-4,-5,7,10,'#ce8d2f');b(-2,-7,5,2,'#ffde67');b(-3,-5,7,9,'#ffe166');b(-2,4,6,1,'#e9b943');
      b(-2,-4,5,1,paper);b(-1,-2,3,1,'#9f752e');b(-1,0,4,1,'#bb862d');b(-1,2,2,1,'#bb862d');
      if(Math.floor(t*3)%4===0){b(5,-7,3,1,paper);b(6,-8,1,3,paper);}
    });
  }
  function beetle(c,x,y,t=0,dir=1,theme=0){
    local(c,x,y,dir,b=>{
      const phase=Math.floor(t*9)%2,accent=theme===1?'#f4c858':'#e4a541';
      for(const p of [-6,-1,4]){const f=(p===-1?1-phase:phase);b(p,-4,2,3,ink);b(p-f,-2,3,2,ink);}
      b(-8,-8,15,5,ink);b(-6,-11,11,3,ink);b(-4,-12,7,2,ink);b(-7,-8,12,3,'#aa6540');
      b(-5,-10,10,3,accent);b(-3,-11,5,2,'#f6c65c');b(-2,-10,1,5,'#9b712f');b(-5,-7,2,1,'#724d32');
      b(4,-9,5,5,ink);b(6,-8,2,1,paper);b(8,-11,1,3,ink);b(9,-12,2,1,ink);
      b(-7,-5,10,1,'#d29d50');
    });
  }
  function flag(c,x,y,t=0,theme=0){
    local(c,x,y,1,b=>{
      const flap=Math.floor(t*3)%2;
      b(-5,-3,11,3,ink);b(-3,-5,7,2,'#897641');b(-1,-35,3,30,ink);b(0,-34,1,28,'#c3a667');
      b(-2,-38,4,4,ink);b(-1,-37,2,2,'#ffdb5a');
      b(2,-33,11,12,ink);b(12,-33+flap,7,10,ink);b(18,-32+flap,5,7,ink);
      b(2,-32,10,10,'#f7cf4d');b(12,-32+flap,6,8,'#e3b740');b(18,-31+flap,3,5,'#d5ac3b');
      b(5,-30,3,2,'#427541');b(8,-28,2,2,'#427541');b(5,-26,3,2,'#427541');
      b(-3,-1,7,1,pal(theme)[1]);
    });
  }
  function sign(c,x,y,label=''){
    const s=String(label).slice(0,23);c.save();c.font='bold 7px monospace';const w=Math.max(18,Math.ceil(c.measureText(s).width)+10);
    local(c,x,y,1,b=>{b(-2,-14,4,14,'#5a5437');b(-1,-14,1,14,'#aa8750');b(-w/2,-22,w,13,ink);b(-w/2+1,-21,w-2,10,'#ead690');b(-w/2+2,-20,w-4,1,'#f8ebb0');
      c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';c.fillText(s,0,-15);});c.restore();
  }
  function player(c,x,y,t=0,dir=1,state='idle'){
    const run=state==='run',air=state==='jump'||state==='fall',phase=Math.floor(t*12)%4;
    local(c,x,y,dir,b=>{
      // Boots remain anchored while the pack, face and torso move as one mass.
      const stride=run?[0,3,0,-3][phase]:0,lead=air?2:stride,trail=air?-2:-stride;
      b(-3+trail,-6,3,air?3:5,'#365742');b(-4+trail,air?-4:-2,4,2,ink);
      b(1+lead,air?-7:-6,3,air?3:5,'#344638');b(1+lead,air?-5:-2,5,2,ink);
      c.translate(0,run&&phase%2?-1:0);
      b(-3,-14,8,9,ink);b(-2,-14,6,7,'#e69c32');b(0,-13,3,1,'#f8c264');b(-2,-7,6,1,'#b7792b');
      b(-7,-14,5,8,ink);b(-6,-13,3,6,'#4c7951');b(-6,-12,3,1,'#9fbb7b');b(-5,-8,2,1,'#638753');
      const swing=air?-3:run&&phase===1?-1:0;
      b(3,-13+swing,3,4,'#ffce63');b(4,-10+swing,3,3,'#b47843');
      b(-2,-20,7,6,'#443e2d');b(0,-19,5,5,'#bf824c');b(4,-17,2,2,'#cf9459');b(3,-18,1,1,ink);b(0,-14,3,1,'#a56b3a');
      b(-2,-23,6,3,ink);b(-3,-21,8,2,'#3b623e');b(-3,-20,10,1,ink);b(-1,-22,4,1,'#678359');
    });
  }
  window.FieldArcadeArt=Object.freeze({ground,platform,token,beetle,flag,sign,player});
})();
