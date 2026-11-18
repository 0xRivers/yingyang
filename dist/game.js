import {pairs,copy} from './words.js';
import {BunkerSigner,createNostrConnectURI,generateSecretKey,getPublicKey,SimplePool,verifyEvent} from './verify.js';

const $=s=>document.querySelector(s);
const storage=localStorage;
const key=s=>'yingyang.v1.'+s;
const get=s=>storage.getItem(key(s));
const set=(s,v)=>storage.setItem(key(s),v);
const langs=['en','pl','pt'];
const locales=['en-GB','pl-PL','pt-PT'];
let lang=langs.includes(get('language'))?get('language'):'en';
let profile=sessionStorage.getItem(key('profile'))||'guest';
let sound=get('sound')!=='off', wrong=-1, collection=location.hash==='#collection';
let noticeTimer, hints=false, typed='';
const spelling={
 en:['Type the opposite','Check','Show word hints','Hide word hints','Try the spelling again. You can open the word hints.','Letters'],
 pl:['Wpisz przeciwieństwo','Sprawdź','Pokaż podpowiedzi','Ukryj podpowiedzi','Spróbuj poprawić pisownię. Możesz skorzystać z podpowiedzi.','Litery'],
 pt:['Escreve o oposto','Verificar','Mostrar pistas','Ocultar pistas','Tenta escrever outra vez. Podes consultar as pistas.','Letras']
};
const norm=v=>v.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase(locales[li()]);
function resetInput(){wrong=-1;typed='';hints=false}
const t=i=>copy[lang][i];
const li=()=>langs.indexOf(lang);
const word=(q,side)=>pairs[q][li()][side];
const paths={user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',play:'<path d="m8 5 11 7-11 7z"/>',book:'<path d="M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1zM12 6v14"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',leaf:'<path d="M5 20c0-7 4-11 12-14M5 16C1 7 11 4 20 4c0 9-5 15-15 12Z"/>',speaker:'<path d="m11 5-5 4H3v6h3l5 4zM15 9q3 3 0 6m3-9q6 6 0 12"/>',phones:'<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/>',arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',mountain:'<path d="m2 19 7-12 4 7 3-5 6 10zM6 12l3 2 2-3"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M20 4l-2 2M6 18l-2 2"/>',moon:'<path d="M19 15A8 8 0 0 1 9 4a8.4 8.4 0 1 0 10 11Z"/><path d="m18 2 .6 2.4L21 5l-2.4.6L18 8l-.6-2.4L15 5l2.4-.6z"/>',rain:'<path d="M6 14a4 4 0 1 1 .3-8A5 5 0 0 1 16 7a3.5 3.5 0 1 1 1 7zM8 17l-1 2m6-2-1 3m6-3-1 2"/>'};
const icon=k=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+paths[k]+'</svg>';
const coin='<svg class="coin" aria-hidden="true" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18.5" fill="#fffbea" stroke="currentColor" stroke-width="2"/><path d="M20 1.5a18.5 18.5 0 0 0 0 37 9.25 9.25 0 0 0 0-18.5 9.25 9.25 0 0 1 0-18.5" fill="currentColor"/><circle cx="20" cy="10.75" r="3.2" fill="currentColor"/><circle cx="20" cy="29.25" r="3.2" fill="#fffbea"/></svg>';
const familyText={
 en:['Add your children','Name or nickname','Add child','Choose who’s playing','Original collection','Playing as','Enter a name to add a child.'],
 pl:['Dodaj swoje dzieci','Imię lub pseudonim','Dodaj dziecko','Wybierz, kto gra','Pierwotna kolekcja','Gra','Wpisz imię dziecka.'],
 pt:['Adicionar os teus filhos','Nome ou alcunha','Adicionar criança','Escolhe quem vai jogar','Coleção original','A jogar como','Escreve um nome para adicionar a criança.']
};
function childNameKey(id){return 'children.'+profile+'.'+id}
function selectedChild(){return sessionStorage.getItem(key('selected.'+profile))||''}
function progressKey(){
 const id=selectedChild();
 return id&&get(childNameKey(id))?profile+'.player.'+id:profile;
}
function saved(){
  let s;try{s=JSON.parse(get(progressKey()))}catch{}
  return {won:[...new Set((Array.isArray(s?.won)?s.won:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<21))],q:Number.isInteger(s?.q)&&s.q>=0&&s.q<=21?s.q:0,answered:s?.answered===true};
}
let state=saved();
const save=()=>set(progressKey(),JSON.stringify(state));
const msg=text=>{clearTimeout(noticeTimer);$('#notice').textContent=text;noticeTimer=setTimeout(()=>$('#notice').textContent='',4500)};
function speak(text){
  if(!window.speechSynthesis){msg(t(45));return}
  const synth=window.speechSynthesis,locale=locales[li()],voices=synth.getVoices();
  const voice=voices.find(v=>v.lang.replace('_','-').toLowerCase()===locale.toLowerCase())||voices.find(v=>v.lang.slice(0,2)===lang);
  if(voices.length&&!voice){msg(t(45));return}
  synth.cancel();const u=new SpeechSynthesisUtterance(text);
  if(voice)u.voice=voice;u.lang=voice?.lang||locale;u.rate=.9;
  u.onerror=e=>{if(!['interrupted','canceled'].includes(e.error))msg(t(45))};synth.speak(u);
}
window.speechSynthesis?.getVoices();
function options(q){
  if(q===0)return [word(0,1),t(51),t(52)];
  const out=[word((q+5)%21,1),word((q+12)%21,1)];
  out.splice((q*7+Math.floor(q/3))%3,0,word(q,1));return out;
}
const token=i=>'<span class="token '+(state.won.includes(i)?'won':'')+'">'+coin+'</span>';
const track=()=>'<div class="track"><span style="width:'+state.won.length/21*100+'%"></span></div>';
function sidebar(){return '<aside><section class="album"><div class="row"><h2>'+t(10)+'</h2><span class="count">'+state.won.length+' / 21</span></div><p>'+t(11)+'</p>'+track()+'<div class="tokens" aria-hidden="true">'+pairs.map((_,i)=>token(i)).join('')+'</div><button class="collectionlink" data-go="collection">'+t(12)+icon('arrow')+'</button></section><section class="soundcard"><div class="soundlabel"><span class="soundicon">'+icon('phones')+'</span><h2>'+t(13)+'</h2></div><p>'+t(14)+'</p><div class="switchrow">'+t(15)+'<button class="toggle" role="switch" aria-label="'+t(15)+'" aria-checked="'+sound+'" data-switch></button></div></section></aside>'}
function game(){
 const q=state.q;
 const mobileSound='<button class="compact-sound" data-switch aria-label="'+t(15)+'" aria-pressed="'+sound+'" title="'+t(15)+'">'+icon('speaker')+'</button>';
 const art='<div class="land"><img alt="" src="landscape.webp"><div class="medal">'+coin+'</div></div>';
 if(q===21)return '<div class="layout"><section class="board">'+art+'<div class="finish"><h2>'+t(20)+'</h2><button data-replay class="primary">'+t(21)+'</button></div></section>'+sidebar()+'</div>';
 const choices=options(q);
 const sp=spelling[lang];
 const tiles=choices.map((v,i)=>'<div class="tile"><button type="button" class="choice" data-say="'+v+'" aria-label="'+t(47)+' · '+v+'"><span class="glyph">'+(q===0?icon(['moon','sun','rain'][i]):icon('speaker'))+'</span><span class="answerword">'+v+'</span></button></div>').join('');
 const letters=lang==='pl'?'ąćęłńóśźż':lang==='pt'?'áàâãçéêíóôõú':'';
 const keyboard=letters?'<div class="accents" aria-label="'+sp[5]+'">'+Array.from(letters,c=>'<button type="button" data-letter="'+c+'">'+c+'</button>').join('')+'</div>':'';
 const form='<form id="spell"><div class="inputrow"><input id="answer" enterkeyhint="done" aria-label="'+sp[0]+'" placeholder="'+sp[0]+'…" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="80" required><button class="primary">'+sp[1]+' '+icon('arrow')+'</button></div>'+keyboard+'</form>';
 const solved='<div class="solved">'+word(q,0)+' ↔ '+word(q,1)+' <button class="listen" data-say="'+word(q,1)+'" aria-label="'+t(47)+' · '+word(q,1)+'">'+icon('speaker')+'</button></div>';
 const feedback=state.answered?t(17)+' <button class="primary" data-next>'+t(q===20?19:18)+' →</button>':wrong>=0?sp[4]:'';
 const hintsBox=state.answered?'':'<button class="hintlink" data-hints aria-expanded="'+hints+'">'+icon('book')+' '+sp[hints?3:2]+'</button>'+ '<div class="answers" '+(hints?'':'hidden')+'>'+tiles+'</div>';
 return '<div class="layout"><section class="board"><div class="boardtop"><span class="pill">'+icon('leaf')+t(5)+' '+(q+1)+' '+t(6)+' 21</span><span class="gardenlabel">'+icon('book')+t(7)+'</span>'+mobileSound+'</div>'+art+'<div class="question"><p>'+t(8)+'</p><div class="word">'+word(q,0)+'<button class="listen" data-say="'+word(q,0)+'" aria-label="'+t(47)+' · '+word(q,0)+'">'+icon('speaker')+'</button></div></div>'+(state.answered?solved:form)+'<div aria-live="polite" class="feedback">'+feedback+'</div>'+hintsBox+'</section>'+sidebar()+'</div>';
}
function album(){return '<section class="fullalbum"><div class="row"><h2>'+t(10)+'</h2><span class="count">'+state.won.length+' / 21</span></div>'+track()+'<div class="grid">'+pairs.map((_,i)=>'<div class="entry">'+token(i)+'<strong>'+(state.won.includes(i)?word(i,0)+' · '+word(i,1):t(24)+' '+(i+1))+'</strong></div>').join('')+'</div><button class="collectionlink" data-go="play">'+t(50)+'</button></section>'}
function render(){
 document.documentElement.lang=lang;
 if(!$('.brandmark svg'))$('.brandmark').innerHTML=coin;
 $('#nav').innerHTML=['play','collection'].map((v,i)=>'<button class="navbtn '+(collection===Boolean(i)?'current':'')+'" data-go="'+v+'">'+icon(i?'book':'play')+'<span>'+t(i)+'</span>'+'</button>').join('');
 $('#languages').innerHTML=icon('globe')+'<select aria-label="'+t(53)+'">'+['English','Polski','Português'].map((v,i)=>'<option value="'+langs[i]+'" '+(lang===langs[i]?'selected':'')+'>'+v+'</option>').join('')+'</select>';
 const accountLabel=t(profile==='guest'?37:36);
 $('#account').innerHTML=icon('user')+'<span>Nostr</span>';$('#account').ariaLabel=accountLabel;$('#account').title=accountLabel;
 $('#parent').innerHTML=icon('lock')+'<span>'+t(2)+'</span>';$('#parent').setAttribute('aria-label',t(2));$('#parent').title=t(2);$('.close').ariaLabel=t(46);
 $('#title').textContent=t(collection?22:3);const player=get(childNameKey(selectedChild()));$('#subtitle').textContent=player?familyText[lang][5]+' · '+player:t(collection?23:4);
 $('#app').innerHTML=collection?album():game();if($('#answer'))$('#answer').value=typed;
}
function navigate(to){location.hash=to;collection=to==='collection';render()}
window.addEventListener('hashchange',()=>{collection=location.hash==='#collection';render()});
document.addEventListener('change',e=>{if(e.target.matches('#languages select')){lang=e.target.value;set('language',lang);resetInput();window.speechSynthesis?.cancel();render();if(sound&&!collection&&state.q<21)speak(word(state.q,0))}});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.go)navigate(b.dataset.go);
 if(b.dataset.say)speak(b.dataset.say);
 if(b.hasAttribute('data-switch')){sound=!sound;set('sound',sound?'on':'off');$('.toggle')?.setAttribute('aria-checked',String(sound));$('.compact-sound')?.setAttribute('aria-pressed',String(sound));if(sound&&state.q<21)speak(word(state.q,0));else window.speechSynthesis?.cancel()}
 if(b.hasAttribute('data-hints')){
  hints=!hints;b.setAttribute('aria-expanded',String(hints));
  b.innerHTML=icon('book')+' '+spelling[lang][hints?3:2];b.nextElementSibling.hidden=!hints;
 }
 if(b.dataset.letter&&$('#answer')){const input=$('#answer');input.setRangeText(b.dataset.letter,input.selectionStart,input.selectionEnd,'end');typed=input.value;input.focus()}
 if(b.hasAttribute('data-next')&&state.answered){state.q++;state.answered=false;resetInput();save();if(state.q===21)navigate('collection');else{render();if(sound)speak(word(state.q,0))}}
 if(b.hasAttribute('data-replay')){state.q=0;state.answered=false;resetInput();save();render();if(sound)speak(word(0,0))}
});
// Keep the input and its selection when a child taps a pronunciation or accent key.
document.addEventListener('pointerdown',e=>{
 if(document.activeElement?.id==='answer'&&e.target.closest('[data-letter],[data-say],[data-hints],[data-switch]'))e.preventDefault();
});
function fitViewport(){
 const view=window.visualViewport;
 const height=Math.round(view?.height||window.innerHeight);
 const typing=document.activeElement?.id==='answer';
 const touch=window.matchMedia?.('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
 document.documentElement.style.setProperty('--visible-height',height+'px');
 document.documentElement.classList.toggle('tight-play',height<505||(touch&&typing&&height<700));
 document.documentElement.classList.toggle('short-play',height<310);
}
window.addEventListener('resize',fitViewport);
window.visualViewport?.addEventListener('resize',fitViewport);
document.addEventListener('focusin',fitViewport);
document.addEventListener('focusout',()=>setTimeout(fitViewport,0));
fitViewport();
document.addEventListener('input',e=>{if(e.target.id==='answer')typed=e.target.value});
document.addEventListener('submit',e=>{
 if(e.target.id!=='spell'||state.answered)return;
 e.preventDefault();typed=$('#answer').value;
 if(norm(typed)===norm(word(state.q,1))){
  state.answered=true;if(!state.won.includes(state.q))state.won.push(state.q);
  if(sound)speak(word(state.q,1));save();resetInput();render();$('[data-next]').focus({preventScroll:true});
 }else{wrong=0;$('.feedback').textContent=spelling[lang][4];$('#answer').focus();$('#answer').select()}
});
const modal=$('#modal'),body=$('#dialogbody');
$('.close').onclick=()=>modal.close();
modal.addEventListener('close',()=>body.replaceChildren());
const hex=bytes=>Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
async function digest(pin,salt){
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:210000,hash:'SHA-256'},material,256));
}
$('#parent').onclick=()=>{
 const record=JSON.parse(get('pin')||'null');
 const field=(name,label)=>'<label>'+t(label)+'<input name="'+name+'" inputmode="numeric" type="password" pattern="[0-9]{4,8}" maxlength="8" required autocomplete="off"></label>';
 body.innerHTML='<h2>'+t(record?25:26)+'</h2><p>'+t(record?28:27)+'</p><form>'+field('pin',29)+(record?'':field('repeat',30))+'<p class="error" role="alert"></p><button class="primary">'+t(record?32:31)+'</button></form>';
 modal.showModal();body.querySelector('input').focus();
 const form=body.querySelector('form');
 form.onsubmit=async e=>{
  e.preventDefault();const pin=form.elements.pin.value,err=form.querySelector('.error');
  if(!record&&pin!==form.elements.repeat.value){err.textContent=t(33);return}
  const submit=form.querySelector('button');submit.disabled=true;
  try{
   const salt=record?.salt||hex(crypto.getRandomValues(new Uint8Array(16))),hash=await digest(pin,salt);
   if(!modal.open||!form.isConnected)return;
   if(record&&record.hash!==hash){err.textContent=t(34);return}
   if(!record)set('pin',JSON.stringify({salt,hash}));familyPanel(true);
  }finally{submit.disabled=false}
 };
};
function switchProfile(p){profile=p;sessionStorage.setItem(key('profile'),p);state=saved();resetInput();render()}
const authText={
 en:{amber:'Open Amber',approveAmber:'Approve the sign-in in Amber, then return here.',extension:'Approve the sign-in in your Nostr extension.',missing:'Open the game in the browser where your Nostr extension is enabled. Allow it access to this site, then retry.',file:'For extension login, open the game on localhost in the browser where your Nostr extension is enabled.',retry:'Retry'},
 pl:{amber:'Otwórz Amber',approveAmber:'Zatwierdź logowanie w Amber i wróć tutaj.',extension:'Zatwierdź logowanie w rozszerzeniu Nostr.',missing:'Otwórz grę w przeglądarce z włączonym rozszerzeniem Nostr. Zezwól mu na dostęp do tej strony i spróbuj ponownie.',file:'Aby zalogować się przez rozszerzenie, otwórz grę na localhost w przeglądarce z włączonym rozszerzeniem Nostr.',retry:'Spróbuj ponownie'},
 pt:{amber:'Abrir Amber',approveAmber:'Aprova o início de sessão no Amber e volta aqui.',extension:'Aprova o início de sessão na extensão Nostr.',missing:'Abre o jogo no navegador onde ativaste a extensão Nostr. Permite o acesso da extensão a este site e tenta novamente.',file:'Para entrar com a extensão, abre o jogo em localhost no navegador onde a extensão Nostr está ativa.',retry:'Tentar novamente'}
};
function isMobileSigner(){
 return navigator.userAgentData?.mobile===true||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
}
function extensionSigner(){
 const signer=window.nostr;
 return typeof signer?.getPublicKey==='function'&&typeof signer?.signEvent==='function'?signer:null;
}
const signerRelays=['wss://relay.nip46.com','wss://nrs.primal.net'];
let activeAttempt;
function stopSignIn(){
 const attempt=activeAttempt;
 activeAttempt=null;
 if(!attempt)return;
 clearTimeout(attempt.timer);
 attempt.controller.abort();
 attempt.signer?.close().catch(()=>{});
 attempt.pool?.destroy();
}
modal.addEventListener('close',stopSignIn);

