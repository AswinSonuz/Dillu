// script.js - small interactions for the pookie page
document.addEventListener('DOMContentLoaded', function () {
  const openBtn = document.getElementById('openNote');
  const closeBtn = document.getElementById('closeNote');
  const note = document.getElementById('note');
  const heartBtn = document.getElementById('heartBtn');
  const photoUpload = document.getElementById('photoUpload');
  const photoStrip = document.getElementById('photoStrip');
  const clearGallery = document.getElementById('clearGallery');
  const startSlideshowBtn = document.getElementById('startSlideshow');
  const slideSpeed = document.getElementById('slideSpeed');
  const audioUpload = document.getElementById('audioUpload');
  const playMusic = document.getElementById('playMusic');
  const createPostcardBtn = document.getElementById('createPostcard');
  const lb = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbClose = document.getElementById('lbClose');
  const lbNext = document.getElementById('lbNext');
  const lbPrev = document.getElementById('lbPrev');
  const voucherBtn = document.getElementById('voucherBtn');
  const shareSecretBtn = document.getElementById('shareSecretBtn');
  const shareSecretModal = document.getElementById('shareSecretModal');
  const shareSecretText = document.getElementById('shareSecretText');
  const shareSecretCode = document.getElementById('shareSecretCode');
  const shareSecretCreate = document.getElementById('shareSecretCreate');
  const shareSecretClose = document.getElementById('shareSecretClose');
  const generatedLink = document.getElementById('generatedLink');
  const surpriseConfetti = document.getElementById('surpriseConfetti');
  const spinWheelBtn = document.getElementById('spinWheelBtn');
  const spinBtn = document.getElementById('spinBtn');
  const wheel = document.getElementById('wheel');
  const spinSection = document.getElementById('spin');
  const quizBtn = document.getElementById('quizBtn');
  const quizSection = document.getElementById('quiz');
  const quizBody = document.getElementById('quizBody');
  const planDateBtn = document.getElementById('planDateBtn');
  const dateSection = document.getElementById('datePlanner');
  const dateTitle = document.getElementById('dateTitle');
  const dateInput = document.getElementById('dateInput');
  const dateSave = document.getElementById('dateSave');
  const dateList = document.getElementById('dateList');
  const secretInput = document.getElementById('secretInput');
  const secretCheck = document.getElementById('secretCheck');
  const secretResult = document.getElementById('secretResult');
  const activityListEl = document.getElementById('activityList');
  const exportJSONBtn = document.getElementById('exportJSON');
  const exportCSVBtn = document.getElementById('exportCSV');
  const clearActivityBtn = document.getElementById('clearActivity');
  const activitySearch = document.getElementById('activitySearch');
  const activityCount = document.getElementById('activityCount');
  const lockActivityBtn = document.getElementById('lockActivity');
  const toastEl = document.getElementById('toast');
  const modal = document.getElementById('activityUnlock');
  const activityCode = document.getElementById('activityCode');
  const activityUnlockBtn = document.getElementById('activityUnlockBtn');
  const activityCancel = document.getElementById('activityCancel');
  const siteLabel = document.getElementById('siteLabel');
  const logoEl = document.querySelector('.logo');
  const themeSelect = document.getElementById('themeSelect');

  // migrate gallery stored as array of src string into objects
  let galleryRaw = JSON.parse(localStorage.getItem('pookie.gallery') || '[]');
  let gallery = [];
  if (galleryRaw.length && typeof galleryRaw[0] === 'string'){
    gallery = galleryRaw.map(src=>({src, name:'photo', size:0, caption:'', tags:[], favorite:false, voice:null}));
  } else {
    gallery = galleryRaw; // already objects
  }
  let activity = JSON.parse(localStorage.getItem('pookie.activity') || '[]');
  let currentIndex = -1;
  let audioURL = null;
  let audioEl = new Audio();
  let activityUnlocked = localStorage.getItem('pookie.activityUnlocked') === '1';

  function typeText(el, text, delay = 25) {
    el.textContent = '';
    let i = 0;
    const t = setInterval(() => {
      el.textContent += text[i++] || '';
      if (i > text.length) clearInterval(t);
    }, delay);
  }

  function showToast(msg, timeout = 2000) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    toastEl.classList.add('show');
    setTimeout(()=>{toastEl.classList.remove('show'); toastEl.classList.add('hidden')}, timeout);
  }

  function logActivity(type, details){
    const entry = {ts: new Date().toISOString(), type, details};
    activity.unshift(entry);
    // keep only last 200 events
    activity = activity.slice(0,200);
    try{ localStorage.setItem('pookie.activity', JSON.stringify(activity)); }
    catch(e){ console.warn('Activity save failed', e); }
    renderActivity();
  }

  function renderActivity(){
    if (!activityListEl) return;
    const term = (activitySearch?.value || '').trim().toLowerCase();
    let list = activity.slice();
    if (term) { list = list.filter(e=>JSON.stringify(e).toLowerCase().includes(term)); }
    activityCount && (activityCount.textContent = `${list.length} events`);
    if (!list.length){ activityListEl.innerHTML = '<p>No activity yet.</p>'; return }
    activityListEl.innerHTML = '';
    list.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'activity-entry fade-in';
      row.innerHTML = `<div><strong>${entry.type}</strong><div class="meta">${entry.ts}</div></div><div class="meta">${JSON.stringify(entry.details||'')}</div>`;
      activityListEl.appendChild(row);
    });
  }
  renderActivity();
  logActivity('site_opened',{});

  exportJSONBtn?.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(activity, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'activity.json'; a.click(); URL.revokeObjectURL(url);
    logActivity('export_json',{}); showToast('Exported JSON');
  });
  exportCSVBtn?.addEventListener('click', ()=>{
    if (!activity.length) return showToast('No activity to export');
    const lines = [['timestamp','type','details']];
    activity.forEach(e=> lines.push([e.ts,e.type,JSON.stringify(e.details||'')]));
    const blob = new Blob([lines.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n')],{type:'text/csv'});
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='activity.csv'; a.click(); URL.revokeObjectURL(url);
    logActivity('export_csv',{}); showToast('Exported CSV');
  });
  clearActivityBtn?.addEventListener('click', ()=>{
    if (!confirm('Clear activity log?')) return;
    activity = []; localStorage.removeItem('pookie.activity'); renderActivity(); showToast('Activity cleared');
    logActivity('activity_cleared',{});
  });

  activitySearch?.addEventListener('input', ()=>renderActivity());

  lockActivityBtn?.addEventListener('click', ()=>{
    if (!confirm('Lock the Activity viewer?')) return;
    activityUnlocked = false; localStorage.removeItem('pookie.activityUnlocked'); setActivityVisible(false);
    logActivity('activity_locked',{});
    showToast('Activity locked');
  });

  openBtn?.addEventListener('click', () => {
    note.classList.add('open');
    openBtn.style.display = 'none';
    closeBtn.style.display = 'inline-block';
    typeText(note.querySelector('.note-text'), "Hey Pookie, you're my favorite little human — I love you more than extra scoops of ice-cream and warm sunsets. 💖")
    // small surprise: confetti + play music if available
    spawnConfetti();
    if (!audioEl.paused && audioEl.src) { audioEl.currentTime = 0; audioEl.play(); }
    logActivity('note_opened',{source:'openBtn'}); showToast('Note opened');
  });

  closeBtn?.addEventListener('click', () => {
    note.classList.remove('open');
    closeBtn.style.display = 'none';
    openBtn.style.display = 'inline-block';
    note.querySelector('.note-text').textContent = 'Click Open to reveal a tiny message...';
    // stop audio when closing note
    if (!audioEl.paused) { audioEl.pause(); playMusic.textContent = 'Play'; }
    logActivity('note_closed',{});
  });

  // Floating hearts
  function spawnHeart(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.innerHTML = '❤️';
    heart.style.fontSize = '20px';
    heart.style.opacity = '0.95';
    heart.style.transition = 'transform 1200ms cubic-bezier(.2,-0.2,.2,1), opacity 1200ms linear';
    document.body.appendChild(heart);
    requestAnimationFrame(() => {
      heart.style.transform = `translateY(-140px) scale(1.7)`;
      heart.style.opacity = '0';
    });
    setTimeout(() => heart.remove(), 1300);
  }

  heartBtn?.addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    spawnHeart(rect.left + rect.width/2, rect.top + rect.height/2);
    logActivity('heart_sent',{});
    showToast('Sent a heart');
  });

  // Surprise: tap the hero to send two hearts
  const hero = document.querySelector('.hero-card');
  hero?.addEventListener('click', (e)=>{
    const x = e.clientX, y = e.clientY;
    spawnHeart(x,y); logActivity('heart_sent',{x,y}); showToast('Sent double hearts');
    setTimeout(()=>spawnHeart(x+18,y+8),60);
  });

  // ---- Gallery: load and render images stored in localStorage ---
  function saveGallery(){
    try{ localStorage.setItem('pookie.gallery', JSON.stringify(gallery)); } catch(e){console.warn('gallery save failed',e)}
  }

  function renderGallery(){
    photoStrip.innerHTML = '';
    if (!gallery.length){
      const help = document.createElement('div');
      help.className = 'pic-card';
      help.innerHTML = '<div class="pic-emoji">📁</div><p>No photos yet — add one!</p>';
      photoStrip.appendChild(help);
      return;
    }
    gallery.forEach((item, i)=>{
      const src = item.src;
      const caption = item.caption || '';
      const el = document.createElement('article');
      el.className = 'pic-card';
      el.innerHTML = `<div class="pic-thumb"><img src="${src}" alt="Photo ${i+1}"/></div><p>${caption || ('Photo '+(i+1))}</p>
        <div class="pic-actions">
          <button class="btn btn-soft setProfile" data-i="${i}">Set Profile</button>
          <button class="btn btn-soft editMeta" data-i="${i}">Edit</button>
          <button class="btn btn-soft favBtn" data-i="${i}">${item.favorite? '★' : '☆'}</button>
          <button class="btn btn-soft voiceBtn" data-i="${i}">${item.voice? '▶' : '🎤'}</button>
          <button class="btn btn-soft stampBtn" data-i="${i}">Stamp</button>
        </div>`;
      // voice/record/play stub: button placeholder
      
      el.addEventListener('click', ()=>{ openLightbox(i) });
      photoStrip.appendChild(el);
    });
    // attach action events
    document.querySelectorAll('.setProfile').forEach(b=>b.addEventListener('click', (e)=>{ e.stopPropagation(); setProfileFromIndex(Number(e.target.dataset.i)); }));
    document.querySelectorAll('.editMeta').forEach(b=>b.addEventListener('click', (e)=>{ e.stopPropagation(); editMeta(Number(e.target.dataset.i)); }));
    document.querySelectorAll('.favBtn').forEach(b=>b.addEventListener('click', (e)=>{ e.stopPropagation(); toggleFavorite(Number(e.target.dataset.i)); }));
    document.querySelectorAll('.voiceBtn').forEach(b=>b.addEventListener('click', (e)=>{ e.stopPropagation(); toggleRecordPlay(Number(e.target.dataset.i), e.target); }));
    document.querySelectorAll('.stampBtn').forEach(b=>b.addEventListener('click', (e)=>{ e.stopPropagation(); stampPhoto(Number(e.target.dataset.i)); }));
  }

  // profile utilities
  function setProfile(dataUrl){
    try{ localStorage.setItem('pookie.profile', dataUrl);}catch(e){console.warn('profile save failed',e)}
    const img = document.getElementById('profileImg');
    if (img){ img.src = dataUrl; img.classList.remove('hidden'); }
    showToast('Profile set'); logActivity('profile_set',{});
  }
  function setProfileFromIndex(i){
    if (!gallery[i]) return; setProfile(gallery[i].src);
  }
  function loadProfile(){
    const p = localStorage.getItem('pookie.profile');
    if (!p) return;
    const img = document.getElementById('profileImg'); if (img){ img.src = p; img.classList.remove('hidden'); }
  }
  function applyTheme(theme){
    document.body.classList.remove('theme-dark','theme-warm');
    if (theme === 'dark') document.body.classList.add('theme-dark');
    if (theme === 'warm') document.body.classList.add('theme-warm');
    localStorage.setItem('pookie.theme', theme);
    showToast(`Theme: ${theme}`);
    logActivity('theme_changed',{theme});
  }
  // read theme
  const savedTheme = localStorage.getItem('pookie.theme') || 'pastel';
  if (themeSelect) { themeSelect.value = savedTheme; themeSelect.addEventListener('change', ()=>applyTheme(themeSelect.value)); }
  applyTheme(savedTheme);

  document.getElementById('profileUpload')?.addEventListener('change', (e)=>{
    const file = e.target.files && e.target.files[0]; if (!file) return;
    compressAndResize(file, 1024, 0.8).then(dataUrl=>{ setProfile(dataUrl); }).catch(()=>showToast('Failed to set profile'));
  });

  function editMeta(i){
    const item = gallery[i]; if (!item) return;
    const newCaption = prompt('Edit caption:', item.caption || '');
    if (newCaption !== null) { item.caption = newCaption; }
    const newTags = prompt('Edit tags (comma separated):', (item.tags||[]).join(','));
    if (newTags !== null) { item.tags = newTags.split(',').map(t=>t.trim()).filter(Boolean); }
    gallery[i] = item; saveGallery(); renderGallery(); showToast('Updated photo'); logActivity('photo_edited',{index:i,caption:item.caption,tags:item.tags});
  }

  function toggleFavorite(i){
    const item = gallery[i]; if (!item) return; item.favorite = !item.favorite; gallery[i]=item; saveGallery(); renderGallery(); showToast(item.favorite? 'Favorited' : 'Unfavorited'); logActivity('photo_favorite',{index:i, favorite:item.favorite});
  }

  loadProfile();
  // voice recording / playing helpers
  let mediaRecorder = null, recordingChunks = [], currentRecordingIndex = null, currentPlayingAudio = null;
  async function startRecordingForIndex(i, btn){
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { showToast('Recording not supported'); return }
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      mediaRecorder = new MediaRecorder(stream);
      recordingChunks = [];
      mediaRecorder.ondataavailable = (ev)=> recordingChunks.push(ev.data);
      mediaRecorder.onstop = async ()=>{
        const blob = new Blob(recordingChunks, {type: 'audio/webm'});
        const reader = new FileReader(); reader.onload = ()=>{
          const dataUrl = reader.result; gallery[i].voice = dataUrl; saveGallery(); renderGallery(); logActivity('voice_recorded',{index:i}); showToast('Voice recorded');
        };
        reader.readAsDataURL(blob);
        try{ stream.getTracks().forEach(t=>t.stop()); }catch(e){}
        mediaRecorder = null; currentRecordingIndex = null; if (btn) btn.textContent = '🎤';
      };
      mediaRecorder.start(); currentRecordingIndex = i; if (btn) btn.textContent = '■'; showToast('Recording... Tap again to stop');
    } catch(e){ console.error('getUserMedia error',e); showToast('Unable to access mic'); }
  }
  function stopRecording(){ if (mediaRecorder) mediaRecorder.stop(); }
  function playVoice(i, btn){ const item = gallery[i]; if (!item || !item.voice) return; if (currentPlayingAudio){ currentPlayingAudio.pause(); currentPlayingAudio = null; if(btn) btn.textContent='▶'; return; } currentPlayingAudio = new Audio(item.voice); currentPlayingAudio.onended = ()=>{ currentPlayingAudio=null; if (btn) btn.textContent = '▶'; }; currentPlayingAudio.play(); if (btn) btn.textContent = '■'; }
  function toggleRecordPlay(i, btn){ const item = gallery[i]; if (!item) return; if (currentRecordingIndex === i){ stopRecording(); return; } if (!item.voice){ startRecordingForIndex(i, btn); } else { playVoice(i, btn); } }

  function stampPhoto(i){ const item = gallery[i]; if (!item) return; const img = new Image(); img.onload = ()=>{ const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height; const ctx = canvas.getContext('2d'); ctx.drawImage(img,0,0); // add a small heart at bottom-right
      const size = Math.round(canvas.width * 0.18); const x = canvas.width - size - 24; const y = canvas.height - size - 24; ctx.fillStyle='#ff6b98'; ctx.beginPath(); const topX = x + size/2; const topY = y + size/3; ctx.moveTo(topX, topY); ctx.bezierCurveTo(topX + size/8, topY - size/5, topX + size/2, topY - size/5, topX + size/2, topY + size/6); ctx.bezierCurveTo(topX + size/2, topY + size/2, topX, topY + size/1.2, topX, topY + size/1.2); ctx.bezierCurveTo(topX, topY + size/1.2 - size/3, topX - size/2, topY + size/2, topX - size/2, topY + size/6); ctx.bezierCurveTo(topX - size/2, topY - size/5, topX - size/8, topY - size/5, topX, topY); ctx.fill(); const dataUrl = canvas.toDataURL('image/jpeg',0.9); // replace or add as new
      gallery[i] = {...item, src: dataUrl}; saveGallery(); renderGallery(); logActivity('photo_stamped',{index:i}); showToast('Photo stamped'); };
    img.onerror = ()=>{ showToast('Could not stamp photo'); }; img.src = item.src;
  }
  renderGallery();

  photoUpload.addEventListener('change', (e)=>{
    const files = [...e.target.files].slice(0,8); // limit to 8
    const promises = files.map(f => compressAndResize(f, 1200, 0.75).then(dataUrl => ({name:f.name,size:f.size,dataUrl}))); 
    Promise.all(promises).then(results=>{
      const newItems = results.map(r=>({src:r.dataUrl,name:r.name,size:r.size,caption:'',tags:[],favorite:false,voice:null}));
      gallery = newItems.concat(gallery).slice(0,12);
      try{ localStorage.setItem('pookie.gallery', JSON.stringify(gallery)); }
      catch(e){ alert('Could not save photos — localStorage full or blocked. Images will still display for this session.'); }
      renderGallery();
      openLightbox(0);
      results.forEach(r => logActivity('photo_added',{name:r.name,size:r.size}));
      saveGallery();
      showToast(`${results.length} photo(s) added`);
    }).catch(err=>{ console.error('read/resize error', err); showToast('Error reading images') });
  });

  clearGallery.addEventListener('click', ()=>{
    if (!confirm('Clear all uploaded photos?')) return; 
    gallery = [];
    localStorage.removeItem('pookie.gallery');
    renderGallery();
    logActivity('gallery_cleared',{});
    showToast('Gallery cleared');
  });

  // show activity if unlocked; activity is hidden by default
  function setActivityVisible(visible){
    const act = document.getElementById('activity');
    if (!act) return;
    if (visible) { act.classList.remove('hidden-activity'); act.setAttribute('aria-hidden', 'false'); }
    else { act.classList.add('hidden-activity'); act.setAttribute('aria-hidden', 'true'); }
  }
  setActivityVisible(activityUnlocked);

  // Lightbox modal logic
  function openLightbox(i){
    currentIndex = i;
    const item = gallery[i];
    lbImage.src = item && item.src;
    lbImage.alt = `Photo ${i+1}`;
    lb.classList.remove('hidden');
    lb.setAttribute('aria-hidden', 'false');
    logActivity('photo_viewed',{index:i});
    showToast('Viewing photo');
  }
  function closeLightbox(){
    lbImage.src = '';
    lb.classList.add('hidden');
    lb.setAttribute('aria-hidden', 'true');
  }
  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e)=>{ if(e.target === lb) closeLightbox(); });
  lbNext.addEventListener('click', ()=>{ if(gallery.length) openLightbox((currentIndex+1)%gallery.length) });
  lbPrev.addEventListener('click', ()=>{ if(gallery.length) openLightbox((currentIndex-1+gallery.length)%gallery.length) });
  // keyboard navigation for lightbox
  document.addEventListener('keydown', (e)=>{
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lbNext.click();
    if (e.key === 'ArrowLeft') lbPrev.click();
  });

  // Audio: play/stop selected file
  audioUpload.addEventListener('change', (e)=>{
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (audioURL) URL.revokeObjectURL(audioURL);
    audioURL = URL.createObjectURL(file);
    audioEl.src = audioURL; audioEl.loop = true; audioEl.volume = 0.6;
    playMusic.disabled = false; playMusic.textContent = 'Play';
    logActivity('audio_added',{name:file.name,size:file.size});
    showToast('Song added');
  });
  playMusic.addEventListener('click', ()=>{
    if(audioEl.paused){ audioEl.play(); playMusic.textContent = 'Pause'; logActivity('audio_play',{}); showToast('Music playing'); }
    else { audioEl.pause(); playMusic.textContent = 'Play'; logActivity('audio_pause',{}); showToast('Music paused'); }
  });

  // Slideshow
  let slideshowTimer = null;
  function startSlideshow(){
    if (!gallery.length) return showToast('No photos for slideshow');
    const speed = Number(slideSpeed?.value) || 4; // seconds
    openLightbox(0);
    slideshowTimer = setInterval(()=>{
      currentIndex = (currentIndex+1) % gallery.length; openLightbox(currentIndex);
    }, speed*1000);
    startSlideshowBtn.textContent = 'Stop Slideshow'; showToast('Slideshow started'); logActivity('slideshow_started',{});
  }
  function stopSlideshow(){ clearInterval(slideshowTimer); slideshowTimer=null; startSlideshowBtn.textContent='Start Slideshow'; showToast('Slideshow stopped'); logActivity('slideshow_stopped',{}); }
  startSlideshowBtn?.addEventListener('click', ()=>{ slideshowTimer? stopSlideshow(): startSlideshow(); });

  // Postcard (simple collage PDF/print)
  createPostcardBtn?.addEventListener('click', ()=>{
    const pics = gallery.slice(0,4).map(i=>i.src); // first 4 pictures
    if (!pics.length) return showToast('Add photos to create a postcard');
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 800; const ctx = canvas.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    // draw grid based on count
    const grid = pics.length===1? [[0,0,canvas.width,canvas.height]] : pics.length===2? [[0,0,canvas.width/2,canvas.height],[canvas.width/2,0,canvas.width/2,canvas.height]] : [[0,0,canvas.width/2,canvas.height/2],[canvas.width/2,0,canvas.width/2,canvas.height/2],[0,canvas.height/2,canvas.width/2,canvas.height/2],[canvas.width/2,canvas.height/2,canvas.width/2,canvas.height/2]];
    const loadPromises = pics.map((src,i)=>new Promise((res,rej)=>{ const img=new Image(); img.crossOrigin='anonymous'; img.onload=()=>res({img,i}); img.onerror=rej; img.src = src; }));
    Promise.all(loadPromises).then(list=>{ list.forEach((o,idx)=>{ const g = grid[idx]; ctx.save(); ctx.beginPath(); ctx.rect(g[0],g[1],g[2],g[3]); ctx.clip(); ctx.drawImage(o.img,g[0],g[1],g[2],g[3]); ctx.restore(); }); const data=canvas.toDataURL('image/jpeg',0.9); const w=window.open(''); w.document.write(`<img src="${data}" style="max-width:100%"/>`); w.document.close(); w.print(); logActivity('postcard_created',{}); showToast('Postcard ready'); }).catch(e=>{ console.error('postcard error',e); showToast('Failed to create postcard') });
  });

  // Voucher: a printable small card
  voucherBtn.addEventListener('click', ()=>{
    const w = window.open('', 'voucher', 'width=600,height=400');
    const html = `
      <html><head><title>Voucher</title><style>body{font-family:Arial, sans-serif;background:#fff3f6;margin:0;display:flex;align-items:center;justify-content:center;height:100vh} .card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 6px 18px rgba(0,0,0,.08);text-align:center} .heart{color:#f06c9b;font-size:28px}</style></head><body>
        <div class="card"><h1>Voucher 💝</h1><p>Redeem for a surprise evening with me.</p><p class="heart">♥</p></div>
      </body></html>`;
    w.document.write(html); w.document.close();
    w.print();
    logActivity('voucher_printed',{});
    showToast('Voucher opened (you can print)');
  });

  // share secret link - encode message into fragment
  shareSecretBtn?.addEventListener('click', ()=>{ shareSecretModal.classList.remove('hidden'); });
  shareSecretClose?.addEventListener('click', ()=>{ shareSecretModal.classList.add('hidden'); });
  shareSecretCreate?.addEventListener('click', ()=>{
    const msg = (shareSecretText.value || '').trim(); const code=(shareSecretCode.value||'').trim(); if (!msg || !code) return showToast('Message and code required');
    const data = btoa(unescape(encodeURIComponent(msg))); const url = `${location.href.split('#')[0]}#secret=${data}&code=${code}`; generatedLink.textContent = url; navigator.clipboard?.writeText(url).then(()=>showToast('Link copied to clipboard')); logActivity('secret_shared',{});
  });

  // on page load: parse secret from URL fragment
  (function parseSharedSecret(){
    try{ const frag = location.hash.slice(1); if (!frag) return; const params = Object.fromEntries(new URLSearchParams(frag.replace(/&/g,'&').replace(/=/g,'=')));
      if (params.secret){ // show modal to enter code and reveal
        const encoded = params.secret; const code = params.code; const entered = prompt('Enter 4-digit code to reveal secret:'); if (entered===code){ const msg = decodeURIComponent(escape(atob(encoded))); alert(`Secret: ${msg}`); logActivity('secret_revealed',{source:'link'}); } else { showToast('Wrong code'); logActivity('secret_attempted',{source:'link'}); }
      }
    }catch(e){}
  })();

  // Secret puzzle
  const SECRET = 'pookie'; // simple secret word, change as needed
  secretCheck.addEventListener('click', ()=>{
    const typed = (secretInput.value || '').trim().toLowerCase();
    if (typed === SECRET){
      secretResult.textContent = 'You unlocked: I love you more than yesterday. ❤️';
      // small confetti and hearts
      spawnConfetti(); spawnHeart(window.innerWidth/2, window.innerHeight/2);
      logActivity('secret_unlocked',{});
      showToast('Secret unlocked ❤️');
    } else {
      secretResult.textContent = "Not quite — try again, pookie 😘";
    }
  });

  // Simple confetti effect
  function spawnConfetti(){
    const cvs = document.createElement('canvas');
    cvs.style.position = 'fixed'; cvs.style.left = '0'; cvs.style.top = '0'; cvs.style.width = '100%'; cvs.style.height = '100%'; cvs.style.pointerEvents = 'none';
    cvs.width = innerWidth; cvs.height = innerHeight;
    const ctx = cvs.getContext('2d');
    document.body.appendChild(cvs);
    const particles = [];
    const colors = ['#ff89a9','#ffd4e0','#fff6e0','#ff9bb1','#ffc4cc'];
    for (let i=0;i<70;i++) particles.push({x:Math.random()*cvs.width,y:Math.random()*-200,vx:-2+Math.random()*4,vy:3+Math.random()*6,color:colors[i%colors.length],r:1+Math.random()*5,rot:Math.random()*6})
    let t = 0
    function draw(){
      t++; ctx.clearRect(0,0,cvs.width,cvs.height);
      particles.forEach(p=>{p.x+=p.vx; p.y+=p.vy; p.rot+=0.05; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.r,p.r/2,3*p.r,2*p.r); ctx.restore();})
      if (t>120){ canvasCleanup(); return }
      requestAnimationFrame(draw);
    }
    function canvasCleanup(){ try{cvs.remove()}catch(e){document.body.removeChild(cvs)}}
    draw();
  }
  surpriseConfetti?.addEventListener('click', spawnConfetti);
  surpriseConfetti?.addEventListener('click', ()=>{ logActivity('confetti_triggered',{}); showToast('Boom! Confetti') });

  // Logo double tap/dblclick detection to show unlock modal
  (function setupLogoUnlock(){
    const target = logoEl || siteLabel;
    if (!target) return;
    let lastTap = 0;
    function checkTap(e){
      const now = Date.now();
      if (now - lastTap < 300) {
        openUnlockModal();
      }
      lastTap = now;
    }
    target.addEventListener('click', checkTap);
    target.addEventListener('dblclick', openUnlockModal);
  })();

  function openUnlockModal(){
    if (!modal) return;
    modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); activityCode.value = '';
    activityCode.focus();
  }
  function closeUnlockModal(){
    if (!modal) return;
    modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); activityCode.value = '';
  }
  activityCancel?.addEventListener('click', ()=>{ closeUnlockModal(); showToast('Cancelled'); });
  activityUnlockBtn?.addEventListener('click', ()=>{ checkUnlock(); });
  activityCode?.addEventListener('keydown', (e)=>{ if (e.key==='Enter') checkUnlock(); });

  // Close modal by clicking backdrop
  modal?.addEventListener('click', (e)=>{ if (e.target === modal) closeUnlockModal(); });
  // Close modal with Escape
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closeUnlockModal(); });

  function checkUnlock(){
    const code = (activityCode?.value || '').trim();
    if (code === '1803'){
      activityUnlocked = true; localStorage.setItem('pookie.activityUnlocked','1'); setActivityVisible(true);
      logActivity('activity_unlocked',{});
      showToast('Activity unlocked'); closeUnlockModal();
    } else {
      logActivity('activity_unlock_failed',{});
      showToast('Wrong code'); activityCode.value = ''; activityCode.focus();
    }
  }

  // Spin wheel logic - make it a full page section
  spinWheelBtn?.addEventListener('click', ()=>{ spinSection?.scrollIntoView({behavior:'smooth'}); setTimeout(()=> spinBtn?.focus(), 560); });
  let spinning = false;
  const prizes = ['Dinner date','Movie night','Ice-cream','Massage','Weekend escape','Dessert on me','Flowers','Surprise!'];
  spinBtn?.addEventListener('click', ()=>{
    if (spinning) return; spinning = true; const deg = 360*6 + Math.floor(Math.random()*360);
    wheel.style.transform = `rotate(${deg}deg)`;
    const chosen = Math.floor(((360 - (deg % 360)) + (360/prizes.length)/2) / (360/prizes.length)) % prizes.length;
    setTimeout(()=>{ showToast(`You won: ${prizes[chosen]}`); logActivity('spin_wheel',{prize:prizes[chosen]}); spinning=false; }, 3100);
  });

  // Quiz logic
  const quizQuestions = [
    {q:'Where did we first meet?', a:['Coffee shop','Park','Online','At a party'], correct:0},
    {q:'What is her favorite ice-cream?', a:['Vanilla','Chocolate','Strawberry','Mango'], correct:2},
    {q:'Which song is "our song"?', a:['Song A','Song B','Song C','Song D'], correct:1},
    {q:'Which place does she love most?', a:['Beach','Mountains','City','Countryside'], correct:0},
    {q:'What is her favorite color?', a:['Pink','Blue','Green','Red'], correct:0}
  ];
  let quizIndex = 0; let quizScore = 0;
  function renderQuizQuestion(){
    if (quizIndex >= quizQuestions.length){
      const pass = quizScore >= 3; quizBody.innerHTML = `<p>You scored ${quizScore}/${quizQuestions.length}. ${pass? 'You win a surprise!' : 'Try again to unlock a surprise.'}</p>`;
      if (pass){ quizBody.innerHTML += `<button id="claimQuiz" class="btn btn-primary">Claim surprise</button>`; document.getElementById('claimQuiz')?.addEventListener('click', ()=>{ spawnConfetti(); showToast('Surprise unlocked!'); logActivity('quiz_completed',{score:quizScore}); }); }
      return;
    }
    const item = quizQuestions[quizIndex];
    quizBody.innerHTML = `<p>${item.q}</p>` + item.a.map((op,i)=>`<button class="btn btn-soft quizOpt" data-i="${i}">${op}</button>`).join('');
    document.querySelectorAll('.quizOpt').forEach(b=> b.addEventListener('click', (e)=>{ const answer = Number(e.target.dataset.i); if (answer === item.correct) { quizScore++; showToast('Correct!'); } else { showToast('Nice try!'); } quizIndex++; renderQuizQuestion(); }));
  }
  quizBtn?.addEventListener('click', ()=>{ quizSection?.scrollIntoView({behavior:'smooth'}); quizIndex=0; quizScore=0; renderQuizQuestion(); setTimeout(()=> quizBody?.querySelector('button')?.focus(), 560); });
  planDateBtn?.addEventListener('click', ()=>{ dateSection?.scrollIntoView({behavior:'smooth'}); renderDates(); setTimeout(()=> dateTitle?.focus(), 560); });

  let dateEvents = JSON.parse(localStorage.getItem('pookie.dates') || '[]');
  function renderDates(){ dateList.innerHTML = ''; if (!dateEvents.length) { dateList.innerHTML = '<p>No saved dates yet.</p>'; return; } dateEvents.forEach((d,i)=>{ const el=document.createElement('div'); el.className='activity-entry'; el.innerHTML=`<div><strong>${d.title}</strong><div class="meta">${new Date(d.when).toLocaleString()}</div></div><div><button class="btn btn-soft deleteDate" data-i="${i}">Remove</button></div>`; dateList.appendChild(el); }); document.querySelectorAll('.deleteDate').forEach(b=> b.addEventListener('click',(e)=>{ const i=Number(e.target.dataset.i); if (!confirm('Remove date?')) return; dateEvents.splice(i,1); localStorage.setItem('pookie.dates', JSON.stringify(dateEvents)); renderDates(); })) }
  dateSave?.addEventListener('click', ()=>{ const title=(dateTitle.value||'').trim(); const when=dateInput.value; if (!title||!when){ showToast('Please fill title & datetime'); return;} dateEvents.unshift({title,when}); localStorage.setItem('pookie.dates', JSON.stringify(dateEvents)); renderDates(); dateTitle.value=''; dateInput.value=''; showToast('Date planned'); logActivity('date_planned',{title,when}); });

  // --- image compression utility
  function compressAndResize(file, maxWidth=1024, quality=0.75){
    return new Promise((resolve, reject)=>{
      const r = new FileReader();
      r.onload = ()=>{
        const img = new Image(); img.onload = ()=>{
          const scale = Math.min(1, maxWidth / img.width);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = r.result;
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

});
