import {pronunciation} from './pronunciation.js';
import {pairs,copy,translations} from './words.js';
import {BunkerSigner,createNostrConnectURI,generateSecretKey,getPublicKey,SimplePool,verifyEvent} from './verify.js';

const $=s=>document.querySelector(s);
const storage=localStorage;
const key=s=>'yingyang.v1.'+s;
const get=s=>storage.getItem(key(s));
const set=(s,v)=>storage.setItem(key(s),v);
const langs=['en','pl','pt'];
const locales=['en-GB','pl-PL','pt-PT'];
const legacyLanguage=langs.includes(get('language'))?get('language'):'en';
const languageNames={en:'English',pl:'Polish',pt:'Portuguese'};
let profile=sessionStorage.getItem(key('profile'))||'guest';
let sound=get('sound')!=='off', wrong=-1, collection=location.hash==='#collection';
let noticeTimer, hints=false, typed='';
const spelling={
 en:['Type the opposite','Check','Show word hints','Hide word hints','Try the spelling again. You can open the word hints.','Letters'],
 pl:['Wpisz przeciwieństwo','Sprawdź','Pokaż podpowiedzi','Ukryj podpowiedzi','Spróbuj poprawić pisownię. Możesz skorzystać z podpowiedzi.','Litery'],
 pt:['Escreve o oposto','Verificar','Mostrar pistas','Ocultar pistas','Tenta escrever outra vez. Podes consultar as pistas.','Letras']
};
const norm=v=>v.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase(locales[langs.indexOf(questionLanguage())]);
function resetInput(){wrong=-1;typed='';hints=false}
const t=i=>copy.en[i];
const word=(q,side,language=questionLanguage())=>pairs[q][langs.indexOf(language)][side];
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
function progressKey(id=selectedChild()){
 return id&&get(childNameKey(id))?profile+'.player.'+id:profile;
}
function languageMix(playerKey){
 let value;try{value=JSON.parse(get('languages.'+playerKey))}catch{}
 const selected=langs.filter(code=>Array.isArray(value)&&value.includes(code));
 return selected.length?selected:[legacyLanguage];
}
function currentRound(){return state.translating?state.translation:state}
function questionLanguage(){
 const round=currentRound();
 return mix[(round.q+round.rotation)%mix.length];
}
function sourceLanguage(q){
 if(!state.translating)return questionLanguage();
 if(questionLanguage()!=='en')return 'en';
 const sources=mix.filter(code=>code!=='en');
 if(!sources.length)sources.push('pl','pt');
 return sources[(q+currentRound().rotation)%sources.length];
}
function practiceWord(q,side){
 if(!state.translating)return word(q,side);
 const language=side===0?sourceLanguage(q):questionLanguage();
 return translations[q][langs.indexOf(language)];
}
function saved(){
  let s;try{s=JSON.parse(get(progressKey()))}catch{}
  const won=[...new Set((Array.isArray(s?.won)?s.won:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<21))];
  const points=Number.isSafeInteger(s?.points)?Math.max(won.length,s.points):won.length;
  const tr=s?.translation;
  const translation={q:Number.isInteger(tr?.q)&&tr.q>=0&&tr.q<=21?tr.q:0,rotation:Number.isInteger(tr?.rotation)&&tr.rotation>=0?tr.rotation:0};
  return {won,points,translation,translating:s?.translating===true,learned:{...s?.learned},rotation:Number.isSafeInteger(s?.rotation)&&s.rotation>=0?s.rotation:0,q:Number.isInteger(s?.q)&&s.q>=0&&s.q<=21?Math.min(21,s.q+Number(s.answered===true)):0};
}
let state=saved(),mix=languageMix(progressKey());
let recentAward=null;
const save=()=>set(progressKey(),JSON.stringify(state));
const msg=text=>{clearTimeout(noticeTimer);$('#notice').textContent=text;noticeTimer=setTimeout(()=>$('#notice').textContent='',4500)};
let voiceRequest=0,voiceTimer,wordPlayer;
function stopWordAudio(){
 voiceRequest++;
 clearTimeout(voiceTimer);
 window.speechSynthesis?.cancel();
 wordPlayer?.pause();
}
function speak(text,lang=questionLanguage()){
 stopWordAudio();
 const request=voiceRequest;
 const synth=window.speechSynthesis,locale=locales[langs.indexOf(lang)],clip=pronunciation[lang][text];
 let usingClip=false;
 function playClip(){
  if(request!==voiceRequest||usingClip)return;
  usingClip=true;clearTimeout(voiceTimer);
  synth?.cancel();
  if(!clip){msg(t(45));return}
  wordPlayer??=new Audio();
  wordPlayer.src=clip;
  wordPlayer.play().catch(()=>{if(request===voiceRequest)msg(t(45))});
 }
 try{
  const voices=synth?.getVoices()||[];
  const voice=voices.find(v=>v.lang.replace('_','-').toLowerCase()===locale.toLowerCase())||voices.find(v=>v.lang.slice(0,2)===lang);
  if(!voice){playClip();return}
  const u=new SpeechSynthesisUtterance(text);
  u.voice=voice;u.lang=voice.lang;u.rate=.9;
  u.onstart=u.onend=()=>{if(request===voiceRequest)clearTimeout(voiceTimer)};
  u.onerror=playClip;
  voiceTimer=setTimeout(playClip,1500);
  synth.speak(u);
 }catch{playClip()}
}
window.speechSynthesis?.getVoices();
function options(q){
  if(q===0&&!state.translating)return [word(0,1),copy[questionLanguage()][51],copy[questionLanguage()][52]];
  const out=[practiceWord((q+5)%21,1),practiceWord((q+12)%21,1)];
  out.splice((q*7+Math.floor(q/3))%3,0,practiceWord(q,1));return out;
}
const token=i=>'<span class="token '+(state.won.includes(i)?'won':'')+'">'+coin+'</span>';
const track=()=>'<div class="track"><span style="width:'+state.won.length/21*100+'%"></span></div>';
function sidebar(){return '<aside><section class="album"><div class="row"><h2>'+t(10)+'</h2><span class="count">'+state.won.length+' / 21</span></div><p>'+t(11)+'</p>'+track()+'<div class="tokens" aria-hidden="true">'+pairs.map((_,i)=>token(i)).join('')+'</div><button class="collectionlink" data-go="collection">'+t(12)+icon('arrow')+'</button></section><section class="soundcard"><div class="soundlabel"><span class="soundicon">'+icon('phones')+'</span><h2>'+t(13)+'</h2></div><p>'+t(14)+'</p><div class="switchrow">'+t(15)+'<button class="toggle" role="switch" aria-label="'+t(15)+'" aria-checked="'+sound+'" data-switch></button></div></section></aside>'}
function modePicker(){
 return '<div class="play-modes" role="group" aria-label="Game mode">'+['Opposites','Translations'].map((label,i)=>'<button type="button" data-mode="'+i+'" aria-pressed="'+(Boolean(i)===state.translating)+'">'+label+'</button>').join('')+'</div>';
}
function game(){
 const q=currentRound().q;
 const mobileSound='<button class="compact-sound" data-switch aria-label="'+t(15)+'" aria-pressed="'+sound+'" title="'+t(15)+'">'+icon('speaker')+'</button>';
 if(q===21)return modePicker()+'<div class="layout"><section class="board"><div class="finish"><h2>'+(state.translating?'All 21 translations complete!':t(20))+'</h2><button data-replay class="primary">'+t(21)+'</button></div></section>'+sidebar()+'</div>';
 const choices=options(q);
 const lang=questionLanguage(),sp=spelling.en;
 const tiles=choices.map((v,i)=>'<div class="tile"><button type="button" class="choice" data-say="'+v+'" aria-label="'+t(47)+' · '+v+'"><span class="glyph">'+(q===0&&!state.translating?icon(['moon','sun','rain'][i]):icon('speaker'))+'</span><span class="answerword" lang="'+lang+'">'+v+'</span></button></div>').join('');
 const letters=lang==='pl'?'ąćęłńóśźż':lang==='pt'?'áàâãçéêíóôõú':'';
 const keyboard=letters?'<div class="accents" aria-label="'+sp[5]+'">'+Array.from(letters,c=>'<button type="button" data-letter="'+c+'">'+c+'</button>').join('')+'</div>':'';
 const characters=Array.from(practiceWord(q,1).normalize('NFC'));
 const slots=characters.map(c=>'<span class="'+(c===' '?'space-slot':'')+'"></span>').join('');
 const lengthLabel='characters';
 const field='<label class="spell-field'+(wrong>=0?' incorrect':'')+'" style="--count:'+characters.length+'"><div class="spell-line"><div class="spell-slots" aria-hidden="true">'+slots+'</div><input id="answer" lang="'+lang+'" aria-invalid="'+(wrong>=0)+'" enterkeyhint="done" aria-label="'+(state.translating?'Type the translation':sp[0])+' ('+characters.length+' '+lengthLabel+')" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="80" required></div></label>';
 const promptWord=practiceWord(q,0),source=sourceLanguage(q);
 const soundLabel=t(47)+' · '+promptWord;
 const prompt=state.translating||lang==='en'
  ? '<button type="button" class="pair-word" lang="'+source+'" data-voice="'+source+'" data-say="'+promptWord+'" aria-label="'+soundLabel+'"><span>'+promptWord+'</span>'+icon('speaker')+'</button>'
  : '<div class="prompt-tools"><button type="button" class="translate-word" data-translate aria-expanded="false" aria-controls="english-preview"><span class="pair-word" lang="'+lang+'">'+promptWord+'</span><small class="preview-hint">Show English</small></button><button type="button" class="prompt-audio" data-say="'+promptWord+'" aria-label="'+soundLabel+'">'+icon('speaker')+'</button><small id="english-preview" lang="en" hidden>English: '+word(q,0,'en')+'</small></div>';
 const pair='<div class="opposites">'+prompt+'<span class="pair-symbol" aria-hidden="true">'+coin+'</span>'+field+'</div>';
 const form='<form id="spell">'+pair+keyboard+'</form>';
 const feedback=wrong>=0?sp[4]:'';
 const hintsBox='<button class="hintlink" data-hints aria-expanded="'+hints+'">'+icon('book')+' '+sp[hints?3:2]+'</button>'+ '<div class="answers" '+(hints?'':'hidden')+'>'+tiles+'</div>';
 return modePicker()+'<div class="layout"><section class="board"><div class="boardtop"><span class="pill">'+icon('leaf')+t(5)+' '+(q+1)+' '+t(6)+' 21 · '+languageNames[lang]+'</span>'+mobileSound+'</div><div class="question"><p>'+(state.translating?'How do you say “'+promptWord+'” in '+languageNames[lang]+'?':t(8))+'</p></div>'+form+'<div aria-live="polite" class="feedback">'+feedback+'</div>'+hintsBox+'</section>'+sidebar()+'</div>';
}
function album(){return '<section class="fullalbum"><div class="row"><h2>'+t(10)+'</h2><span class="count">'+state.won.length+' / 21</span></div>'+track()+'<div class="grid">'+pairs.map((_,i)=>'<div class="entry">'+token(i)+'<strong>'+(state.won.includes(i)?word(i,0,state.learned[i]||legacyLanguage)+' · '+word(i,1,state.learned[i]||legacyLanguage):t(24)+' '+(i+1))+'</strong></div>').join('')+'</div><button class="collectionlink" data-go="play">'+t(50)+'</button></section>'}
const menuText={en:['Players','Disconnect'],pl:['Gracze','Rozłącz'],pt:['Jogadores','Desligar']};
function childLanguages(child){
 const field=document.createElement('fieldset');
 field.className='practice-settings';
 field.innerHTML='<legend>Practice languages</legend><div class="practice-choices">'+langs.map(code=>'<label><input type="checkbox" value="'+code+'">'+languageNames[code]+'</label>').join('')+'</div>';
 field.setAttribute('aria-label','Practice languages for '+child.name);
 const boxes=[...field.querySelectorAll('input')],playerKey=progressKey(child.id);
 function show(settings){
  for(const box of boxes){
   box.checked=settings.includes(box.value);
   box.disabled=box.checked&&settings.length===1;
  }
 }
 show(languageMix(playerKey));
 field.onchange=()=>{
  const settings=boxes.filter(box=>box.checked).map(box=>box.value);
  if(!settings.length){show(languageMix(playerKey));return}
  set('languages.'+playerKey,JSON.stringify(settings));
  if(playerKey===progressKey()){
   mix=settings;resetInput();stopWordAudio();render();
  }
  show(settings);
 };
 return field;
}
function render(){
 document.documentElement.lang='en';
 const signedOut=profile==='guest';
 document.body.classList.toggle('welcome',signedOut);
 if(signedOut){
  $('#app').innerHTML='<section class="connect-screen" aria-label="Ying Yang"><img src="landscape.webp" alt="Illustrated landscape of sunlit hills and a moonlit forest"><button id="connect" class="primary" aria-haspopup="dialog" aria-controls="modal">Connect</button></section>';
  $('.close').ariaLabel=t(46);
  return;
 }
 if(!$('.brandmark svg'))$('.brandmark').innerHTML=coin;
 const justEarned=recentAward?.state===state&&Date.now()<recentAward.until;
 const count='<b class="collection-points'+(justEarned?' earned':'')+'">'+state.points+'</b>';
 $('#nav').innerHTML=['play','collection'].map((v,i)=>'<button class="navbtn '+(collection===Boolean(i)?'current':'')+'" data-go="'+v+'">'+icon(i?'book':'play')+'<span>'+t(i)+'</span>'+(i?count:'')+'</button>').join('');
 const accountLabel=get(childNameKey(selectedChild()))||menuText.en[0];
 const account=$('#account');account.innerHTML=icon('user')+'<span></span>';account.querySelector('span').textContent=accountLabel;
 account.ariaLabel=accountLabel;account.title=accountLabel;$('.close').ariaLabel=t(46);
 $('#title').textContent=!collection&&state.translating?'Translations':t(collection?22:3);const player=get(childNameKey(selectedChild()));$('#subtitle').textContent=player?familyText.en[5]+' · '+player:state.translating&&!collection?'Translate 21 words and earn collection points.':t(collection?23:4);
 $('#app').innerHTML=collection?album():game();if($('#answer'))$('#answer').value=typed;
}
function navigate(to){location.hash=to;collection=to==='collection';render()}
window.addEventListener('hashchange',()=>{collection=location.hash==='#collection';render()});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='connect'){connect();return}
 if(b.hasAttribute('data-mode')&&state.translating!==(b.dataset.mode==='1')){
  state.translating=b.dataset.mode==='1';save();stopWordAudio();resetInput();render();
 }
 if(b.dataset.go)navigate(b.dataset.go);
 if(b.hasAttribute('data-translate')){
  const preview=$('#english-preview');
  preview.hidden=!preview.hidden;
  b.setAttribute('aria-expanded',String(!preview.hidden));
  b.querySelector('.preview-hint').textContent=preview.hidden?'Show English':'Hide English';
 }
 if(b.dataset.say)speak(b.dataset.say,b.dataset.voice||questionLanguage());
 if(b.hasAttribute('data-switch')){sound=!sound;set('sound',sound?'on':'off');$('.toggle')?.setAttribute('aria-checked',String(sound));$('.compact-sound')?.setAttribute('aria-pressed',String(sound));if(!sound)stopWordAudio()}
 if(b.hasAttribute('data-hints')){
  hints=!hints;b.setAttribute('aria-expanded',String(hints));
  b.innerHTML=icon('book')+' '+spelling.en[hints?3:2];b.nextElementSibling.hidden=!hints;
 }
 if(b.dataset.letter&&$('#answer')){const input=$('#answer');input.setRangeText(b.dataset.letter,input.selectionStart,input.selectionEnd,'end');input.focus();evaluateAnswer(input)}
 if(b.hasAttribute('data-replay')){const round=currentRound();round.q=0;round.rotation=(round.rotation+1)%6;resetInput();save();render()}
});
// Keep the input and its selection when a child taps a pronunciation or accent key.
document.addEventListener('pointerdown',e=>{
 if(document.activeElement?.id==='answer'&&e.target.closest('[data-letter],[data-say],[data-translate],[data-hints],[data-switch]'))e.preventDefault();
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
let audioContext;
function prepareAudio(){
 if(!sound)return;
 try{
  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context)return;
  audioContext??=new Context();
  if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
 }catch{}
}
function answerTone(correct){
 if(!sound)return;
 prepareAudio();
 if(!audioContext)return;
 const start=audioContext.currentTime;
 const notes=correct?[523.25,659.25,783.99]:[261.63,196];
 notes.forEach((hz,i)=>{
  const at=start+i*.085,osc=audioContext.createOscillator(),gain=audioContext.createGain();
  osc.type=correct?'sine':'triangle';osc.frequency.value=hz;
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.095,at+.012);
  gain.gain.exponentialRampToValueAtTime(.001,at+.15);
  osc.connect(gain);gain.connect(audioContext.destination);osc.start(at);osc.stop(at+.16);
 });
}
for(const event of ['pointerdown','keydown'])document.addEventListener(event,e=>{
 if(e.target.closest('#spell'))prepareAudio();
});
function evaluateAnswer(input){
 if(input!==$('#answer')||currentRound().q>=21)return;
 const previous=typed;typed=input.value;
 const answer=norm(typed),expected=norm(practiceWord(currentRound().q,1));
 const full=Array.from(answer).length>=Array.from(expected).length;
 const field=input.closest('.spell-field'),feedback=$('.feedback');
 const invalid=full&&answer!==expected;
 field.classList.toggle('incorrect',invalid);input.setAttribute('aria-invalid',String(invalid));
 feedback.textContent=invalid?spelling.en[4]:'';
 if(invalid){
  if(wrong<0||typed!==previous)answerTone(false);
  wrong=0;return;
 }
 wrong=-1;
 if(!full)return;
 const q=currentRound().q;
 const language=questionLanguage(),answerWord=practiceWord(q,1);
 const result=practiceWord(q,0)+(state.translating?' → ':' ☯ ')+answerWord+'  +1';
 if(!state.translating){
  state.learned[q]=language;
  if(!state.won.includes(q))state.won.push(q);
 }
 state.points++;currentRound().q++;recentAward={state,until:Date.now()+1000};resetInput();save();answerTone(true);
 if(sound)speak(answerWord,language);
 if(currentRound().q===21){if(state.translating)render();else navigate('collection');msg(result);return}
 render();$('.feedback').textContent=result;
 const next=$('#answer');next.focus({preventScroll:true});
}
document.addEventListener('input',e=>{if(e.target.id==='answer'&&!e.isComposing)evaluateAnswer(e.target)});
document.addEventListener('compositionend',e=>{if(e.target.id==='answer')evaluateAnswer(e.target)});
document.addEventListener('submit',e=>{if(e.target.id==='spell')e.preventDefault()});
const modal=$('#modal'),body=$('#dialogbody');
$('.close').onclick=()=>modal.close();
modal.addEventListener('close',()=>body.replaceChildren());
const hex=bytes=>Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
async function digest(pin,salt){
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:210000,hash:'SHA-256'},material,256));
}
function parentButton(){return '<button type="button" data-parent>'+icon('lock')+' '+t(2)+'</button>'}
body.addEventListener('click',e=>{if(e.target.closest('[data-parent]'))openParentLock()});
function openParentLock(){
 stopSignIn();
 // Older PIN records have no owner. Keep them scoped to signed-out play.
 const owner=profile;
 const pinKey=owner==='guest'?'pin':'pin.'+owner;
 const snapshot=get(pinKey);
 const record=JSON.parse(snapshot||'null');
 const field=(name,label)=>'<label>'+t(label)+'<input name="'+name+'" inputmode="numeric" type="password" pattern="[0-9]{4,8}" maxlength="8" required autocomplete="off"></label>';
 body.innerHTML='<h2>'+t(record?25:26)+'</h2><p>'+t(record?28:27)+'</p><form>'+field('pin',29)+(record?'':field('repeat',30))+'<p class="error" role="alert"></p><button class="primary">'+t(record?32:31)+'</button></form>';
 body.querySelector('input').focus();
 const form=body.querySelector('form');
 form.onsubmit=async e=>{
  e.preventDefault();const pin=form.elements.pin.value,err=form.querySelector('.error');
  if(!record&&pin!==form.elements.repeat.value){err.textContent=t(33);return}
  const submit=form.querySelector('button');submit.disabled=true;
  try{
   const salt=record?.salt||hex(crypto.getRandomValues(new Uint8Array(16))),hash=await digest(pin,salt);
   if(!modal.open||!form.isConnected||profile!==owner)return;
   if(get(pinKey)!==snapshot){openParentLock();return}
   if(record&&record.hash!==hash){err.textContent=t(34);return}
   if(!record)set(pinKey,JSON.stringify({salt,hash}));
   familyPanel(true);
  }finally{submit.disabled=false}
 };
};
function switchProfile(p){profile=p;sessionStorage.setItem(key('profile'),p);state=saved();mix=languageMix(progressKey());stopWordAudio();resetInput();render()}
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
   status.textContent=authText.en.extension;
   let signer=extensionSigner();
   for(let poll=0;!signer&&poll<20;poll++){
    await new Promise(resolve=>setTimeout(resolve,100));
    if(activeAttempt!==attempt)return;
    signer=extensionSigner();
   }
   if(!signer){fail(authText.en[location.protocol==='file:'?'file':'missing']);return}
   await confirmIdentity(signer,attempt);return;
  }
  attempt.pool=new SimplePool();
  const ephemeral=generateSecretKey();
  const uri=createNostrConnectURI({clientPubkey:getPublicKey(ephemeral),relays:signerRelays,secret:hex(crypto.getRandomValues(new Uint8Array(16))),perms:['get_public_key','sign_event:27235'],name:'Ying Yang',...(location.protocol.startsWith('http')?{url:location.origin}:{})});
  const pairing=BunkerSigner.fromURI(ephemeral,uri,{pool:attempt.pool},attempt.controller.signal);
  link.href=uri;link.hidden=false;status.textContent=authText.en.approveAmber;
  link.click();
  const signer=await pairing;
  if(activeAttempt!==attempt){await signer.close();return}
  attempt.signer=signer;
  await confirmIdentity(signer,attempt);
 }catch{fail()}
}