async function confirmIdentity(signer,attempt){
 const pubkey=await signer.getPublicKey();
 if(activeAttempt!==attempt)return;
 if(typeof pubkey!=='string'||!/^[a-f0-9]{64}$/.test(pubkey))throw Error();
 const challenge={kind:27235,created_at:Math.floor(Date.now()/1000),tags:[['u',location.protocol==='file:'?'urn:ying-yang:local':location.origin+location.pathname],['method','GET'],['challenge',crypto.randomUUID()]],content:''};
 const expected=JSON.stringify(challenge.tags),created=challenge.created_at;
 const signed=JSON.parse(JSON.stringify(await signer.signEvent(challenge)));
 if(activeAttempt!==attempt||!modal.open)return;
 if(signed.pubkey!==pubkey||signed.kind!==27235||signed.created_at!==created||signed.content!==''||JSON.stringify(signed.tags)!==expected||!verifyEvent(signed))throw Error();
 stopSignIn();switchProfile(pubkey);familyPanel();
}

async function startSignIn(useAmber){
 stopSignIn();
 const attempt={controller:new AbortController()};
 activeAttempt=attempt;
 const status=$('#sign-status'),link=$('#amber-open');
 link.hidden=true;link.removeAttribute('href');
 const fail=(message=t(44))=>{if(activeAttempt===attempt){stopSignIn();link.hidden=true;status.textContent=message;$('#auth-retry').hidden=false}};
 $('#auth-retry').hidden=true;
 attempt.timer=setTimeout(fail,180000);
 try{
  if(!useAmber){
   status.textContent=authText[lang].extension;
   let signer=extensionSigner();
   for(let poll=0;!signer&&poll<20;poll++){
    await new Promise(resolve=>setTimeout(resolve,100));
    if(activeAttempt!==attempt)return;
    signer=extensionSigner();
   }
   if(!signer){fail(authText[lang][location.protocol==='file:'?'file':'missing']);return}
   await confirmIdentity(signer,attempt);return;
  }
  attempt.pool=new SimplePool();
  const ephemeral=generateSecretKey();
  const uri=createNostrConnectURI({clientPubkey:getPublicKey(ephemeral),relays:signerRelays,secret:hex(crypto.getRandomValues(new Uint8Array(16))),perms:['get_public_key','sign_event:27235'],name:'Ying Yang',...(location.protocol.startsWith('http')?{url:location.origin}:{})});
  const pairing=BunkerSigner.fromURI(ephemeral,uri,{pool:attempt.pool},attempt.controller.signal);
  link.href=uri;link.hidden=false;status.textContent=authText[lang].approveAmber;
  link.click();
  const signer=await pairing;
  if(activeAttempt!==attempt){await signer.close();return}
  attempt.signer=signer;
  await confirmIdentity(signer,attempt);
 }catch{fail()}
}

