// Fixed-step platform physics in world pixels. Works independently of screen size.
(() => {
  const FLOOR=199, SPEED=156, JUMP=294, GRAVITY=790, DT=1/120;
  const chapters=[
    ['The farm path','Cross the irrigation channel.',1160,[[482,535]],[[185,171,91],[320,148,76],[630,170,92],[755,147,92]],[],[875],[[224,153],[352,130],[807,129]]],
    ['The bottling line','Ride the loading pallet.',1330,[[412,473],[876,943]],[[210,169,83],[505,169,76],[765,170,75],[990,149,77]],[[900,165,68,28]],[617,1120],[[249,151],[533,150],[1023,131]]],
    ['The campus steps','Climb the courtyard terraces.',1320,[[599,661],[984,1053]],[[195,170,72],[291,143,83],[395,117,93],[514,144,64],[706,168,84],[830,140,89],[1084,166,87]],[],[745],[[322,124],[445,98],[875,121]]],
    ['The toy workshop','Jump on a clockwork beetle to bounce.',1400,[[508,569],[1007,1081]],[[188,169,83],[315,146,90],[636,169,80],[758,142,63],[1112,164,86]],[[931,151,69,33]],[410,816,1208],[[352,128],[785,123],[1153,145]]],
    ['The client desk','Take the high route between records.',1430,[[412,477],[817,892],[1138,1202]],[[189,170,70],[288,143,81],[501,165,90],[623,139,85],[945,170,66],[1042,145,78]],[[840,163,54,23]],[671,1265],[[324,124],[659,120],[1081,125]]],
    ['Journey builder','Follow the moving platforms.',1470,[[458,531],[844,923],[1172,1248]],[[176,170,80],[291,143,87],[570,168,77],[705,141,75],[975,168,86],[1285,166,68]],[[487,167,60,29],[879,148,66,34]],[645,1058],[[330,123],[738,122],[1317,147]]],
    ['The data trail','Trace the final path to the flag.',1540,[[448,523],[848,924],[1212,1291]],[[178,170,77],[285,143,73],[382,118,64],[565,166,77],[680,140,71],[981,170,73],[1089,143,77],[1332,168,85]],[[884,159,69,33],[1250,157,60,24]],[609,1016,1398],[[409,100],[716,122],[1125,125]]]
  ];
  const clamp=(v,a,b)=>Math.max(a,Math.min(v,b));
  class Run{
    constructor(n=0,collected=[]){
      this.n=n;const [name,hint,length,gaps,ledges,lifts,bugs,coins]=chapters[n];
      Object.assign(this,{name,hint,length,t:0,x:38,y:FLOOR,vx:0,vy:0,dir:1,grounded:true,coyote:.09,buffer:0,jumpHeld:false,platform:null,done:false,retries:0,checkpoint:38,events:[]});
      let from=0;this.ground=[];for(const [a,b] of gaps){this.ground.push({x:from,y:FLOOR,w:a-from});from=b}this.ground.push({x:from,y:FLOOR,w:length-from});
      this.platforms=ledges.map(([x,y,w],i)=>({x,y,w,kind:n===2||i%2?'brick':'wood'})).concat(lifts.map(([x,y,w,range])=>({x,base:x,y,w,range,kind:'lift'})));
      this.bugs=bugs.map(x=>({base:x,x,y:FLOOR,alive:true,dir:1}));this.coins=coins.map(([x,y],i)=>({x,y,taken:collected.includes(i)}));
      const mid=this.ground.find(g=>g.x>length*.34&&g.w>95);this.post=mid?mid.x+23:Math.floor(length*.56);this.finish=length-46;
    }
    step(input,dt=DT){
      if(this.done)return;this.t+=dt;
      for(const p of this.platforms)if(p.range){const old=p.x;p.x=p.base+p.range*Math.sin(this.t*1.8);if(this.platform===p)this.x+=p.x-old}
      if(input.jump&&!this.jumpHeld)this.buffer=.12;
      if(!input.jump&&this.jumpHeld&&this.vy< -125)this.vy=-125;
      this.jumpHeld=input.jump;this.buffer-=dt;this.coyote=this.grounded?.09:this.coyote-dt;
      if(this.buffer>0&&this.coyote>0){this.vy=-JUMP;this.grounded=false;this.platform=null;this.coyote=this.buffer=0;this.events.push('jump')}
      const axis=Number(!!input.right)-Number(!!input.left),target=axis*SPEED;
      this.vx+=clamp(target-this.vx,-900*dt,900*dt);if(axis)this.dir=axis;
      this.x=clamp(this.x+this.vx*dt,7,this.length-8);let prev=this.y;
      this.vy=Math.min(440,this.vy+GRAVITY*dt);this.y+=this.vy*dt;this.grounded=false;this.platform=null;
      for(const p of [...this.platforms,...this.ground])if(this.vy>=0&&prev<=p.y+.01&&this.y>=p.y&&this.x+4>p.x&&this.x-4<p.x+p.w){this.y=p.y;this.vy=0;this.grounded=true;this.platform=p;break}
      for(const [i,c] of this.coins.entries())if(!c.taken&&Math.abs(this.x-c.x)<12&&Math.abs(this.y-11-c.y)<19){c.taken=true;this.events.push('page:'+i)}
      for(const bug of this.bugs){if(!bug.alive)continue;bug.x=bug.base+22*Math.sin(this.t*2);bug.dir=Math.cos(this.t*2)>0?1:-1;
        if(Math.abs(this.x-bug.x)<13&&this.y>bug.y-14&&this.y-20<bug.y){if(this.vy>0&&prev<=bug.y-10){bug.alive=false;this.vy=-235;this.grounded=false;this.events.push('bounce')}else{this.respawn();return}}}
      if(this.y>258){this.respawn();return}
      if(this.x>=this.post&&this.grounded&&this.checkpoint===38){this.checkpoint=this.post;this.events.push('checkpoint')}
      if(this.x>=this.finish){this.done=true;this.events.push('finish')}
    }
    respawn(){this.x=this.checkpoint;this.y=FLOOR;this.vy=this.vx=this.buffer=0;this.grounded=true;this.platform=null;this.retries++;this.events.push('retry')}
  }
  window.FieldRun={Run,chapters,DT,FLOOR};
})();
