'use strict';
/* 城西尋影 V8：地圖常駐、照片浮卡、選點即規劃步行路線。
   歷史介紹暫存在 STOPS.desc，日後可以換成 JSON 檔讀取。 */
const STOPS=[
 {id:'nishi-honganji',name:'西本願寺本堂',now:'今・西本願寺廣場／臺北市立文獻館',era:'1930年代',type:'monastery',lat:25.04006,lng:121.50690,radius:80,desc:'昔日的西本願寺本堂已經消失，現在仍可從現場遺構想像當年的寺院樣貌。',archive:'https://archive.tpml.edu.tw/TaipeiLib/wSite/ct?xItem=0&dataId=6617&ctNode=404&mp=3'},
 {id:'ximen-redhouse',name:'新起街市場',now:'今・西門紅樓',era:'1920年代',type:'market',lat:25.0420652,lng:121.5069348,radius:75,desc:'西門紅樓以前是一座市場。走到這裡，看看老照片裡熱鬧的新起街市場，和今日的街景有何不同。',archive:'https://archive.tpml.edu.tw/TaipeiLib/wSite/ct?xItem=0&dataId=6506&ctNode=404&mp=3'},
 {id:'new-world-cinema',name:'新世界大戲院',now:'今・漢中街116號一帶',era:'1950年代',type:'cinema',lat:25.04290,lng:121.50733,radius:75,desc:'昔日的戲院招牌與觀眾，記錄了西門町電影文化的一個年代。試著尋找當年戲院所在的街角。',archive:'https://archive.tpml.edu.tw/TaipeiLib/wSite/ct?xItem=0&dataId=6507&ctNode=404&mp=3'},
 {id:'zhonghua-market',name:'中華商場',now:'今・中華路一段部分路段',era:'1960年代',type:'mall',lat:25.04458,lng:121.50805,radius:110,desc:'中華商場曾是臺北人熟悉的商業地標。雖然連棟商場已拆除，老照片仍留下那片壯觀的街景。具體棟別仍待核對。',archive:'https://archive.tpml.edu.tw/TaipeiLib/wSite/ct?xItem=0&dataId=6494&ctNode=404&mp=3'},
 {id:'zhongshan-hall',name:'中山堂',now:'前身・臺北公會堂，今日仍為中山堂',era:'1970年',type:'hall',lat:25.04348,lng:121.50957,radius:85,desc:'中山堂見證臺北不同年代的城市生活。看看1970年的照片，找出建築外觀與周邊街道有哪些變化。',archive:'https://archive.tpml.edu.tw/TaipeiLib/wSite/ct?xItem=0&dataId=4007&ctNode=404&mp=3'},
 {id:'today-department',name:'今日百貨',now:'今・峨眉街52號一帶',era:'1986年',type:'dept',lat:25.04368,lng:121.50537,radius:80,desc:'1986年的今日百貨，留下昔日西門町的購物風景。到點打卡後，可以解鎖這一景的 AI 歷史動態影像。',archive:'https://archive.tpml.edu.tw/TaipeiLib/wSite/ct?xItem=0&dataId=7230&ctNode=404&mp=3'},
 {id:'bopiliao',name:'桂林路剝皮寮',now:'今・剝皮寮歷史街區',era:'1994年',type:'street',lat:25.03808,lng:121.50260,radius:85,desc:'昔日剝皮寮的街屋裡有真實的店家與生活。如今街區歷經修復，原本的街道氣息仍可從老照片中尋找。照片檔待補。',archive:'https://archive.tpml.edu.tw/TaipeiLib/wSite/ct?xItem=0&dataId=680&ctNode=404&mp=3'},
 {id:'longshan-temple',name:'艋舺龍山寺',now:'今・艋舺龍山寺／寺前廣場',era:'1950年代',type:'shrine',lat:25.03732,lng:121.49987,radius:90,desc:'早年的龍山寺前曾有不同的交通工具與街頭生活。從老照片看見廟前的舊日風景。照片檔待補。',archive:'https://archive.tpml.edu.tw/TaipeiLib/wSite/ct?xItem=0&dataId=6624&ctNode=404&mp=3'}
];
const ICONS={
 monastery:'<path d="M5 13 16 5 27 13M8 13v13h16V13M13 26v-8h6v8M5 13h22M11 9h10"/>',
 market:'<path d="M4 11 8 5h16l4 6M4 11h24v5H4zM7 16v11h18V16M12 16v11M4 11l4 5 4-5 4 5 4-5 4 5 4-5"/>',
 cinema:'<rect x="5" y="7" width="22" height="19" rx="1"/><circle cx="16" cy="16" r="6"/><circle cx="16" cy="16" r="1"/><path d="M6 4h20M4 28h24"/>',
 mall:'<path d="M6 27V8l10-4 10 4v19M6 11h20M11 14h3v4h-3zM18 14h3v4h-3zM11 21h3v5h-3zM18 21h3v5h-3z"/>',
 hall:'<path d="M3 12 16 4l13 8M5 12h22M7 16v10M13 16v10M19 16v10M25 16v10M4 27h24M5 15h22"/>',
 dept:'<path d="M6 27V5h20v22M4 27h24M10 9h4v5h-4zM18 9h4v5h-4zM10 17h4v5h-4zM18 17h4v5h-4zM14 27v-4h4v4"/>',
 street:'<path d="M3 25h26M6 25V11h8v14M18 25V7h8v18M9 15h2M9 19h2M21 11h2M21 15h2M21 19h2M3 11l7-5 6 5"/>',
 shrine:'<path d="M3 12 16 4 29 12M5 13h22M7 16v11h18V16M12 27v-7h8v7M11 9h10M4 28h24"/>'
};
const $=id=>document.getElementById(id);
const map=$('map'),tiles=$('tileLayer'),pins=$('pinLayer'),routeSVG=$('routeLayer');
const HOME={lat:25.041,lng:121.504};
let center={...HOME}, zoom=15, selected=null, user=null, watchId=null, preview=false, follow=false, lastGpsFocus=0, lastRouteStart=null, lastRouteTime=0;
let visited=new Set(), demoVisited=new Set(), announced=new Set();
let route=[], routeDistance=null, routeStatus='尚未選取目標', routeController=null, routeSeq=0, routeTimer=null, toastTimer=null;
const routeCache=new Map(), tileCache=new Map(), availableVideos=new Set(['today-department']);
const visitStorage='westcity-v4-visited';
try{let saved=JSON.parse(localStorage.getItem(visitStorage)||'[]');if(Array.isArray(saved))visited=new Set(saved.filter(id=>STOPS.some(s=>s.id===id)))}catch{}
const reached=id=>visited.has(id)||(preview&&demoVisited.has(id));
function notify(msg){clearTimeout(toastTimer);$('toast').textContent=msg;$('toast').classList.remove('hidden');toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),3200)}
function radians(d){return d*Math.PI/180}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function meters(a,b){const dLat=radians(b.lat-a.lat),dLon=radians(b.lng-a.lng),t=Math.sin(dLat/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(dLon/2)**2;return 12742000*Math.asin(Math.sqrt(Math.min(1,t)))}
function distanceText(v){return v>=1000?(v/1000).toFixed(1)+' 公里':Math.round(v)+' 公尺'}
function xy(lat,lng,z){const sin=Math.sin(radians(lat)),scale=256*2**z;return{x:(lng+180)/360*scale,y:(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*scale}}
function unxy(x,y,z){const scale=256*2**z;return {lng:x/scale*360-180,lat:Math.atan(Math.sinh(Math.PI*(1-2*y/scale)))*180/Math.PI}}
function screen(p){const a=xy(p.lat,p.lng,zoom),b=xy(center.lat,center.lng,zoom);return{x:map.clientWidth/2+a.x-b.x,y:map.clientHeight/2+a.y-b.y}}
function updateMap(){renderTiles();updateShapes();updatePins()}
function tileUrl(z,x,y){return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`}
let imgErrors=0;
setTimeout(()=>{if(![...tileCache.values()].some(img=>img.complete&&img.naturalWidth>0))$('mapWarning').classList.remove('hidden')},8000);
function renderTiles(){
 const w=map.clientWidth,h=map.clientHeight;if(!w||!h)return;
 const c=xy(center.lat,center.lng,zoom),size=2**zoom;
 const left=Math.floor((c.x-w/2)/256),top=Math.floor((c.y-h/2)/256),right=Math.ceil((c.x+w/2)/256),bottom=Math.ceil((c.y+h/2)/256);
 const visible=new Set();
 for(let i=left;i<=right;i++)for(let j=top;j<=bottom;j++){
  if(j<0||j>=size)continue;
  const x=((i%size)+size)%size,key=`${zoom}:${x}:${j}`;visible.add(key);
  let im=tileCache.get(key);
  if(!im){
   im=document.createElement('img');im.className='tile';im.alt='';im.decoding='async';im.dataset.key=key;
   im.onload=()=>{imgErrors=0;$('mapWarning').classList.add('hidden')};
   im.onerror=()=>{imgErrors++;if(imgErrors>=3)$('mapWarning').classList.remove('hidden')};
   im.src=tileUrl(zoom,x,j);tileCache.set(key,im);tiles.appendChild(im);
  }
  im.style.left=Math.round(i*256-(c.x-w/2))+'px';im.style.top=Math.round(j*256-(c.y-h/2))+'px';im.style.display='block';
 }
 for(const [key,im] of tileCache){if(!visible.has(key))im.style.display='none'}
 // Keep nearby previously loaded image nodes; do not set src again when returning to a site.
 // Bound memory in long sessions, letting the normal browser HTTP cache retain downloaded tiles.
 if(tileCache.size>250){for(const [key,im] of tileCache){if(tileCache.size<=175)break;if(!visible.has(key)){im.remove();tileCache.delete(key)}}}
}
function pinMarkup(s){return `<span class="poi-name">${s.name}</span><span class="poi-core"><svg viewBox="0 0 32 32" aria-hidden="true">${ICONS[s.type]||ICONS.hall}</svg></span><span class="poi-check">✓</span>`}
const pinNodes=new Map();
function initPins(){for(const s of STOPS){const btn=document.createElement('button');btn.className='poi';btn.innerHTML=pinMarkup(s);btn.setAttribute('aria-label','選擇尋影目標：'+s.name);btn.title=s.name;btn.addEventListener('click',e=>{e.stopPropagation();chooseStop(s.id)});pins.appendChild(btn);pinNodes.set(s.id,btn)}const dot=document.createElement('div');dot.id='liveUserDot';dot.className='user-dot hidden';pins.appendChild(dot)}
function updatePins(){
 // Cluster closely spaced historical sites, so one marker never covers another.
 for(const node of pins.querySelectorAll('.pin-cluster'))node.remove();
 const groups=[];
 for(const stop of STOPS){
  const p=screen(stop);let g=groups.find(g=>Math.hypot(p.x-g.x,p.y-g.y)<47);
  if(g){g.stops.push(stop);g.x=(g.x*(g.stops.length-1)+p.x)/g.stops.length;g.y=(g.y*(g.stops.length-1)+p.y)/g.stops.length}
  else groups.push({x:p.x,y:p.y,stops:[stop]})
 }
 for(const g of groups){
  if(g.stops.length===1){const stop=g.stops[0],p=screen(stop),node=pinNodes.get(stop.id);node.style.left=p.x+'px';node.style.top=p.y+'px';node.classList.toggle('selected',selected===stop.id);node.classList.toggle('done',reached(stop.id));node.style.visibility=(p.x<-50||p.x>map.clientWidth+50||p.y<-55||p.y>map.clientHeight+55)?'hidden':'visible'}
  else{
   for(const stop of g.stops)pinNodes.get(stop.id).style.visibility='hidden';
   const cluster=document.createElement('button');cluster.className='pin-cluster';cluster.textContent=g.stops.length;
   cluster.style.left=g.x+'px';cluster.style.top=g.y+'px';
   cluster.setAttribute('aria-label',`此處有${g.stops.length}個歷史地點，點擊放大查看`);
   cluster.title=g.stops.map(s=>s.name).join('、');
   cluster.onclick=e=>{e.stopPropagation();const middle=unxy(xy(center.lat,center.lng,zoom).x+(g.x-map.clientWidth/2),xy(center.lat,center.lng,zoom).y+(g.y-map.clientHeight/2)+65,zoom);center=middle;zoom=Math.min(19,zoom+2);follow=false;updateMap()};
   if(g.x>-40&&g.x<map.clientWidth+40&&g.y>-50&&g.y<map.clientHeight+50)pins.appendChild(cluster)
  }
 }
 const dot=$('liveUserDot');if(user){const p=screen(user);dot.style.left=p.x+'px';dot.style.top=p.y+'px';dot.classList.remove('hidden')}else dot.classList.add('hidden');
}

function updateShapes(){routeSVG.setAttribute('viewBox',`0 0 ${map.clientWidth||390} ${map.clientHeight||600}`);const pts=route.length?route.map(p=>{const a=screen(p);return `${a.x.toFixed(1)},${a.y.toFixed(1)}`}).join(' '):'';$('routeOutline').setAttribute('points',pts);$('routeLine').setAttribute('points',pts)}
function fitBounds(points,maxZoom=17){if(!points.length)return;let candidate=13;const w=map.clientWidth||360,h=map.clientHeight||620,padX=58,padTop=90,padBottom=selected?210:100;for(let z=maxZoom;z>=12;z--){const arr=points.map(p=>xy(p.lat,p.lng,z));const dx=Math.max(...arr.map(p=>p.x))-Math.min(...arr.map(p=>p.x));const dy=Math.max(...arr.map(p=>p.y))-Math.min(...arr.map(p=>p.y));if(dx<w-2*padX&&dy<h-padTop-padBottom){candidate=z;break}}zoom=candidate;const arr=points.map(p=>xy(p.lat,p.lng,zoom));const avgX=(Math.max(...arr.map(p=>p.x))+Math.min(...arr.map(p=>p.x)))/2;const avgY=(Math.max(...arr.map(p=>p.y))+Math.min(...arr.map(p=>p.y)))/2;const offset=(padBottom-padTop)/2;center=unxy(avgX,avgY+offset,zoom);updateMap()}
function fitAll(){follow=false;selected?fitBounds(STOPS,15):fitBounds(STOPS,16);$('locateBtn').classList.remove('active')}
function showMyPlace(){follow=true;$('locateBtn').classList.add('active');enableGPS();if(user){const stop=getStop();if(stop)fitBounds([user,stop],17);else{center={lat:user.lat,lng:user.lng};zoom=17;updateMap()}}}
function zoomBy(amount){const next=clamp(zoom+amount,12,19);if(next===zoom)return;zoom=next;follow=false;$('locateBtn').classList.remove('active');updateMap()}
function getStop(){return STOPS.find(s=>s.id===selected)}
function showCard(s){$('blankCard').classList.add('hidden');$('siteCard').classList.remove('hidden');$('mapInstruction').textContent='尋影目標：'+s.name+' · 定位後顯示步行路線';$('cardName').textContent=s.name;$('cardEra').textContent=s.era;$('cardStory').textContent=s.desc;let thumb=$('cardThumb');thumb.classList.remove('hidden');$('cardThumbEmpty').classList.add('hidden');thumb.dataset.fallback='';thumb.src='images/thumbs/'+s.id+'.webp';thumb.alt=s.name+' 歷史影像縮圖';thumb.onerror=()=>{if(selected!==s.id)return;if(!thumb.dataset.fallback){thumb.dataset.fallback='jpg';thumb.src='images/'+s.id+'.jpg';return}thumb.classList.add('hidden');$('cardThumbEmpty').classList.remove('hidden')};$('externalRoute').href=`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=walking`;updateCard()}
function updateCard(){const s=getStop();if(!s)return;const near=user?meters(user,s):null;const routeMsg=routeStatus;
 $('cardDistance').textContent=user?(near!==null?`直線距離 ${distanceText(near)}`:''):'GPS 尚未開啟';
 $('routeSummary').textContent=routeMsg;$('routeSummary').classList.toggle('is-error',routeMsg.includes('失敗')||routeMsg.includes('無法'));
 $('checkBtn').textContent=reached(s.id)?'✓ 已打卡':preview?'試玩打卡':gpsEligible(s)?'確認打卡':'到點打卡';$('checkBtn').disabled=reached(s.id)||(!preview&&!gpsEligible(s));
 $('cardStory').textContent=s.desc;
}
function chooseStop(id){const s=STOPS.find(q=>q.id===id);if(!s)return;const changed=selected!==id;selected=id;showCard(s);if(changed){route=[];routeDistance=null;routeStatus='GPS 定位後自動顯示步行路線';routeSeq++;if(routeController)routeController.abort();updateShapes()}
 // Keep the map at the same zoom when switching sites; only pan if target is outside view.
 const p=screen(s);if(p.x<45||p.x>map.clientWidth-55||p.y<65||p.y>map.clientHeight-215){const mid=xy(s.lat,s.lng,zoom);center=unxy(mid.x,mid.y+80,zoom);updateMap()}else updatePins();
 updateCard();if(!watchId)enableGPS();if(user)queueRoute(true);if(user)announceArrivalIfNeeded();}
function openPhoto(){const s=getStop();if(!s)return;$('photoTitle').textContent=s.name;$('photoEra').textContent=s.era+' ／ 歷史影像';$('photoStory').textContent=s.desc;$('photoNow').textContent='今日對應地點：'+s.now;$('archiveLink').href=s.archive;
 const im=$('photoLarge'),missing=$('photoMissing');im.classList.remove('hidden');missing.classList.add('hidden');im.src='images/'+s.id+'.jpg';im.alt=s.name+' 歷史老照片';im.onerror=()=>{im.classList.add('hidden');missing.classList.remove('hidden')};$('playVideoBtn').classList.toggle('hidden',!reached(s.id)||!availableVideos.has(s.id));$('photoOverlay').classList.remove('hidden')}
function closePhoto(){$('photoOverlay').classList.add('hidden')}
function eligibleLocation(s){if(!user)return false;if((user.accuracy||999)>110)return false;return meters(user,s)<=s.radius}
function gpsEligible(s){return !!s&&(preview||eligibleLocation(s))}
function announceArrivalIfNeeded(){const s=getStop();if(!s||reached(s.id)||announced.has(s.id)||!eligibleLocation(s)||preview)return;announced.add(s.id);$('arriveName').textContent=s.name;$('arriveOverlay').classList.remove('hidden');}
function doCheckin(){const s=getStop();if(!s)return;if(reached(s.id))return;if(!gpsEligible(s)){notify('目前不在打卡範圍內，請依地圖前往尋找');return}if(preview){demoVisited.add(s.id);notify('試玩打卡成功（不計入正式進度）')}else{visited.add(s.id);try{localStorage.setItem(visitStorage,JSON.stringify([...visited]))}catch{}notify('尋影完成！已記錄「'+s.name+'」')} $('arriveOverlay').classList.add('hidden');updatePins();updateCard();updatePassport();if(availableVideos.has(s.id))notify('打卡成功！點開老照片可使用「看動圖」')}
function enableGPS(){if(!window.isSecureContext){notify('GPS 定位需要 HTTPS，請使用正式 GitHub Pages 網址');routeStatus='需要 HTTPS 才能取得 GPS';updateCard();return}if(!navigator.geolocation){notify('瀏覽器不支援定位');routeStatus='此瀏覽器無法定位';updateCard();return}if(watchId!==null)return;routeStatus='取得定位中…授權後自動產生步行路線';updateCard();watchId=navigator.geolocation.watchPosition(
 pos=>{const old=user;user={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy};updatePins();updateCard();if(selected){announceArrivalIfNeeded();if(!lastRouteStart||meters(lastRouteStart,user)>45||Date.now()-lastRouteTime>90000)queueRoute(!old)}if(follow&&Date.now()-lastGpsFocus>7000){lastGpsFocus=Date.now();const loc=screen(user);if(loc.x<70||loc.x>map.clientWidth-70||loc.y<70||loc.y>map.clientHeight-210){const s=getStop();if(s)fitBounds([user,s],Math.min(zoom,17));else{center={lat:user.lat,lng:user.lng};updateMap()}}}},
 err=>{const messages={1:'定位權限未授權，可從瀏覽器設定開啟',2:'暫時無法取得 GPS 訊號',3:'GPS 定位逾時，請在空曠處重試'};routeStatus=messages[err.code]||'GPS 定位失敗';updateCard();notify(routeStatus);if(err.code===1&&watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null}},
 {enableHighAccuracy:true,maximumAge:6000,timeout:20000})}
function queueRoute(fit=false){if(!selected||!user)return;clearTimeout(routeTimer);routeTimer=setTimeout(()=>fetchRoute(fit),300)}
async function fetchRoute(fit=false){const s=getStop();if(!s||!user)return;const start={lat:user.lat,lng:user.lng};if(meters(start,s)>12000){routeStatus='距離超過 12 公里，建議先用外部導航';route=[];updateShapes();updateCard();return}
 const cacheKey=`${s.id}-${Math.round(start.lat*3500)}-${Math.round(start.lng*3500)}`;
 if(routeCache.has(cacheKey)){const saved=routeCache.get(cacheKey);route=saved.points;routeDistance=saved.distance;routeStatus='步行路線約 '+distanceText(routeDistance)+' · 已在地圖顯示';lastRouteStart=start;lastRouteTime=Date.now();updateShapes();updateCard();if(fit)fitBounds([start,s],17);return}
 const current=++routeSeq;if(routeController)routeController.abort();routeController=new AbortController();const timer=setTimeout(()=>routeController.abort(),11000);
 routeStatus='正在計算沿道路行走的路線…';updateCard();
 try{
  const query={locations:[{lat:start.lat,lon:start.lng},{lat:s.lat,lon:s.lng}],costing:'pedestrian',format:'osrm',shape_format:'geojson',directions_type:'none',units:'kilometers'};
  const url='https://valhalla1.openstreetmap.de/route?json='+encodeURIComponent(JSON.stringify(query));
  const response=await fetch(url,{method:'GET',signal:routeController.signal,headers:{'X-Client-Id':'chengxi-xunying-prototype'}});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();if(current!==routeSeq||s.id!==selected)return;
  const result=data.routes?.[0];let points=[];
  if(result?.geometry?.type==='LineString'&&Array.isArray(result.geometry.coordinates))points=result.geometry.coordinates.map(v=>({lat:v[1],lng:v[0]}));
  else if(typeof result?.geometry==='string')points=decodePolyline(result.geometry,6);
  if(points.length<2)throw Error('No route geometry');
  const direct=meters(start,s);const responseMeters=Number(result.distance),dist=Number.isFinite(responseMeters)?responseMeters:polyDistance(points);
  if(!Number.isFinite(dist)||dist<direct*.75)throw Error('Route mismatch');
  route=points;routeDistance=dist;lastRouteStart=start;lastRouteTime=Date.now();routeCache.set(cacheKey,{points,distance:dist});if(routeCache.size>25)routeCache.delete(routeCache.keys().next().value);
  routeStatus='藍線步行路線約 '+distanceText(dist)+' · 跟著道路前往';$('mapInstruction').textContent='沿藍線尋找「'+s.name+'」，抵達後打卡';updateShapes();updateCard();if(fit)fitBounds([start,s],17)
 }catch(e){if(current!==routeSeq)return;route=[];routeDistance=null;routeStatus='步行路線暫時無法計算，可用右側外部導航';updateShapes();updateCard()}
 finally{clearTimeout(timer)}
}
function polyDistance(points){let d=0;for(let i=1;i<points.length;i++)d+=meters(points[i-1],points[i]);return d}
function decodePolyline(encoded,precision=6){let i=0,lat=0,lng=0,points=[],factor=10**precision;while(i<encoded.length){let res=0,shift=0,byte;do{byte=encoded.charCodeAt(i++)-63;res|=(byte&31)<<shift;shift+=5}while(byte>=32&&i<encoded.length);lat+=(res&1)?~(res>>1):res>>1;res=0;shift=0;do{byte=encoded.charCodeAt(i++)-63;res|=(byte&31)<<shift;shift+=5}while(byte>=32&&i<encoded.length);lng+=(res&1)?~(res>>1):res>>1;points.push({lat:lat/factor,lng:lng/factor})}return points}
function updatePassport(){const count=STOPS.filter(s=>reached(s.id)).length;$('doneCount').textContent=count;$('passportGrid').replaceChildren();for(const s of STOPS){let btn=document.createElement('button');btn.className='passport-place'+(reached(s.id)?' done':'');const title=document.createElement('strong');title.textContent=s.name;const sub=document.createElement('small');sub.textContent=reached(s.id)?'✓ 已尋影完成':'尚未打卡';btn.append(title,sub);btn.onclick=()=>{$('passportOverlay').classList.add('hidden');chooseStop(s.id)};$('passportGrid').appendChild(btn)}$('passportLead').textContent=`已完成 ${count} / ${STOPS.length} 景。完成探索後，請返回臺北市立文獻館依現場活動規則兌換獎品。`;$('passportNote').textContent=preview?'試玩模式的打卡不會寫入正式完成紀錄。':'目前僅儲存在此裝置的瀏覽器，尚未啟用防重複兌獎的後台。'}
async function inspectVideos(){if(location.protocol==='file:')return;await Promise.all(STOPS.map(async s=>{try{const r=await fetch(`videos/${s.id}.mp4`,{method:'HEAD'});if(r.ok)availableVideos.add(s.id);else if(r.status===404)availableVideos.delete(s.id)}catch{}}))}
function playMovie(){const s=getStop();if(!s||!reached(s.id)||!availableVideos.has(s.id))return;$('movieTitle').textContent=s.name;$('movieOverlay').classList.remove('hidden');const vid=$('moviePlayer');vid.src=`videos/${s.id}.mp4`;vid.play().catch(()=>{})}
function closeMovie(){const vid=$('moviePlayer');vid.pause();vid.removeAttribute('src');vid.load();$('movieOverlay').classList.add('hidden')}
function initControls(){
 $('passportBtn').onclick=()=>{updatePassport();$('passportOverlay').classList.remove('hidden')};$('passportClose').onclick=()=>$('passportOverlay').classList.add('hidden');
 $('cardThumbButton').onclick=$('viewPhotoBtn').onclick=openPhoto;$('photoClose').onclick=$('photoReturn').onclick=closePhoto;
 $('checkBtn').onclick=()=>{if(getStop()&&gpsEligible(getStop()))doCheckin();else notify('尚未到點，請循藍色步行路線前往')};
 $('arriveConfirm').onclick=doCheckin;$('arriveLater').onclick=()=>$('arriveOverlay').classList.add('hidden');
 $('zoomIn').onclick=()=>zoomBy(1);$('zoomOut').onclick=()=>zoomBy(-1);$('allBtn').onclick=fitAll;$('locateBtn').onclick=showMyPlace;
 $('playVideoBtn').onclick=playMovie;$('movieClose').onclick=closeMovie;
 $('demoBtn').onclick=()=>{preview=!preview;demoVisited.clear();$('demoBtn').classList.toggle('on',preview);$('demoBtn').textContent=preview?'結束試玩':'試玩';notify(preview?'已開啟試玩模式（不記錄正式打卡）':'已結束試玩模式');updatePins();updateCard();updatePassport()};
 for(const id of ['photoOverlay','passportOverlay','movieOverlay'])$(id).addEventListener('click',e=>{if(e.target.id===id){if(id==='movieOverlay')closeMovie();else $(id).classList.add('hidden')}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePhoto();closeMovie();$('passportOverlay').classList.add('hidden');$('arriveOverlay').classList.add('hidden')}});
}
// Dragging and pinch-zoom apply to the same long-lived map and tile cache.
const pointers=new Map();let drag=null;
function attachGestures(){map.addEventListener('pointerdown',e=>{if(e.target.closest('button,a'))return;map.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){drag={x:e.clientX,y:e.clientY,center:{...center},zoom,mode:'pan'};map.classList.add('dragging')}else if(pointers.size===2){const arr=[...pointers.values()];drag={dist:Math.hypot(arr[0].x-arr[1].x,arr[0].y-arr[1].y),zoom,mode:'pinch'}}});
 map.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!drag)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1&&drag.mode==='pan'){const dx=e.clientX-drag.x,dy=e.clientY-drag.y,b=xy(drag.center.lat,drag.center.lng,drag.zoom);center=unxy(b.x-dx,b.y-dy,drag.zoom);follow=false;$('locateBtn').classList.remove('active');updateMap()}else if(pointers.size===2&&drag.mode==='pinch'){const ar=[...pointers.values()];drag.scale=Math.hypot(ar[0].x-ar[1].x,ar[0].y-ar[1].y)/drag.dist}});
 const end=e=>{pointers.delete(e.pointerId);if(pointers.size===0){if(drag?.mode==='pinch'&&drag.scale){const change=Math.log2(drag.scale);if(Math.abs(change)>.3)zoomBy(Math.round(change))}drag=null;map.classList.remove('dragging')}else if(pointers.size===1){const p=[...pointers.values()][0];drag={x:p.x,y:p.y,center:{...center},zoom,mode:'pan'}}};
 map.addEventListener('pointerup',end);map.addEventListener('pointercancel',end);map.addEventListener('dblclick',e=>{e.preventDefault();zoomBy(1)});map.addEventListener('wheel',e=>{e.preventDefault();zoomBy(e.deltaY<0?1:-1)},{passive:false});}
function start(){initPins();initControls();attachGestures();fitBounds(STOPS,15);updatePassport();inspectVideos();window.addEventListener('resize',()=>{clearTimeout(window._r);window._r=setTimeout(updateMap,120)})}
start();
