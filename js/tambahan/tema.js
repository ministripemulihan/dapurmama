/* js/tambahan/tema.js : v65 jenis jualan + tampilan depan dari tab Setup (tanpa coding).
   Membaca S.toko (dikirim server dari tab Setup): jj (baju/makanan/keduanya), wr/w2 (warna), lb/h1/h2/hp (tulisan beranda), rb (rekening), qf/qb (QRIS).
   Membungkus home(), qList(), draw(), terapkanToko(). Server lama (tanpa bidang ini) = tampilan tidak berubah. */
(function(){
function T(){try{return(typeof S=='object'&&S&&S.toko)||{}}catch(e){return{}}}
function terang(h){var n=parseInt(h.slice(1),16),f=function(c){return Math.min(255,Math.round(c+(255-c)*.28)).toString(16).padStart(2,'0')};return'#'+f(n>>16&255)+f(n>>8&255)+f(n&255)}
function tema(){try{var t=T(),el=document.getElementById('tema65');
 if(!t.wr){if(el)el.textContent='';return}
 if(!el){el=document.createElement('style');el.id='tema65';document.head.appendChild(el)}
 var a=t.wr,b=t.w2||terang(a);
 el.textContent=':root{--acc:'+a+';--gr:linear-gradient(90deg,'+a+','+b+')}'
  +'body:not(.admapp) .pill{border-color:color-mix(in srgb,'+a+' 50%,transparent);background:color-mix(in srgb,'+a+' 10%,transparent);color:'+b+'}'
  +'body:not(.admapp) .pill i{background:'+a+'}'
  +'body:not(.admapp) .st{background:color-mix(in srgb,'+a+' 14%,transparent)}'}catch(e){}}
function baris(v){return String(v||'').split('|').map(function(x){return x.trim()}).filter(Boolean)}
function hero(h){try{var t=T(),jj=t.jj||'keduanya',bk=t.rb&&t.rb.bank?t.rb.bank:'',byr=bk?'QRIS / transfer '+bk:(jj=='keduanya'?'':'QRIS');
 var lb=t.lb,h1=t.h1,h2=t.h2,hp=t.hp;
 if(jj=='baju'){lb=lb||'Pakaian Pilihan dari '+NK();if(!h1&&!h2){h1='Pakaian|Kekinian';h2='Pilih Warna|dan Ukuranmu'}hp=hp||'Koleksi pakaian dan aksesori pilihan. Pilih warna dan ukuran, bayar lewat '+(byr||'QRIS')+', dikirim ke seluruh Indonesia.'}
 else if(jj=='makanan'){hp=hp||'Makanan rumahan pilihan, dibuat segar setiap hari. Pesan, bayar lewat '+(byr||'QRIS')+', kami kirim ke rumahmu.'}
 if(lb)h=h.replace(/(<span class="pill"><i><\/i>)[^<]*(<\/span>)/,function(m,a,b){return a+esc(lb)+b});
 if(h1||h2){var p1=baris(h1),p2=baris(h2);h=h.replace(/<h1>[\s\S]*?<\/h1>/,function(){return'<h1>'+p1.map(esc).join('<br>')+(p1.length&&p2.length?'<br>':'')+p2.map(function(x){return'<em>'+esc(x)+'</em>'}).join('<br>')+'</h1>'})}
 if(hp)h=h.replace(/<p>Koleksi pakaian[^<]*<\/p>/,function(){return'<p>'+esc(hp)+'</p>'});
 else if(bk)h=h.replace('bayar lewat QRIS BCA','bayar lewat '+byr);
 if(byr)h=h.replace('⚡ Bayar QRIS BCA','⚡ Bayar '+esc(byr));
 if(jj=='makanan')h=h.replace('🛡 Stok jelas per warna &amp; ukuran','🛡 Stok jelas setiap hari');
 if(jj=='baju'){var n=S.p.filter(function(p){return p.t=='fashion'&&tot(p)>0}).length;h=h.replace(/<small>Menu makanan tersedia hari ini<\/small><b>\d+ menu<\/b>/,'<small>Produk pakaian tersedia</small><b>'+n+' produk</b>')}
 }catch(e){}return h}
if(typeof home=='function'){var h0=home;home=function(){return hero(h0.apply(this,arguments))}}
if(typeof qList=='function'){var q0=qList;qList=function(){var L=q0.apply(this,arguments),t=T();
 L.forEach(function(x){if(x.lain){x.n='QRIS Toko';x.s='Dari tab Setup / Pengaturan'}});
 if(t.qb===0&&L.some(function(x){return x.lain}))L=L.filter(function(x){return x.lain});
 if(t.qf)L=L.filter(function(x){return x.lain}).concat(L.filter(function(x){return!x.lain}));
 return L}}
if(typeof draw=='function'){var d0=draw;draw=function(){tema();return d0.apply(this,arguments)}}
var tk0=window.terapkanToko;window.terapkanToko=function(){tema();return tk0?tk0.apply(this,arguments):undefined};
tema();
try{var t=T();if((t.jj&&t.jj!='keduanya')||t.wr||t.lb||t.h1||t.h2||t.hp||t.rb||t.qf||t.qb===0)setTimeout(function(){try{draw()}catch(e){}},0)}catch(e){}
(window.__muat=window.__muat||[]).push('js/tambahan/tema.js');
})();
