const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {runInNewContext}=require('node:vm');
const scope={window:{}};
runInNewContext(readFileSync(require.resolve('../assets/signal/arcade-engine.js'),'utf8'),scope);
const {Run,FLOOR}=scope.window.FieldRun;

test('each course can be cleared by ordinary movement and jumps',()=>{
  for(let n=0;n<7;n++){
    let cleared=false;
    for(let lead=9;lead<30&&!cleared;lead+=2){
      const r=new Run(n);let hold=0;
      for(let f=0;f<2500&&!r.done&&!r.retries;f++){
        const gap=r.ground.slice(0,-1).some(g=>r.x>=g.x+g.w-lead&&r.x<g.x+g.w+5);
        const beetle=r.bugs.some(b=>b.alive&&b.x-r.x>5&&b.x-r.x<50);
        if((gap||beetle)&&r.grounded&&!hold)hold=60;
        r.step({right:true,jump:hold>0});hold=Math.max(0,hold-1);
      }
      cleared=r.done&&!r.retries&&r.events.includes('checkpoint')&&r.events.includes('finish');
    }
    assert.ok(cleared,'stage '+(n+1));
  }
});
test('tap jump is lower than a held jump',()=>{
  function peak(hold){const r=new Run(0);let min=FLOOR;for(let f=0;f<120;f++){r.step({jump:f<hold});min=Math.min(min,r.y)}return min}
  assert.ok(peak(45)<peak(4)-15);
});
test('falling returns to the activated checkpoint and keeps collected pages',()=>{
  const r=new Run(0,[0]);r.x=r.post;r.step({});assert.equal(r.checkpoint,r.post);
  r.x=r.ground[0].w+18;r.y=259;r.step({});assert.equal(r.x,r.post);assert.equal(r.retries,1);assert.equal(r.coins[0].taken,true);
});
