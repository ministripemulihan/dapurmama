/* js/inti/galat.js: mencatat galat (error) dan menunjukkan berkas mana yang bermasalah. Dimuat PERTAMA.
   Pembeli tidak melihat apa-apa. Admin melihat kotak kecil di bawah layar; catatan juga ada di Admin > Alat Toko. */
(function(){
var K='dm_galat',terakhir='';
function baca(){try{return JSON.parse(localStorage.getItem(K))||[]}catch(e){return[]}}
function pendek(u){var m=/(js\/[\w\/.-]+|css\/[\w.-]+|index\.html)/.exec(String(u||''));return m?m[1]:String(u||'')}
function admin(){try{var s=JSON.parse(localStorage.getItem('tokoses'));if(s&&s.r&&s.r!='customer')return true}catch(e){}return /app=admin/.test(location.search)}
function banner(g){
 if(!admin()||!document.body)return;
 var d=document.getElementById('galat27');
 if(!d){d=document.createElement('div');d.id='galat27';d.setAttribute('role','alert');
  d.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:99;background:#7a1f16;color:#fff;border-radius:12px;padding:10px 12px;font:13px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4);max-height:40vh;overflow:auto';
  var h=document.createElement('b');h.textContent='Ada galat di aplikasi (kirim catatan ini ke pembuat aplikasi):';d.appendChild(h);
  var x=document.createElement('div');x.id='galat27l';d.appendChild(x);
  var b=document.createElement('button');b.textContent='Tutup';b.style.cssText='margin-top:6px;padding:6px 12px;border-radius:8px;border:0';b.onclick=function(){d.remove()};d.appendChild(b);
  document.body.appendChild(d)}
 var l=document.getElementById('galat27l'),r=document.createElement('div');
 r.textContent='• '+(g.f||'?')+(g.l?' baris '+g.l:'')+': '+g.m;l.appendChild(r);
 while(l.childNodes.length>5)l.removeChild(l.firstChild)}
function catat(m,f,l,c){
 var g={t:Date.now(),m:String(m||'').slice(0,300),f:pendek(f),l:l||0,c:c||0},kunci=g.m+'|'+g.f+'|'+g.l;
 if(kunci==terakhir)return;terakhir=kunci;setTimeout(function(){terakhir=''},5000);
 var L=baca();L.push(g);try{localStorage.setItem(K,JSON.stringify(L.slice(-20)))}catch(e){}
 try{console.error('[galat] '+g.f+':'+g.l+' '+g.m)}catch(e){}
 banner(g)}
window.galat27=catat;window.galatBaca=baca;window.galatHapus=function(){try{localStorage.removeItem(K)}catch(e){}};
addEventListener('error',function(e){
 var t=e.target;
 if(t&&t!==window&&t.tagName=='SCRIPT'){catat('Berkas gagal dimuat (tidak ada atau salah ketik)',t.src,0,0);return}
 if(t&&t!==window)return; // gambar/font gagal dimuat: sudah ditangani aplikasi
 catat(e.message,e.filename,e.lineno,e.colno)},true);
addEventListener('unhandledrejection',function(e){var r=e.reason;catat('Janji ditolak: '+(r&&r.message||r),'',0,0)});
(window.__muat=window.__muat||[]).push('js/inti/galat.js');
})();
