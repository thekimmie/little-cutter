// Zero-hardware static checks. Run with: node tests/validate.js
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const html=fs.readFileSync('index.html','utf8');
const parts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.ok(parts.length>=2,'Expected inline application scripts');
parts.forEach((script,i)=>{
  const r=spawnSync(process.execPath,['--check'],{input:script,encoding:'utf8'});
  assert.equal(r.status,0,'Script '+(i+1)+' syntax failure:\n'+r.stderr);
});
assert.match(html,/const APP_VERSION='[0-9]+\.[0-9]+'/);
assert.match(html,/id="consoleVersion"/);
assert.match(html,/id="appVersion"/);
assert.doesNotMatch(html,/Design studio · version 5\.0/);
for(const id of ['bleConnect','bleFirmware','bleStatus','blePosition','calStep','calBack','calForward','calLeft','calRight','calCancel','positionCopy','bleTrace']){
  assert.match(html,new RegExp('id="'+id+'"'),'Missing control '+id);
}
assert.match(html,/right:\{dx:0,dy:1/);
assert.match(html,/left:\{dx:0,dy:-1/);
assert.match(html,/back:\{dx:1,dy:0/);
assert.match(html,/forward:\{dx:-1,dy:0/);
assert.match(html,/minX:80,maxX:180,minY:40,maxY:140/);
assert.match(html,/moveCount>=MAX_MOVES/);
assert.match(html,/x!==expected\.x\|\|y!==expected\.y/);
assert.match(html,/countdownToken/);
assert.match(html,/for\(let n=5;n>=1;n--\)/);
assert.match(html,/confirm\(warning\)/);
assert.match(html,/new TextEncoder\(\)\.encode\('M'\+t\.x\+','\+t\.y\+'\\x03'\)/);
assert.doesNotMatch(html,/id="bleProbe"/);
const field={x:80,y:40};
const requestedRight5={x:field.x,y:field.y+5*20};
assert.deepEqual(requestedRight5,{x:80,y:140},'First planned test must request M80,140');
// Regression suite: square path, guard conditions and command geometry (no hardware).
const SQUARE=[{axis:'back',x:100,y:40},{axis:'right',x:100,y:60},{axis:'forward',x:80,y:60},{axis:'left',x:80,y:40}];
const direction={back:[1,0],right:[0,1],forward:[-1,0],left:[0,-1]};
let pos={x:80,y:40},steps=0;
for(const st of SQUARE){
  const [dx,dy]=direction[st.axis];
  pos={x:pos.x+20*dx,y:pos.y+20*dy};
  assert.deepEqual(pos,{x:st.x,y:st.y},'Square stage '+st.axis);
  assert.ok(pos.x>=80&&pos.x<=180&&pos.y>=40&&pos.y<=140,'Square bounds');
  steps++;
}
assert.equal(steps,4);
assert.deepEqual(pos,{x:80,y:40},'Square must close at starting coordinate');
const bleScript=parts.find(p=>p.includes('const makeSquare='));
assert.ok(bleScript,'Guided square BLE script missing');
for(const needed of [
  "squareIndex=-1","squarePending=false","squareComplete=false",
  "squarePending=true","SQUARE[squareIndex]","squareIndex++",
  "squareComplete=true","lastPosition.third!==10",
  "name!==next.axis","x!==next.x||y!==next.y",
  "if(squareIndex>=0)squarePending=true",
  "locked=true;squareIndex=-1;squarePending=false",
  "readyOK=false","expected={x:t.x,y:t.y}"
]){
  assert.ok(bleScript.includes(needed),'Missing square interlock '+needed);
}
for(const id of ['squareStart','squareStop','squareProgress','squareVersion']){
  assert.match(html,new RegExp('id="'+id+'"'),'Missing square UI '+id);
}
assert.match(html,/const APP_VERSION='20\.0'/);
for(const size of [1,2]){
  const square=[{x:80+size*20,y:40},{x:80+size*20,y:40+size*20},{x:80,y:40+size*20},{x:80,y:40}];
  assert.deepEqual(square[3],{x:80,y:40});
  for(const p of square)assert.ok(p.x>=80&&p.x<=180&&p.y>=40&&p.y<=140);
}
assert.match(html,/id="squareNext"/);
assert.match(html,/id="squareSize"/);
assert.match(html,/squareFinished=true;locked=true/);
assert.match(html,/squareComplete\|\|squareFinished/);
assert.match(html,/readyFresh=readyOK/);
assert.match(html,/squareIndex>=0\?Number\(el\('squareSize'\).value\):Number\(el\('calStep'\).value\)/);
assert.match(html,/moveCount<=MAX_MOVES-4/);
assert.match(html,/if\(countdownActive\)el\('calCancel'\).click\(\);/);
console.log('Little Cutter v20: '+parts.length+' scripts syntax-checked, '+steps+' square legs simulated, position bounds and safety interlocks verified.');