$('#account').onclick=()=>{
 const labels=authText[lang];
 if(profile!=='guest'){
  familyPanel();
 }else{
  const mobile=isMobileSigner();
  body.innerHTML='<h2>'+t(37)+'</h2><p id="sign-status" role="status"></p><div class="actions"><a hidden id="amber-open" class="primary">'+labels.amber+'</a><button hidden id="auth-retry">'+labels.retry+'</button></div>';
  $('#auth-retry').onclick=()=>startSignIn(mobile);
  modal.showModal();
  startSignIn(mobile);
  return;
 }
 modal.showModal();
};
function familyPanel(unlocked=false){
 const labels=familyText[lang];
 body.innerHTML='<h2>'+labels[0]+'</h2><form id="add-child"><label>'+labels[1]+'<input name="child" required maxlength="40" autocomplete="off"></label><button class="primary">'+labels[2]+'</button></form><section id="players" class="actions"></section><p>'+t(48)+'</p><div class="actions" id="family-actions"></div>';
 const list=$('#players'), actions=$('#family-actions'), prefix=key(childNameKey(''));
 const children=Object.keys(storage).filter(k=>k.startsWith(prefix)).map(k=>({id:k.slice(prefix.length),name:storage.getItem(k)})).sort((a,b)=>a.name.localeCompare(b.name,lang));
 function button(container,label,run){
  const element=document.createElement('button');element.type='button';element.textContent=label;element.onclick=run;container.append(element);return element;
 }
 function choose(id){
  sessionStorage.setItem(key('selected.'+profile),id);
  state=saved();resetInput();navigate('play');modal.close();
 }
 if(children.length){
  const heading=document.createElement('h3');heading.textContent=labels[3];list.append(heading);
  for(const child of children)button(list,child.name,()=>choose(child.id)).dataset.player=child.id;
  if(get(profile))button(list,labels[4],()=>choose(''));
 }
 const form=$('#add-child'),input=form.elements.child;
 input.oninput=()=>input.setCustomValidity('');
 form.onsubmit=e=>{
  e.preventDefault();const name=input.value.trim();
  if(!name){input.setCustomValidity(labels[6]);input.reportValidity();return}
  const id=crypto.randomUUID();set(childNameKey(id),name);
  familyPanel(unlocked);
  body.querySelector('[data-player="'+id+'"]').focus();
 };
 if(profile!=='guest'&&!unlocked)button(actions,t(38),()=>{switchProfile('guest');modal.close()}).id='logout';
 if(!unlocked)return;
 const name=get(childNameKey(selectedChild()));
 button(actions,t(39)+(name?' · '+name:''),null).id='reset';
 $('#reset').onclick=()=>{
  body.innerHTML='<h2>'+t(39)+'</h2><p>'+t(40)+'</p><div class="actions"><button id="cancel">'+t(42)+'</button><button id="confirm" class="primary">'+t(41)+'</button></div>';
  $('#cancel').onclick=()=>familyPanel(true);$('#confirm').onclick=()=>{state={q:0,won:[],answered:false};resetInput();save();navigate('play');modal.close()};
 };
}
render();
