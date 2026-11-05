const observed={"v":1,"settings":{"sound":false,"vol":0.5,"motion":"on","text":130,"theme":"auto","difficulty":0,"qLen":120,"shotClock":35,"assist":true,"touch":"auto","graphics":"auto","replays":true},"season":null,"trophies":[],"unlocks":{"throwback":false},"best":{"shootout":33},"challenges":{}};

const KEY='hsg-hoops-v1';
const raw=p=>p.evaluate(k=>localStorage.getItem(k),KEY);
const read=async p=>JSON.parse(await raw(p));
const project=s=>({season:s.season,trophies:s.trophies,unlocks:s.unlocks,best:s.best,challenges:s.challenges});
const eq=(t,a,b,m)=>t.equal(JSON.stringify(a),JSON.stringify(b),m);
const put=(p,s)=>p.evaluate(([k,s])=>localStorage.setItem(k,typeof s==='string'?s:JSON.stringify(s)),[KEY,s]);
async function ui(p,a,arg){await p.locator('[data-act="'+a+'"]'+(arg==null?'':'[data-arg="'+arg+'"]')).first().click();await p.waitForTimeout(30);}
async function load(t,s){await put(t.page,s);await t.page.reload();await t.page.waitForFunction(()=>window.__game?.getState().scene==='title');}
async function tab(t){const p=await t.page.context().newPage();await p.goto(t.origin+'/index.html');await p.waitForFunction(()=>window.__game?.getState().scene==='title');return p;}
const test=(name,run)=>({name:'save integration fixture: '+name,viewports:['desktop'],run});
export const tests=[
test('stale settings preserve latest fields and do not undo external clear',async t=>{
 // Explicit source-observed v1 fixture plus synthetic progress fields; no earned-play claim.
 await load(t,observed);const b=await tab(t),latest=structuredClone(observed);
 latest.best.shootout=64;latest.settings.text=130;latest.challenges={fixture:true};latest.unlocks={throwback:true};latest.trophies=[{school:'hot-springs',program:'girls',label:'Legacy',record:'6-0'}];
 await put(t.page,latest);await ui(b,'settings');await ui(b,'setSound','0');
 const saved=await read(b);eq(t,project(saved),project(latest),'stale setting retains latest complete progress');t.equal(saved.settings.text,130,'unrelated newer text preference retained');
 await b.evaluate(k=>localStorage.removeItem(k),KEY);await ui(b,'setText','115');const cleared=await read(b);
 t.equal(cleared.best.shootout,0,'preference does not resurrect cleared cached best');eq(t,cleared.trophies,[],'cleared trophies stay absent');eq(t,cleared.challenges,{},'cleared completions stay absent');t.equal(cleared.unlocks.throwback,false,'cleared unlock stays absent');await b.close();
}),
test('whole-season conflict and explicit new-season replacement',async t=>{
 const seeded=structuredClone(observed);seeded.trophies=[{school:'hot-springs',program:'girls',label:'Legacy',record:'6-0'}];await load(t,seeded);
 await ui(t.page,'seasonSetup');await ui(t.page,'startSeason');const b=await tab(t);await ui(t.page,'simSeason');const first=await read(t.page);
 await ui(b,'continueSeason');await ui(b,'title');await ui(b,'settings');await ui(b,'setSound','0');eq(t,(await read(b)).season,first.season,'settings preserves current season verbatim');
 await ui(b,'back');await ui(b,'continueSeason');await ui(b,'simSeason');eq(t,(await read(b)).season,first.season,'stale season advance rejected without mixing snapshots');t.expect(/changed in another tab/i.test(await b.locator('#screen').innerText()),'clear conflict warning');
 await ui(b,'title');await ui(b,'seasonSetup');await ui(t.page,'simSeason');const second=await read(t.page);await ui(b,'startSeason');
 t.equal(await b.evaluate(()=>window.__game.getState().scene),'seasonSetup','changed setup stays for renewed acknowledgement');eq(t,(await read(b)).season,second.season,'first changed-season Start does not replace newer data');
 await ui(b,'startSeason');const fresh=await read(b);t.equal(fresh.season.idx,0,'acknowledged new season starts at zero');t.expect(fresh.season.games.every(g=>g.result===null),'new schedule has no old results');t.equal(fresh.best.shootout,33,'new season preserves best');eq(t,fresh.trophies,seeded.trophies,'legacy banners preserved');await b.close();
}),
test('read failures and failed writes retain explicit intents until success',async t=>{
 await load(t,observed);const latest=structuredClone(observed);latest.best.shootout=64;await put(t.page,latest);await ui(t.page,'settings');
 await t.page.evaluate(k=>{window.__fixtureGet=Storage.prototype.getItem;Storage.prototype.getItem=function(key){if(key===k)throw Error('fixture read failure');return window.__fixtureGet.call(this,key);};},KEY);
 await ui(t.page,'setSound','1');t.equal(await t.page.evaluate(k=>JSON.parse(window.__fixtureGet.call(localStorage,k)).best.shootout,KEY),64,'failed read does not authorize cached overwrite');
 await t.page.evaluate(()=>{Storage.prototype.getItem=window.__fixtureGet;});
 for(const invalid of ['{bad json',JSON.stringify({v:2,best:{shootout:999}})]){await put(t.page,invalid);await ui(t.page,'setText','115');t.equal(await raw(t.page),invalid,'malformed/unknown record untouched');}
 await put(t.page,latest);await ui(t.page,'setText','130');t.equal((await read(t.page)).settings.sound,true,'pending changed preference survives failed reads');t.equal((await read(t.page)).best.shootout,64,'latest progress preserved on recovery');
 await t.game('newGame',{mode:'shootout',seed:7,paused:true});
 await t.page.evaluate(k=>{window.__fixtureSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,v){if(key===k)throw Error('fixture write failure');return window.__fixtureSet.call(this,key,v);};},KEY);
 await t.game('setState',{shootout:{score:80,t:0,phase:'end',phaseT:1}});await t.game('step',1);
 t.equal((await read(t.page)).best.shootout,64,'failed write retains old stored value');
 await t.page.evaluate(()=>{Storage.prototype.setItem=window.__fixtureSet;});await ui(t.page,'title');await ui(t.page,'settings');await ui(t.page,'setText','115');
 t.equal((await read(t.page)).best.shootout,80,'explicit fixture score intent retained and written after recovery');
 await t.page.evaluate(k=>localStorage.removeItem(k),KEY);await ui(t.page,'setVol','0.8');t.equal((await read(t.page)).best.shootout,0,'successful intent consumed, not replayed after clear');
}),
test('season base advances only after storage accepts the snapshot',async t=>{
 await load(t,observed);await ui(t.page,'seasonSetup');await ui(t.page,'startSeason');const before=await read(t.page);
 await t.page.evaluate(k=>{window.__fixtureSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,v){if(key===k)throw Error('fixture write failure');return window.__fixtureSet.call(this,key,v);};},KEY);
 await ui(t.page,'simSeason');eq(t,(await read(t.page)).season,before.season,'failed season write leaves stored base exact');t.equal((await t.state()).season.idx,1,'memory simulation still playable');
 await t.page.evaluate(()=>{Storage.prototype.setItem=window.__fixtureSet;});await ui(t.page,'title');await ui(t.page,'settings');await ui(t.page,'setSound','1');t.equal((await read(t.page)).season.idx,1,'pending coherent snapshot flushes against original base');
 await ui(t.page,'back');await ui(t.page,'continueSeason');await ui(t.page,'simSeason');t.equal((await read(t.page)).season.idx,2,'next advance uses successfully written base');
})
,
{name:'pending championship award survives an explicitly started replacement season',viewports:['desktop'],async run(t){
 const p=t.page,key='hsg-hoops-v1',read=()=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 // Labelled fixture: score/result hooks exercise the actual award producer, not earned play.
 await p.evaluate(k=>localStorage.setItem(k,JSON.stringify({v:1,settings:{motion:'on'},season:null,best:{shootout:33},unlocks:{throwback:false},challenges:{},trophies:[{school:'hot-springs',program:'girls',label:'Legacy',record:'6-0'}]})),key);await p.reload();await p.waitForFunction(()=>window.__game?.getState().scene==='title');
 await t.game('newGame',{mode:'season',school:'hot-springs',program:'girls',length:'short',seed:41});
 for(let i=0;i<5;i++)await t.game('act','seasonResult',70,35);
 const before=await read();t.equal((await t.state()).season.next.round,'State final','fixture reaches championship before failed write');
 await p.evaluate(k=>{window.__fixtureAwardSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,v){if(key===k)throw Error('fixture award write failure');return window.__fixtureAwardSet.call(this,key,v);};},key);
 await t.game('act','seasonResult',70,35);const memory=await t.state();t.expect(memory.season.champion,'fixture reaches actual championship producer');t.equal(memory.trophies.length,2,'new award exists in memory');t.equal((await read()).trophies.length,1,'failed write leaves legacy stored array unchanged');
 await p.evaluate(()=>{Storage.prototype.setItem=window.__fixtureAwardSet;});
 await p.locator('[data-act="seasonSetup"]').first().click();await p.locator('[data-act="startSeason"]').click();const saved=await read();t.log('fixture-final-raw '+await p.evaluate(k=>localStorage.getItem(k),key));
 t.equal(saved.season.idx,0,'explicit new season replaces the coherent season');t.equal(saved.best.shootout,33,'unrelated best kept');t.equal(saved.trophies.length,2,'new pending award survives replacement');t.expect(saved.trophies.some(x=>x.seasonSeed===41&&x.school==='hot-springs'),'validated new championship award retained');t.equal(saved.trophies[0].label,'Legacy','distinct legacy trophy kept');
}},
test('conflicting season cannot leak a championship award through replacement',async t=>{
 // Labelled fixture: two loaded season snapshots and a rejected result hook, no earned play.
 const seeded=structuredClone(observed);seeded.trophies=[{school:'hot-springs',program:'girls',label:'Legacy',record:'6-0'}];await load(t,seeded);
 await t.game('newGame',{mode:'season',school:'hot-springs',program:'girls',length:'short',seed:51});
 for(let i=0;i<5;i++)await t.game('act','seasonResult',70,35);
 const b=await tab(t);await ui(b,'continueSeason');
 await ui(t.page,'title');await ui(t.page,'seasonSetup');await ui(t.page,'pickSchool','lakeside');await ui(t.page,'startSeason');const replacement=await read(t.page);
 await b.evaluate(k=>{window.__fixtureAwardSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,v){if(key===k)throw Error('fixture conflicting write');return window.__fixtureAwardSet.call(this,key,v);};},KEY);
 await b.evaluate(()=>window.__game.act('seasonResult',70,35));
 t.expect(!(await b.evaluate(()=>window.__game.getState())).season.champion,'conflicting branch not awarded');eq(t,(await read(b)).season,replacement.season,'other tab season kept');t.expect(/changed in another tab/i.test(await b.locator('#screen').innerText()),'conflict explained');
 await b.evaluate(()=>{Storage.prototype.setItem=window.__fixtureAwardSet;});
 await ui(b,'title');await ui(b,'seasonSetup');await ui(b,'startSeason');
 eq(t,(await read(b)).trophies,seeded.trophies,'no conflicting award promoted through new season');await b.close();
})
];
