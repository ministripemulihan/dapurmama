/* js/inti/mulai.js: keadaan awal dan perintah yang berjalan saat halaman dibuka. Dimuat PALING AKHIR.
   Baris pertama memeriksa apakah ada berkas lain yang gagal dimuat, lalu namanya dicatat. */
(function(){var ada=window.__muat||[],perlu=["js/inti/dasar.js","js/inti/sinkron.js","js/inti/tampilan.js","js/inti/pwa.js","js/media/foto.js","js/media/qris.js","js/media/bunyi.js","js/toko/ongkir.js","js/toko/wilayah.js","js/toko/alamat.js","js/toko/jadwal.js","js/toko/resi.js","js/toko/katalog.js","js/toko/belanja.js","js/toko/akun.js","js/toko/info.js","js/admin/pesanan.js","js/admin/stok.js","js/admin/offline.js","js/admin/cetak.js","js/admin/laporan.js","js/admin/cadangan.js","js/admin/pengguna.js","js/admin/katalog.js","js/admin/pengaturan.js","js/admin/biaya.js","js/admin/keuangan.js","js/admin/beranda.js","js/admin/dasbor.js"],hilang=perlu.filter(function(p){return ada.indexOf(p)<0});
 if(hilang.length&&window.galat27)window.galat27('Berkas gagal dimuat: '+hilang.join(', '),'js/inti/mulai.js',0)})();
let S=load(),V={q:'',cat:'Semua',tab:'home',open:null,sel:{q:1},kota:'',kur:''};
try{addEventListener('hashchange',draw);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{try{document.documentElement.dataset.theme=localStorage.getItem('tokotema')||'dark'}catch(e){document.documentElement.dataset.theme='dark'};}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{addEventListener('scroll',()=>{const b=$('#pg'),h=document.documentElement;if(b)b.style.width=(h.scrollTop/((h.scrollHeight-h.clientHeight)||1)*100)+'%'},{passive:true});}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{addEventListener('storage',()=>{S=load();draw()});}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{setInterval(()=>{const r=route();if(r.startsWith('/bayar/')||r=='/cek'){S=load();draw()}},5000);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{if('serviceWorker' in navigator&&(location.protocol=='https:'||location.hostname=='localhost'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{addEventListener('beforeinstallprompt',e=>{e.preventDefault();DIP=e;instUI()});}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{addEventListener('appinstalled',()=>{DIP=null;localStorage.setItem('tokoinst','ok');instUI()});}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{addEventListener('hashchange',()=>instUI());}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{instUI();}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{addEventListener('scroll',()=>{const h=document.querySelector('header');if(!h)return;const y=scrollY;if(innerWidth<=720)h.classList.toggle('hide',y>LY&&y>90);else h.classList.remove('hide');LY=y},{passive:true});}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{addEventListener('keydown',e=>{if(!V.lb)return;if(e.key=='Escape')lbX();if(e.key=='ArrowRight')lbGo(1);if(e.key=='ArrowLeft')lbGo(-1)});}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{try{FQ=JSON.parse(localStorage.getItem('tokofaq'))||[]}catch(e){};}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{setInterval(()=>{const r=route();if(r.startsWith('/bayar/'))stat(r.slice(7))},8000);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{setInterval(()=>poll(0),20000);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{pub();}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{setInterval(pub,60000);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{loadFaq();}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{setInterval(loadFaq,120000);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{setInterval(offPoll,40000);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{snapAll();}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
/* ----- draf pesanan tersimpan otomatis (tidak hilang saat layar ter-refresh) ----- */
try{try{const dr=JSON.parse(localStorage.getItem('draftoff'));if(dr&&dr.od&&Array.isArray(dr.od.items)&&adm()){V.od=dr.od;V.oe=dr.oe&&OF().find(o=>o.id==dr.oe)?dr.oe:null;V.draftBack=1}else localStorage.removeItem('draftoff')}catch(e){};}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{setInterval(()=>{try{if(!adm()){localStorage.removeItem('draftoff');return}if(V.od&&(V.od.items.length||V.od.nama))localStorage.setItem('draftoff',JSON.stringify({od:V.od,oe:V.oe||null}));else localStorage.removeItem('draftoff')}catch(e){}},2000);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
/* ===== Keamanan sisi browser: keluar otomatis admin setelah 30 menit tanpa aktivitas ===== */
try{V.act=Date.now();}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{['click','keydown','touchstart'].forEach(e=>addEventListener(e,()=>{V.act=Date.now()},{passive:true}));}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{setInterval(()=>{if(adm()&&Date.now()-V.act>30*60000){keluar();toast('Keluar otomatis karena tidak ada aktivitas.')}},60000);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{ulasLoad();}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{setInterval(ulasLoad,90000);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{['pointerdown','keydown','touchend','click'].forEach(e=>addEventListener(e,bunyiBuka,{passive:true}));}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{try{poResetLokal()}catch(e){};}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{setInterval(()=>{try{poResetLokal()}catch(e){}},60000);}catch(e){window.galat27&&galat27(e.message,"js/inti/mulai.js",0)}
try{draw()}catch(e){if(window.galat27)window.galat27(e.message,"js/inti/mulai.js",0);var a=document.getElementById("app");if(a)a.innerHTML="<div style='padding:24px;font:16px/1.5 system-ui,sans-serif'><b>Sebagian aplikasi gagal dimuat.</b><p>Coba muat ulang halaman. Jika masih begini, hubungi toko.</p></div>"}
(window.__muat=window.__muat||[]).push('js/inti/mulai.js');