$('#account').onclick=()=>{familyPanel();modal.showModal()};
function connect(){
 const labels=authText.en,mobile=isMobileSigner();
 body.innerHTML='<h2>Connect</h2><p id="sign-status" role="status"></p><div class="actions"><a hidden id="amber-open" class="primary">'+labels.amber+'</a><button hidden id="auth-retry">'+labels.retry+'</button></div>';
 $('#auth-retry').onclick=()=>startSignIn(mobile);
 modal.showModal();
 startSignIn(mobile);
}
function familyPanel(unlocked=false){
 const labels=familyText.en;
 const addForm=unlocked?'<form id="add-child"><label>'+labels[1]+'<input name="child" required maxlength="40" autocomplete="off"></label><button class="primary">'+labels[2]+'</button></form>':'';
 body.innerHTML='<h2>'+(unlocked?labels[0]:menuText.en[0])+'</h2>'+addForm+'<section id="players" class="actions"></section><p>'+t(48)+'</p><div class="actions" id="family-actions"></div>';
 const list=$('#players'), actions=$('#family-actions'), prefix=key(childNameKey(''));
 const children=Object.keys(storage).filter(k=>k.startsWith(prefix)).map(k=>({id:k.slice(prefix.length),name:storage.getItem(k)})).sort((a,b)=>a.name.localeCompare(b.name,'en'));
 function button(container,label,run){
  const element=document.createElement('button');element.type='button';element.textContent=label;element.onclick=run;container.append(element);return element;
 }
 function choose(id){
  sessionStorage.setItem(key('selected.'+profile),id);
  state=saved();mix=languageMix(progressKey());stopWordAudio();resetInput();navigate('play');modal.close();
 }
 if(children.length){
  const heading=document.createElement('h3');heading.textContent=labels[3];list.append(heading);
  for(const child of children){
   const row=document.createElement('div');row.className='player-row';list.append(row);
   button(row,child.name,()=>choose(child.id)).dataset.player=child.id;
   if(unlocked)row.append(childLanguages(child));
  }
 }
 actions.innerHTML=unlocked?'':parentButton();
 if(profile!=='guest')button(actions,menuText.en[1],()=>{switchProfile('guest');modal.close()}).id='logout';
 if(!unlocked)return;
 const form=$('#add-child'),input=form.elements.child;
 input.oninput=()=>input.setCustomValidity('');
 form.onsubmit=e=>{
  e.preventDefault();const name=input.value.trim();
  if(!name){input.setCustomValidity(labels[6]);input.reportValidity();return}
  const id=crypto.randomUUID();set(childNameKey(id),name);
  familyPanel(true);
  body.querySelector('[data-player="'+id+'"]').focus();
 };
 const name=get(childNameKey(selectedChild()));
 const reset=button(actions,t(39)+(name?' · '+name:''),null);reset.id='reset';
 if($('#logout'))actions.insertBefore(reset,$('#logout'));
 $('#reset').onclick=()=>{
  body.innerHTML='<h2>'+t(39)+'</h2><p>'+t(40)+'</p><div class="actions"><button id="cancel">'+t(42)+'</button><button id="confirm" class="primary">'+t(41)+'</button></div>';
  $('#cancel').onclick=()=>familyPanel(true);$('#confirm').onclick=()=>{state={q:0,won:[],points:0,rotation:0,learned:{},translating:state.translating,translation:{q:0,rotation:0}};resetInput();save();navigate('play');modal.close()};
 };
}
render();
