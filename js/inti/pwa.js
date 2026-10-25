/* js/inti/pwa.js */
/* ===== Aplikasi (PWA): pasang di HP ===== */
const STANDALONE=matchMedia('(display-mode: standalone)').matches||navigator.standalone,ADMAPP=/app=admin/.test(location.search);
let DIP=null;
const appBox=()=>`<div class="box"><b>Aplikasi di HP</b><p class="mut">Toko dan dashboard penjual bisa dipasang seperti aplikasi tanpa Play Store. Harus dibuka lewat alamat https (hosting), bukan dari file di HP.</p><ol class="mut" style="padding-left:18px"><li>Buka alamat toko di Chrome (Android) atau Safari (iPhone).</li><li>Tekan tombol <b>Instal</b> yang muncul di bawah, atau menu ⋮ &gt; Instal aplikasi, atau Bagikan &gt; Tambah ke Layar Utama.</li><li>Untuk aplikasi Penjual (langsung ke dashboard), tekan tombol di bawah lalu instal dari sana.</li></ol><div class="row"><button class="btn s" onclick="location.href=location.pathname+'?app=admin#/admin'">Buka versi aplikasi Penjual</button><span class="mut">${STANDALONE?'Sedang berjalan sebagai aplikasi':''}</span></div></div>`;
function instUI(){let el=document.getElementById('inst');if(!el){el=document.createElement('div');el.id='inst';document.body.appendChild(el)}
 const v=localStorage.getItem('tokoinst'),ios=/iphone|ipad|ipod/i.test(navigator.userAgent),adm=route().indexOf('/admin')==0,goAdm=adm&&!ADMAPP&&!STANDALONE,
 ok=!STANDALONE&&v!='ok'&&(Date.now()-(+v||0)>6048e5||goAdm)&&(DIP||ios||goAdm);
 document.body.classList.toggle('hasinst',!!ok);
 el.innerHTML=ok?`<div class="inst"><img class="ic" src="icon-192.png" alt=""><div style="flex:1"><b>${ADMAPP||adm?'Pasang aplikasi Penjual untuk masuk lebih cepat':'Instal '+esc(NM())+' untuk akses lebih cepat'}</b>${DIP||goAdm?'':'<small>Ketuk Bagikan lalu "Tambah ke Layar Utama"</small>'}</div>${goAdm?'<button class="btn s" onclick="location.href=location.pathname+\'?app=admin#/admin\'">Pasang</button>':DIP?'<button class="btn s" onclick="instNow()">Instal</button>':''}<button class="x" onclick="instX()" aria-label="Tutup">✕</button></div>`:''}
async function instNow(){if(!DIP)return;DIP.prompt();const c=await DIP.userChoice;DIP=null;if(c.outcome!='accepted')localStorage.setItem('tokoinst',Date.now());instUI()}
function instX(){localStorage.setItem('tokoinst',Date.now());instUI()}
(window.__muat=window.__muat||[]).push('js/inti/pwa.js');
