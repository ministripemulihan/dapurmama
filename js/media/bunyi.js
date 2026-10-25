/* js/inti/dasar.js */
const $=s=>document.querySelector(s),rp=n=>'Rp'+Math.round(n).toLocaleString('id-ID'),KEY='dimsummama1';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* v31: nama toko dari tab Setup di Google Sheet (S.toko). Tanda berbahaya dibuang agar aman dipasang di HTML. */
const NM=()=>{try{return String((S&&S.toko&&S.toko.n)||'Dimsum Mama').replace(/[<>"`\\$]/g,'')||'Dimsum Mama'}catch(e){return'Dimsum Mama'}},
 NK=()=>{try{return String((S&&S.toko&&S.toko.k)||'Surabaya').replace(/[<>"`\\$]/g,'')||'Surabaya'}catch(e){return'Surabaya'}},
 NA=()=>{try{return String((S&&S.toko&&S.toko.al)||'Ngagel, Surabaya').replace(/[<>"`\\$]/g,'')||'Ngagel, Surabaya'}catch(e){return'Ngagel, Surabaya'}},
 tplToko=t=>String(t==null?'':t).replace(/DIMSUM MAMA/g,NM().toUpperCase()).replace(/Dimsum Mama/g,NM()).replace(/Ngagel, Surabaya/g,NA()),
 NMH=()=>{const w=esc(NM()).split(' ');return w.length>1?w.slice(0,-1).join(' ')+' <span class="o">'+w[w.length-1]+'</span>':'<span class="o">'+w[0]+'</span>'};
const ST={menunggu:'Menunggu Pembayaran',verifikasi:'Menunggu Verifikasi',dibayar:'Sudah Dibayar',dikemas:'Sedang Dikemas',dikirim:'Dikirim',selesai:'Selesai',dibatalkan:'Dibatalkan',kedaluwarsa:'Kedaluwarsa'};
const PAID=['dibayar','dikemas','dikirim','selesai'];
const API_URL='https://script.google.com/macros/s/AKfycbw6mibz3DwBAztRTpQVXPl6p_zpw5J2yYA5E8GxhHvY6N4OPRiWuHTu5Auu1jwbjbEGcg/exec';
const me=()=>{try{return JSON.parse(localStorage.getItem('tokoses'))}catch(e){return null}},adm=()=>{const m=me();return !!m&&m.r!='customer'};
const P=id=>S.p.find(p=>p.id==id),avail=(p,k)=>p.habis?0:Math.max(0,p.v[k].s-p.v[k].r),tot=p=>Object.keys(p.v).reduce((a,k)=>a+avail(p,k),0),price=p=>p.d||p.h;
const lines=()=>S.cart.map(c=>({...c,p:P(c.pid)}));
const hm=t=>new Date(t).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
const waNo=v=>{let d=String(v||'').replace(/\D/g,'');if(d.startsWith('0'))d='62'+d.slice(1);return d},qLink=()=>/^https?:/.test(qsrc()||'');
/* Banyak perangkat: ambil pesanan baru, status, stok, dan akun terbaru dari Sheet (tiap 20 detik) */
const RK={menunggu:1,verifikasi:2,dibayar:3,dikemas:4,dikirim:5,selesai:6,dibatalkan:7,kedaluwarsa:7};
const idle=()=>{const a=document.activeElement;return !a||!/INPUT|TEXTAREA|SELECT/.test(a.tagName)};
const hari=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const tg=t=>new Date(t+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
const nid=p=>p+Date.now().toString(36)+Math.floor(Math.random()*1e3).toString(36);
/* ===== v20: edit pesanan, cetak, refund, rekap per tanggal + ekspor, cermin ke Google Sheet ===== */
const ds=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
/* ----- tagihan + pengingat WhatsApp ----- */
const hrs=t=>Math.max(0,Math.floor((new Date(hari()+'T00:00:00')-new Date(t+'T00:00:00'))/864e5));
/* ===== v23: pesan ulang, toko tutup/libur, bunyi pesanan baru, QRIS di kasir ===== */
const tglWIB=()=>{try{return new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Jakarta'})}catch(e){return ds(new Date())}};
const addHari=(t,k)=>{const d=new Date(t+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+k);return d.toISOString().slice(0,10)};
function seed(){
 const M=(n,h,g,e,s,imgs)=>({n,k:'Frozen',h,d:0,g,e,t:'makanan',luar:false,habis:false,sold:0,img:imgs[0]||'',imgs,v:{porsi:{s,r:0}}});
 const L=[M('Shrimp Roll Udang Ayam',35000,300,'🍤',20,['img/shrimp-roll-4.jpg','img/shrimp-roll-1.jpg','img/shrimp-roll-2.jpg','img/shrimp-roll-3.jpg']),
 M('Dimsum Ayam Udang',30000,300,'🥟',20,[])];
 L.forEach((p,i)=>p.id='p'+(i+1));
 return{p:L,o:[],cart:[],qris:'',kurir:{JNE:1,TIKI:1,Wahana:1,Gojek:1}}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.p)return s}catch(e){}return seed()}
function save(){try{stampU()}catch(e){}try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Penyimpanan penuh. Pakai gambar QRIS yang lebih kecil.')}sync()}
function toast(m){const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2800)}
function expire(){let ch=0;if(poBersih())ch=1;S.o.forEach(o=>{if(o.status=='menunggu'&&Date.now()>o.exp){rel(o);o.status='kedaluwarsa';ch=1}});if(ch)save()}
function rel(o){if(o.po)return;o.items.forEach(i=>{const p=P(i.pid);if(p)p.v[i.key].r=Math.max(0,p.v[i.key].r-i.q)})}
async function hs(pw,salt){if(!window.crypto||!crypto.subtle){toast('Browser tidak mendukung. Buka lewat https atau localhost.');throw 0}const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pw));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function mk(u,pw,r){const sl=[...crypto.getRandomValues(new Uint8Array(8))].map(x=>x.toString(16)).join('');return{u,s:sl,h:await hs(pw,sl),r}}
async function salin(t){try{await navigator.clipboard.writeText(t)}catch(e){const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(x){}a.remove()}toast('Tersalin. Tempel di WhatsApp.')}
function waNum(h){let d=String(h||'').replace(/[^\d+]/g,'');if(d[0]=='+')d=d.slice(1);if(d[0]=='0')d='62'+d.slice(1);else if(d[0]=='8')d='62'+d;return/^62\d{8,13}$/.test(d)?d:''}
function waOpen(hp,msg){const n=waNum(hp);if(!n)return toast('Nomor HP pelanggan belum benar. Perbaiki di tab Pelanggan.'),false;open('https://wa.me/'+n+'?text='+encodeURIComponent(msg),'_blank');return true}
/* konfirmasi tanpa menggambar ulang layar, supaya isian yang sedang diketik tidak hilang */
function kfX(){const d=$('#kf');if(d)d.remove()}
function konfirm(msg,fn,lbl){kfX();const d=document.createElement('div');d.id='kf';d.className='mod';d.innerHTML=`<div><b>Yakin?</b><p>${esc(msg)}</p><div class="row"><button class="btn o" id="kfn">Batal</button><button class="btn r" id="kfy">${esc(lbl||'Ya, lanjutkan')}</button></div></div>`;document.body.appendChild(d);$('#kfn').onclick=kfX;$('#kfy').onclick=()=>{kfX();fn()};d.onclick=e=>{if(e.target==d)kfX()}}
function wibNow(){try{const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()),g=t=>(p.find(x=>x.type==t)||{}).value;return{wd:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday')),min:(+g('hour'))*60+(+g('minute'))}}catch(e){const d=new Date();return{wd:d.getDay(),min:d.getHours()*60+d.getMinutes()}}}
function salinTeks(t,msg){const ok=()=>toast(msg||'Tersalin.');try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).then(ok,()=>salin2(t,ok))}catch(e){}salin2(t,ok)}
function salin2(t,ok){const a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove();ok()}
(window.__muat=window.__muat||[]).push('js/inti/dasar.js');
