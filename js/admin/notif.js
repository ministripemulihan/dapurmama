/* js/admin/notif.js (v42): notifikasi pesanan baru di perangkat penjual (saat aplikasi terbuka di latar belakang) + panduan notifikasi server.
   Notifikasi saat aplikasi DITUTUP dikirim server (Telegram/email/WhatsApp Fonnte, lihat tab Setup di Google Sheet). */
const NF_KEY='tokonotif';
const nfOn=()=>{try{return localStorage.getItem(NF_KEY)=='1'&&typeof Notification!='undefined'&&Notification.permission=='granted'}catch(e){return false}};
async function nfTampil(j,n){if(!nfOn()||!adm()||!(n>0))return;const j2=j=='bayar'?'Pembayaran perlu dicek':'Pesanan baru',t=n+' '+j2.toLowerCase()+(j=='bayar'?'':' masuk'),o={body:'Buka aplikasi > Verifikasi',tag:'toko-'+j,renotify:true,icon:'icon-192.png',badge:'icon-192.png'};
 try{const r=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(r&&r.showNotification)return r.showNotification(NM()+': '+t,o);new Notification(NM()+': '+t,o)}catch(e){}}
async function nfAktif(){if(typeof Notification=='undefined')return toast('Browser ini tidak mendukung notifikasi.');const p=await Notification.requestPermission();if(p!='granted')return toast('Izin notifikasi ditolak. Aktifkan di pengaturan browser/situs.');localStorage.setItem(NF_KEY,'1');draw();nfTampil('baru',1)}
function nfMati(){localStorage.setItem(NF_KEY,'0');draw()}
function nfBox(){const ok=typeof Notification!='undefined',on=nfOn();
 return`<div class="box"><b>🔔 Notifikasi pesanan baru</b><p class="mut">1) <b>Di perangkat ini</b>: pop-up saat aplikasi terbuka tetapi ada di latar belakang (tab lain / HP dikunci tanpa menutup aplikasi). ${ok?'':'<span class="bad">Browser ini tidak mendukung.</span>'}</p>${on?'<p>Status: <b>aktif</b></p><button class="btn o s" onclick="nfMati()">Matikan</button> <button class="btn o s" onclick="nfTampil(\'baru\',1)">Coba</button>':'<button class="btn s" '+(ok?'':'disabled ')+'onclick="nfAktif()">Aktifkan notifikasi di perangkat ini</button>'}<p class="mut" style="margin-top:10px">2) <b>Saat aplikasi ditutup</b>: dikirim oleh server ke Telegram, email, atau WhatsApp (Fonnte). Isi tab <b>Setup</b> di Google Sheet bagian "Notifikasi", lalu menu ${esc(NM())} &gt; <b>Kirim notifikasi tes</b>. Perlu Code.gs versi v42.</p></div>`}
const ringNF0=ring;ring=function(j,n){try{nfTampil(j,n)}catch(e){}return ringNF0.apply(this,arguments)};
const aSetNF0=aSet;aSet=function(){return aSetNF0()+nfBox()};
(window.__muat=window.__muat||[]).push('js/admin/notif.js');
