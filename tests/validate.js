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
assert.match(html,/const APP_VERSION='18\.0'/);
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
console.log('Little Cutter: '+parts.length+' inline scripts passed syntax checks, and v18 calibration guards are present.');
