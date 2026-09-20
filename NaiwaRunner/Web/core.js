(function(root){
'use strict';
const POWERS={
 magnet:{name:'金币磁铁',icon:'magnet',color:'#ff6476',duration:14,description:'14 秒内吸附附近三条跑道上的金币。'},
 shield:{name:'能量护盾',icon:'shield',color:'#5acbff',duration:18,description:'持续 18 秒，抵挡一次碰撞。'},
 jet:{name:'喷气背包',icon:'rocket',color:'#c198ff',duration:8,description:'升空 8 秒，越过障碍并收集空中金币。'},
 boots:{name:'弹跳跑鞋',icon:'shoe',color:'#6eeab1',duration:18,description:'18 秒内跳得更高，可以跃上车顶。'},
 double:{name:'双倍积分',icon:'star',color:'#ffdd62',duration:20,description:'20 秒内获得双倍距离积分。'},
 board:{name:'磁悬浮滑板',icon:'board',color:'#69eeec',duration:25,description:'双击屏幕或按 B 使用，25 秒内抵挡一次碰撞。'}
};
const MAPS=[
 {name:'晴空车站',tag:'城市出发站',country:'城市',sky:0x9adbdc,ground:0x87bda1,wall:0xf3dba9,accent:0x13958f,kind:'city',icon:'building'},
 {name:'樱花列车',tag:'樱色漫游',country:'日本',sky:0xc4deef,ground:0xdbbeca,wall:0xf2d3d3,accent:0xd6688c,kind:'sakura',icon:'flower'},
 {name:'灯火长安',tag:'古城夜行',country:'中国',sky:0x253e65,ground:0x547578,wall:0xd9a875,accent:0xc9443a,kind:'temple',icon:'temple'},
 {name:'金沙秘境',tag:'沙漠寻宝',country:'埃及',sky:0xf4d29b,ground:0xd9aa65,wall:0xf1c877,accent:0x308f9d,kind:'pyramid',icon:'sun'},
 {name:'海风狂想',tag:'热带海岸',country:'巴西',sky:0x82dfe9,ground:0xe3d39c,wall:0xf4c791,accent:0xeb754b,kind:'palm',icon:'palm'},
 {name:'粉城巡游',tag:'彩色宫殿',country:'印度',sky:0xf2cfae,ground:0xc39c87,wall:0xe7ac9d,accent:0xa4629f,kind:'dome',icon:'temple'},
 {name:'云端都会',tag:'霓虹天际线',country:'都会',sky:0x293c66,ground:0x4c697b,wall:0x7c9bab,accent:0x68e0ed,kind:'tower',icon:'building'},
 {name:'雪国快线',tag:'极地假日',country:'雪国',sky:0xc2dceb,ground:0xe2edf3,wall:0x94b4c1,accent:0x537db5,kind:'snow',icon:'snow'},
 {name:'枫叶街角',tag:'温柔秋日',country:'枫叶',sky:0xe8d6b1,ground:0xbc9b70,wall:0xe6b277,accent:0xb95838,kind:'autumn',icon:'leaf'},
 {name:'海岛假期',tag:'落日环岛线',country:'海岛',sky:0xeebbb9,ground:0xd9c28b,wall:0xf4d4b1,accent:0x6b8fa0,kind:'island',icon:'palm'}
];
const SKINS=[
 {name:'经典奶娃',color:'#ffffff',accent:'#ffb54b',price:0,item:'none'},
 {name:'街头车手',color:'#ffffff',accent:'#12a7ac',price:150,item:'cap'},
 {name:'草莓汽水',color:'#ffe1e8',accent:'#ed769d',price:220,item:'cap'},
 {name:'星际旅人',color:'#dae8ff',accent:'#8971dc',price:320,item:'pack'},
 {name:'海岸探险',color:'#fff4dc',accent:'#ea8e4e',price:250,item:'pack'},
 {name:'薄荷侠客',color:'#d8ffe8',accent:'#3bba91',price:380,item:'cape'},
 {name:'樱色假日',color:'#ffe9ee',accent:'#cc649c',price:280,item:'bow'},
 {name:'冰川信使',color:'#dbf4ff',accent:'#5ca2d8',price:420,item:'scarf'},
 {name:'午夜绅士',color:'#e6e2fa',accent:'#394367',price:500,item:'hat'},
 {name:'黄金冠军',color:'#fff5d2',accent:'#ffc842',price:650,item:'crown'},
 {name:'赤焰队长',color:'#ffe8d8',accent:'#ed624a',price:550,item:'cape'},
 {name:'晴空领航',color:'#ecfff6',accent:'#199aa4',price:480,item:'scarf'}
];
const MISSIONS=[
 {id:'daily-distance',name:'今日里程',desc:'累计奔跑 1,000 米',key:'distance',goal:1000,reward:100},
 {id:'daily-coins',name:'金币收集',desc:'收集 80 枚金币',key:'coins',goal:80,reward:80},
 {id:'daily-powers',name:'道具收集',desc:'拾取 5 个道具',key:'powers',goal:5,reward:100},
 {id:'daily-jumps',name:'跳跃训练',desc:'完成 20 次跳跃',key:'jumps',goal:20,reward:80},
 {id:'daily-runs',name:'完成局数',desc:'完成 3 局跑酷',key:'runs',goal:3,reward:120}
];
function dateKey(){const d=new Date();return [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');}
function profile(raw={}){
 raw=raw&&typeof raw==='object'?raw:{};const n=(v,f=0)=>Number.isFinite(v)?Math.max(0,Math.floor(v)):f;
 const owned=[...new Set([0,...(Array.isArray(raw.owned)?raw.owned:[]).filter(x=>Number.isInteger(x)&&SKINS[x])])];
 const daily=raw.daily&&raw.daily.date===dateKey()?raw.daily:{};
 return {version:2,coins:n(raw.coins),boards:n(raw.boards,3),best:n(raw.best),bestScore:n(raw.bestScore),runs:n(raw.runs),totalCoins:n(raw.totalCoins),totalDistance:n(raw.totalDistance),owned,skin:owned.includes(raw.skin)?raw.skin:0,map:Number.isInteger(raw.map)&&MAPS[raw.map]?raw.map:0,sound:raw.sound!==false,volume:Math.min(1,Math.max(0,Number.isFinite(raw.volume)?raw.volume:.5)),quality:['high','low'].includes(raw.quality)?raw.quality:'high',
 daily:{date:dateKey(),distance:n(daily.distance),coins:n(daily.coins),powers:n(daily.powers),jumps:n(daily.jumps),runs:n(daily.runs),claimed:Array.isArray(daily.claimed)?daily.claimed.filter(id=>MISSIONS.some(m=>m.id===id)):[]},history:Array.isArray(raw.history)?raw.history.slice(0,10).filter(x=>x&&Number.isFinite(x.distance)&&Number.isFinite(x.coins)&&Number.isFinite(x.score)&&MAPS[x.map]):[]};
}
function refreshDay(p){if(p.daily.date!==dateKey())p.daily={date:dateKey(),distance:0,coins:0,powers:0,jumps:0,runs:0,claimed:[]};}
function claim(p,id){refreshDay(p);const m=MISSIONS.find(x=>x.id===id);if(!m||p.daily.claimed.includes(id)||p.daily[m.key]<m.goal)return false;p.daily.claimed.push(id);p.coins+=m.reward;return true;}
function purchase(p,index){const s=SKINS[index];if(!s)return false;if(!p.owned.includes(index)){if(p.coins<s.price)return false;p.coins-=s.price;p.owned.push(index);}p.skin=index;return true;}
function buyBoards(p){if(p.coins<100)return false;p.coins-=100;p.boards+=3;return true;}
class Run{
 constructor(random=Math.random){this.random=random;this.reset();}
 reset(){this.state='menu';this.distance=0;this.score=0;this.coins=0;this.speed=28;this.time=0;this.lane=0;this.x=0;this.y=0;this.vy=0;this.slide=0;this.floor=0;this.chase=0;this.invincible=0;this.objects=[];this.effects={magnet:0,shield:0,jet:0,boots:0,double:0,board:0};this.spawnAt=0;this.row=0;this.nextID=1;this.settled=false;this.stats={powers:0,jumps:0,slides:0,boards:0};this.map=0;}
 start(map=0){this.reset();this.map=map;this.state='running';for(let d=65;d<200;d+=38)this.spawn(d);this.spawnAt=38;}
 object(type,lane,d,extra={}){const o={id:this.nextID++,type,lane,d,y:0,...extra};this.objects.push(o);return o;}
 spawn(d=195){
  const safe=Math.floor(this.random()*3)-1;const obstacleLanes=[-1,0,1].filter(x=>x!==safe);const row=this.row++;
  for(const lane of obstacleLanes){
   const t=this.random();let type=t<.40?'train':t<.70?'low':t<.90?'bar':'wall';
   if(row===0)type='low';const o=this.object(type,lane,d,{variant:row%3,length:type==='train'?14:1.2});
   if(type==='train'&&row%2===0){
    this.object('ramp',lane,d-9.5,{length:5});
    for(let i=0;i<4;i++)this.object('coin',lane,d-5+i*3,{y:3.5});
   }
  }
  for(let i=0;i<7;i++)this.object('coin',safe,d-10+i*3.5,{y:1});
  if(row%3===1){const list=['magnet','shield','boots','double','jet'];this.object(list[Math.floor(row/3)%list.length],safe,d-17,{y:1.3});}
 }
 action(a,p){
  if(this.state!=='running')return false;
  if(a==='left'){this.lane=Math.max(-1,this.lane-1);return true;}
  if(a==='right'){this.lane=Math.min(1,this.lane+1);return true;}
  if(a==='jump'&&Math.abs(this.y-this.floor)<.05&&this.vy===0&&this.slide<=0&&this.effects.jet<=0){this.vy=this.effects.boots>0?14.5:10.7;this.stats.jumps++;return true;}
  if(a==='slide'&&this.y-this.floor<.05&&this.vy===0&&this.effects.jet<=0){this.slide=.85;this.stats.slides++;return true;}
  if(a==='board'&&p&&p.boards>0&&this.effects.board<=0&&this.effects.jet<=0){p.boards--;this.effects.board=POWERS.board.duration;this.stats.boards++;return true;}
  return false;
 }
 pause(){if(this.state==='running')this.state='paused';}
 resume(){if(this.state==='paused')this.state='running';}
 hit(o,events){
  o.hit=true;if(this.invincible>0)return;
  if(this.effects.shield>0){this.effects.shield=0;this.invincible=1.3;events.push('shield-break');return;}
  if(this.effects.board>0){this.effects.board=0;this.invincible=1.3;events.push('board-break');return;}
  if(this.chase>0){this.state='over';events.push('crash');}
  else{this.chase=7;this.invincible=1.2;events.push('chase');}
 }
 tick(dt){
  const events=[];if(this.state!=='running')return events;
  dt=Math.max(0,Math.min(.05,dt));this.time+=dt;this.speed=Math.min(48,28+this.time*20/38);
  const travel=this.speed*dt;this.distance+=travel;this.score+=travel*(this.effects.double>0?2:1);
  this.x+=(this.lane-this.x)*Math.min(1,dt*15);this.slide=Math.max(0,this.slide-dt);this.chase=Math.max(0,this.chase-dt);this.invincible=Math.max(0,this.invincible-dt);
  const wasFlying=this.effects.jet>0;
  for(const k of Object.keys(this.effects))this.effects[k]=Math.max(0,this.effects[k]-dt);
  if(wasFlying&&this.effects.jet===0)this.invincible=Math.max(this.invincible,1.5);
  for(const o of this.objects){o.previous=o.d;o.d-=travel;}
  this.floor=0;
  for(const o of this.objects){
   if(o.hit||Math.abs(o.lane-this.x)>.45)continue;
   if(o.type==='ramp'&&Math.abs(o.d)<2.7&&this.vy<=0)this.floor=Math.max(this.floor,(2.5-Math.max(-2.5,o.d))/5*2.7);
   if(o.type==='train'&&Math.abs(o.d)<7.35&&this.y>=2.55)this.floor=2.7;
  }
  if(this.effects.jet>0){this.y+=(7-this.y)*Math.min(1,dt*8);this.vy=0;this.slide=0;}
  else{if(this.y>this.floor||this.vy!==0){this.y+=this.vy*dt;this.vy-=26*dt;}if(this.y<=this.floor){this.y=this.floor;this.vy=0;}}
  this.spawnAt-=travel;if(this.spawnAt<=0){this.spawn();this.spawnAt+=38;}
  for(const o of this.objects){
   if(o.hit)continue;const same=Math.abs(o.lane-this.x)<.48;
   if(o.type==='coin'){
    const magnet=this.effects.magnet>0&&o.d<15&&o.d> -2;
    const flying=this.effects.jet>0&&o.d<10&&o.d> -2;
    if(magnet||flying||(same&&o.d<1&&o.previous> -1&&Math.abs(this.y+1-o.y)<1.25)){o.hit=true;this.coins++;events.push('coin');}
   }else if(POWERS[o.type]){
    if(same&&o.d<1&&o.previous> -1&&this.y<3.6){o.hit=true;this.effects[o.type]=POWERS[o.type].duration;this.stats.powers++;events.push(o.type);if(o.type==='jet'){for(let j=0;j<35;j++)this.object('coin',(j%3)-1,15+j*5,{y:8});}}
   }else if(o.type!=='ramp'){
    const extent=o.type==='train'?7:.65;
    if(!same||o.d>extent+.4||o.previous< -extent-.4||this.effects.jet>0)continue;
    const clears=o.type==='train'?this.y>=2.5:o.type==='low'?this.y>=1:o.type==='bar'?(this.slide>0&&this.y<.4)||this.y>=2.6:this.y>=3.1;
    if(!clears)this.hit(o,events);
    if(this.state==='over')break;
   }
  }
  this.objects=this.objects.filter(o=>o.d> -23&&!o.hit);
  return events;
 }
 settle(p){
  if(this.settled||this.state==='menu')return false;this.settled=true;refreshDay(p);
  const d=Math.floor(this.distance),s=Math.floor(this.score);p.coins+=this.coins;p.totalCoins+=this.coins;p.totalDistance+=d;p.best=Math.max(p.best,d);p.bestScore=Math.max(p.bestScore,s);p.runs++;
  p.daily.distance+=d;p.daily.coins+=this.coins;p.daily.powers+=this.stats.powers;p.daily.jumps+=this.stats.jumps;p.daily.runs++;
  p.history.unshift({distance:d,score:s,coins:this.coins,map:this.map,date:Date.now()});p.history=p.history.slice(0,10);return true;
 }
}
const api={POWERS,MAPS,SKINS,MISSIONS,profile,purchase,buyBoards,claim,refreshDay,Run};
if(typeof module!=='undefined')module.exports=api;root.NaiwaCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
