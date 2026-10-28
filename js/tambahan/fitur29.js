/* js/tambahan/fitur29.js
   Dimsum Mama v29: hal-hal kecil yang sering terlupa tetapi mempercepat transaksi.
   Berdiri sendiri (pola sama dengan fitur27.js): memantau #app lalu menambah elemen setelah layar digambar.
   Tidak mengubah Code.gs. Jika berkas ini gagal dimuat, aplikasi tetap jalan seperti v28.

   PEMBELI
   1. Tombol Bayar tidak bisa terkirim dua kali (klik ganda) dan berubah jadi "Memproses...".
   2. Isian checkout: keyboard HP yang tepat, isi otomatis browser (nama, telepon, alamat), cek nomor WhatsApp langsung.
   3. Keranjang: Hapus bisa diurungkan; cek ongkir sebelum checkout.
   4. Halaman produk: tombol - dan + untuk jumlah.
   5. Halaman bayar: hitung mundur batas bayar, salin nomor pesanan, tombol tanya penjual.
   6. Cek pesanan: daftar pesanan di HP ini (sekali ketuk), tombol Tempel, huruf besar otomatis.

   PENJUAL
   1. Kasir: uang diterima, tombol uang cepat, kembalian besar di layar.
   2. Tab Verifikasi dan Pesanan: kolom cari dan saringan status; tombol Kemas semua yang sudah dibayar.
   3. Judul tab dan ikon aplikasi menampilkan jumlah pembayaran yang menunggu dicek.
   4. Alat Toko: Label kirim 10x15 cm (cetak satu atau semua), salin alamat, buka peta; tautan toko siap salin.
   5. Peringatan sebelum menutup halaman bila nota kasir belum dicatat. */
(function(){
'use strict';
var FILE='js/tambahan/fitur29.js';
var LS={get:function(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var h=function(s){return esc(s==null?'':s)};
var $1=function(id){return document.getElementById(id)};
function safe(f,n){try{return f()}catch(e){try{window.galat27&&window.galat27(n+': '+(e&&e.message||e),FILE,0)}catch(x){}}}
var cp=function(t,m){if(typeof salinTeks=='function')salinTeks(t,m);else toast('Salin manual: '+t)};

/* ---------- CSS ---------- */
var st=document.createElement('style');
st.textContent='button,.btn,.chip,.card,.sz,.sw,summary{touch-action:manipulation}'
+'@media(max-width:720px){input,select,textarea{font-size:16px}}'
+'@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}'
+'.step29{display:flex;gap:8px;align-items:center}.step29 input{text-align:center;flex:1}.step29 .btn{min-width:48px}'
+'.u29{display:flex;gap:12px;align-items:center;pointer-events:auto}.u29 button{background:rgba(255,255,255,.22);color:#fff;border:0;border-radius:10px;padding:6px 12px;font-weight:800;cursor:pointer}'
+'.k29{font-size:22px;font-weight:800;margin-top:8px}.c29 .chips29{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}'
+'#kb29 .big{font-size:46px;color:var(--ok)}'
+'.f29 input{margin-bottom:8px}.f29 .chips{padding:6px 0}.wa29{display:block;margin-top:4px}'
+'.lb29row{padding:8px 0;border-bottom:1px solid var(--line)}';
document.head.appendChild(st);

/* ================= PEMBELI ================= */

/* 1. Cegah klik ganda pada tombol Bayar */
var ordBusy=false,order0=window.order;
function ordBtn(on){var b=document.querySelector('#sum button[onclick="order()"]');if(!b)return;
 if(on){if(!b.dataset.t29)b.dataset.t29=b.textContent;b.disabled=true;b.textContent='Memproses…'}
 else if(b.dataset.t29){b.disabled=false;b.textContent=b.dataset.t29}}
if(typeof order0=='function'){window.order=function(){
 if(ordBusy)return;ordBusy=true;ordBtn(true);
 var r;try{r=order0.apply(this,arguments)}catch(e){ordBusy=false;ordBtn(false);throw e}
 Promise.resolve(r).catch(function(e){safe(function(){throw e},'order')}).then(function(){ordBusy=false;ordBtn(false)});
 return r}}

/* 2. Isian checkout */
function postCheckout(){
 if(route()!='/checkout')return;
 var set=function(id,a){var e=$1(id);if(!e)return;for(var k in a)e.setAttribute(k,a[k])};
 set('nm',{autocomplete:'name',enterkeyhint:'next',autocapitalize:'words'});
 set('wa',{autocomplete:'tel',inputmode:'tel',enterkeyhint:'next',type:'tel'});
 set('al',{autocomplete:'street-address',enterkeyhint:'next'});
 set('ps',{autocomplete:'postal-code',inputmode:'numeric',enterkeyhint:'next'});
 set('ct',{enterkeyhint:'done'});
 var wa=$1('wa');if(wa&&!wa.dataset.v29){wa.dataset.v29=1;
  var info=document.createElement('small');info.id='wah29';info.className='wa29 mut';wa.insertAdjacentElement('afterend',info);
  var cek=function(){var v=wa.value.trim();if(!v){info.textContent='';info.className='wa29 mut';return}
   var n=typeof waNum=='function'?waNum(v):'';
   if(n){info.textContent='✓ Nomor valid (+'+n+')';info.className='wa29 ok'}else{info.textContent='Nomor belum benar. Contoh: 08123456789';info.className='wa29 bad'}};
  wa.addEventListener('input',cek);cek()}}

/* 3a. Hapus keranjang bisa diurungkan */
function undoToast(msg,fn){
 var o=document.querySelector('.toast.u29');if(o)o.remove();
 var d=document.createElement('div');d.className='toast u29';var s=document.createElement('span');s.textContent=msg;
 var b=document.createElement('button');b.textContent='Urungkan';
 var t=setTimeout(function(){d.remove()},6000);
 b.onclick=function(){clearTimeout(t);d.remove();fn()};
 d.appendChild(s);d.appendChild(b);document.body.appendChild(d)}
window.hapus29=function(i){var c=S.cart[i];if(!c)return;var cp0=JSON.parse(JSON.stringify(c));
 S.cart.splice(i,1);save();draw();
 undoToast('Dihapus dari keranjang.',function(){S.cart.splice(Math.min(i,S.cart.length),0,cp0);save();draw()})};
function postCartHapus(){
 if(route()!='/keranjang')return;
 var n=0;[].forEach.call(document.querySelectorAll('#app .w button'),function(b){
  if(b.textContent.trim()=='Hapus'&&/S\.cart\.splice/.test(b.getAttribute('onclick')||'')){b.setAttribute('onclick','hapus29('+n+')');n++}})}

/* 3b. Cek ongkir di keranjang */
var OC=LS.get('dm29oc',{pid:'',rid:'',open:false}),ocMuat=0,ocGagal=0;
function ocHTML(){
 var L=lines();
 if(!window.WIL_P){
  if(!ocMuat&&typeof wilMuat=='function'){ocMuat=1;wilMuat('indeks.js').then(ocRender,function(){ocGagal=1;ocRender()})}
  return ocGagal?'<p class="mut">Daftar kota belum bisa dimuat. Pilih kota langsung di halaman Checkout.</p>':'<p class="mut">Memuat daftar kota…</p>'}
 var opt=function(ar,sel){return ar.map(function(o){return '<option value="'+h(o[0])+'"'+(o[0]==sel?' selected':'')+'>'+h(o[1])+'</option>'}).join('')};
 var kotas=OC.pid?wilR(OC.pid):[];
 var x='<label>Provinsi tujuan</label><select onchange="oc29(\'p\',this.value)"><option value="">Pilih provinsi…</option>'+opt(wilP(),OC.pid)+'</select>';
 if(OC.pid)x+='<label>Kota / Kabupaten</label><select onchange="oc29(\'r\',this.value)"><option value="">Pilih kota/kabupaten…</option>'+opt(kotas,OC.rid)+'</select>';
 if(OC.pid&&OC.rid){
  var kn=(kotas.filter(function(k){return k[0]==OC.rid})[0]||[])[1]||'',z0=V.zona,o=[],gagal=false;
  V.zona=zonaWil(kn,OC.pid,OC.rid);
  try{o=kur(kn,L)}catch(e){gagal=true}finally{V.zona=z0}
  var sub=L.reduce(function(a,l){return a+price(l.p)*l.q},0);
  x+=gagal?'<p class="bad">Ongkir belum bisa dihitung untuk isi keranjang ini.</p>'
   :o.length?'<div style="margin-top:10px">'+o.map(function(k){return '<div class="row lb29row"><span><b>'+h(k.k)+'</b><div class="mut">'+h(k.e)+'</div></span><span style="text-align:right"><b>'+rp(k.fee)+'</b><div class="mut">Total '+rp(sub+k.fee)+'</div></span></div>'}).join('')+'</div><small class="mut">Tarif simulasi. Tarif pasti tampil di Checkout setelah alamat lengkap diisi.</small>'
   :'<p class="bad">Tidak ada kurir untuk tujuan ini. Makanan non tahan lama hanya dikirim ke Surabaya via Gojek/Grab.</p>'}
 return x}
function ocRender(){var e=$1('oc29b');if(e)safe(function(){e.innerHTML=ocHTML()},'cek ongkir')}
window.oc29=function(k,v){if(k=='p'){OC.pid=v;OC.rid=''}else OC.rid=v;LS.set('dm29oc',OC);ocRender()};
window.oc29t=function(o){OC.open=!!o;LS.set('dm29oc',OC)};
function postCartOngkir(){
 if(route()!='/keranjang'||!S.cart.length||$1('oc29'))return;
 var w=document.querySelector('#app .w');if(!w)return;
 var d=document.createElement('details');d.id='oc29';d.className='box';if(OC.open)d.open=true;
 d.setAttribute('ontoggle','oc29t(this.open)');
 d.innerHTML='<summary><b>🚚 Cek ongkir dulu</b> <span class="mut">tanpa isi alamat</span></summary><div id="oc29b">'+ocHTML()+'</div>';
 w.appendChild(d)}

/* 4. Tombol - dan + pada jumlah di jendela produk */
function postStepper(){
 if(!V.open)return;var inp=document.querySelector('#app .mod input[type=number]');
 if(!inp||inp.dataset.s29)return;inp.dataset.s29=1;inp.setAttribute('inputmode','numeric');
 var mk=function(t,d){var b=document.createElement('button');b.type='button';b.className='btn o s';b.textContent=t;
  b.setAttribute('aria-label',d>0?'Tambah jumlah':'Kurangi jumlah');
  b.onclick=function(){var n=Math.max(1,(parseInt(inp.value,10)||1)+d);inp.value=n;if(V.sel)V.sel.q=n};return b};
 var w=document.createElement('div');w.className='step29';inp.parentNode.insertBefore(w,inp);
 w.appendChild(mk('−',-1));w.appendChild(inp);w.appendChild(mk('+',1))}

/* 5. Halaman bayar */
function payOrder(){var r=route();if(r.indexOf('/bayar/')!=0)return null;var inv;try{inv=decodeURIComponent(r.slice(7))}catch(e){inv=r.slice(7)}
 return (S.o||[]).filter(function(o){return o.inv==inv})[0]||null}
function mmss(ms){var s=Math.max(0,Math.floor(ms/1000)),m=Math.floor(s/60);return String(m).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function tickBayar(){var e=$1('cd29');if(!e)return;var o=payOrder();if(!o||!o.exp)return;var rem=o.exp-Date.now();
 e.textContent=rem>0?mmss(rem):'Waktu habis';e.className='big '+(rem<180000?'bad':'')}
function postPay(){
 var o=payOrder();if(!o||$1('pay29'))return;
 var first=document.querySelector('#app .w .box');if(!first)return;
 var d=document.createElement('div');d.id='pay29';d.className='box';
 var h1='';
 if(o.status=='menunggu'&&o.exp)h1='<div class="row"><span>Sisa waktu untuk membayar</span><b id="cd29" class="big">--:--</b></div>';
 d.innerHTML=h1+'<div class="row" style="justify-content:flex-start;gap:8px;margin-top:'+(h1?'10':'0')+'px"><button class="btn o s" id="pay29a">📋 Salin nomor pesanan</button><button class="btn o s" id="pay29b">💬 Tanya penjual</button></div>';
 first.parentNode.insertBefore(d,first);
 $1('pay29a').onclick=function(){cp(o.inv,'Nomor pesanan disalin.')};
 $1('pay29b').onclick=function(){var n=typeof waNo=='function'?waNo(S.wa||''):'';if(String(n).length<9)return toast('Nomor WhatsApp toko belum diisi.');
  open('https://wa.me/'+n+'?text='+encodeURIComponent('Halo '+NM()+', saya mau tanya pesanan '+o.inv+'.\nStatus: '+(ST[o.status]||o.status)+'\nTotal: '+rp(o.tf||o.total||0)+'\nNama: '+(o.nama||'')),'_blank')};
 tickBayar()}
setInterval(function(){safe(tickBayar,'hitung mundur')},1000);

/* 6. Cek pesanan */
function postCek(){
 if(route()!='/cek')return;var ci=$1('ci');if(!ci||ci.dataset.c29)return;ci.dataset.c29=1;
 ci.setAttribute('autocapitalize','characters');ci.setAttribute('autocomplete','off');ci.setAttribute('enterkeyhint','search');
 ci.addEventListener('input',function(){var p=ci.selectionStart;ci.value=ci.value.toUpperCase();try{ci.setSelectionRange(p,p)}catch(e){}});
 ci.addEventListener('keydown',function(e){if(e.key=='Enter'&&ci.value.trim())go('/bayar/'+ci.value.trim())});
 var pb=document.createElement('button');pb.type='button';pb.className='btn o s';pb.style.marginTop='8px';pb.textContent='📋 Tempel nomor dari salinan';
 pb.onclick=function(){if(!navigator.clipboard||!navigator.clipboard.readText)return toast('Tekan lama di kolom, lalu pilih Tempel.');
  navigator.clipboard.readText().then(function(t){ci.value=String(t||'').trim().toUpperCase().slice(0,40)},function(){toast('Tekan lama di kolom, lalu pilih Tempel.')})};
 ci.insertAdjacentElement('afterend',pb);
 if(adm())return;
 var L=(S.o||[]).filter(function(o){return o.src!='kasir'&&o.inv}).slice().sort(function(a,b){return (b.t||0)-(a.t||0)}).slice(0,8);
 if(!L.length)return;
 var d=document.createElement('div');d.className='box';d.id='cek29';
 d.innerHTML='<b>Pesanan di HP ini</b><div class="mut">Ketuk untuk melihat status.</div>'+L.map(function(o){
  return '<div class="row lb29row"><span><b>'+h(o.inv)+'</b><div class="mut">'+h(ST[o.status]||o.status)+' · '+rp(o.tf||o.total||0)+'</div></span><button class="btn s" data-inv="'+h(o.inv)+'" onclick="go(\'/bayar/\'+this.dataset.inv)">Lihat</button></div>'}).join('');
 var bx=ci.closest('.box');if(bx)bx.insertAdjacentElement('afterend',d)}

/* ================= PENJUAL ================= */

/* 1. Kasir: uang diterima dan kembalian */
function kasSub(){var s=(V.kas||[]).reduce(function(a,l){var p=P(l.pid);return a+(p?price(p)*l.q:0)},0);return typeof kvPot=='function'?s-kvPot(s):s}
function cuOut(){var e=$1('ck29');if(!e)return;var sub=kasSub(),cu=+V.cu29||0;
 if(!cu){e.textContent='';return}
 e.textContent=cu>=sub?'Kembalian '+rp(cu-sub):'Kurang '+rp(sub-cu);e.className='k29 '+(cu>=sub?'ok':'bad')}
window.cu29=function(v){V.cu29=Math.min(1e9,parseInt(String(v).replace(/\D/g,''),10)||0);var i=$1('cu29');if(i&&String(i.value).replace(/\D/g,'')!=String(V.cu29||''))i.value=V.cu29||'';cuOut()};
function postKasir(){
 if(!adm()||route()!='/admin'||V.tab!='kas'||$1('cash29'))return;
 var btn=document.querySelector('#app button[onclick="kSave()"]');if(!btn||!V.kas||!V.kas.length||(V.kb||'Cash')!='Cash'){return}
 var sub=kasSub(),S2={};[5000,10000,20000,50000,100000].forEach(function(d){S2[Math.ceil(sub/d)*d]=1});
 [50000,100000].forEach(function(n){if(n>=sub)S2[n]=1;S2[Math.ceil((sub+1)/n)*n]=1});delete S2[sub];
 var q=Object.keys(S2).map(Number).sort(function(a,b){return a-b}).slice(0,4);
 var d=document.createElement('div');d.id='cash29';d.className='c29';
 d.innerHTML='<label>Uang diterima dari pembeli</label><div class="chips29"><button type="button" class="btn o s" data-n="'+sub+'">Uang pas</button>'
  +q.map(function(n){return '<button type="button" class="btn o s" data-n="'+n+'">'+rp(n)+'</button>'}).join('')+'</div>'
  +'<input id="cu29" inputmode="numeric" autocomplete="off" placeholder="Atau ketik jumlah uang" value="'+(V.cu29||'')+'" oninput="cu29(this.value)"><div id="ck29" class="k29"></div>';
 btn.parentNode.insertBefore(d,btn);
 [].forEach.call(d.querySelectorAll('button[data-n]'),function(b){b.onclick=function(){cu29(b.dataset.n)}});
 cuOut()}
var ks0=window.kSave;
if(typeof ks0=='function')window.kSave=function(){
 var cash=(V.kb||'Cash')=='Cash',sub=kasSub(),cu=+V.cu29||0,n0=(S.o||[]).length;
 if(cash&&cu>0&&cu<sub)return toast('Uang diterima kurang '+rp(sub-cu)+'.');
 var r=ks0.apply(this,arguments);
 if(cash&&cu>=sub&&sub>0&&S.o.length>n0){var o=S.o[S.o.length-1];
  if(o&&o.src=='kasir'){o.terima=cu;o.kembali=cu-sub;save();if(cu>sub)safe(function(){kembalianBox(cu-sub,cu,sub)},'kembalian')}}
 V.cu29=0;return r};
function kembalianBox(k,cu,sub){
 var o=$1('kb29');if(o)o.remove();var d=document.createElement('div');d.id='kb29';d.className='mod';
 d.innerHTML='<div style="text-align:center"><div class="mut">Kembalian untuk pembeli</div><div class="big">'+rp(k)+'</div><div class="mut">Terima '+rp(cu)+' · Total '+rp(sub)+'</div><button class="btn" id="kb29ok" style="width:100%;margin-top:14px">Selesai</button></div>';
 document.body.appendChild(d);$1('kb29ok').onclick=function(){d.remove()}}

/* 2. Verifikasi dan Pesanan: cari + saringan + kemas semua */
var FS=['dibayar','dikemas','dikirim','selesai'];
function kartu(){var w=document.querySelector('#app .w');if(!w)return[];
 return [].filter.call(w.children,function(e){return e.classList.contains('box')&&e.id!='f29'&&e.querySelector('.st')})}
function terapkan(){
 var q=(V.fq29||'').toLowerCase().trim(),s=V.fs29||'',K=kartu(),n=0;
 K.forEach(function(c){var t=c.textContent.toLowerCase(),se=c.querySelector('.st'),
  ok=(!q||t.indexOf(q)>=0)&&(!s||(se&&se.textContent.trim()==ST[s]));c.style.display=ok?'':'none';if(ok)n++});
 var e=$1('fc29');if(e)e.textContent=(q||s)?('Menampilkan '+n+' dari '+K.length):(K.length+' pesanan')}
window.fq29=function(v){V.fq29=v;terapkan()};
window.fs29=function(s){V.fs29=V.fs29==s?'':s;[].forEach.call(document.querySelectorAll('#f29 .chip'),function(c){c.classList.toggle('on',c.dataset.s==(V.fs29||''))});terapkan()};
function kemasSiap(){var t=tglWIB();return (S.o||[]).filter(function(o){return o.status=='dibayar'&&o.src!='kasir'&&!(o.po&&o.po>t)})}
window.kemas29=function(){var L=kemasSiap();if(!L.length)return toast('Tidak ada pesanan berstatus Sudah Dibayar.');
 konfirm('Ubah '+L.length+' pesanan "Sudah Dibayar" menjadi "Sedang Dikemas"? Pre-order untuk hari lain tidak ikut.',function(){
  L.forEach(function(o){if(o.status=='dibayar')o.status='dikemas'});save();draw();toast(L.length+' pesanan mulai dikemas.')},'Ya, kemas semua')};
function postFilter(){
 if(!adm()||route()!='/admin'||(V.tab!='ord'&&V.tab!='ver'))return;
 var tabs=document.querySelector('#app .tabs');if(!tabs||$1('f29'))return;
 if(V.ft29!=V.tab){V.ft29=V.tab;V.fq29='';V.fs29=''}
 var d=document.createElement('div');d.id='f29';d.className='box f29';
 var chips=V.tab=='ord'?'<div class="chips"><div class="chip '+(V.fs29?'':'on')+'" data-s="" onclick="fs29(\'\')">Semua</div>'
  +FS.map(function(s){return '<div class="chip '+(V.fs29==s?'on':'')+'" data-s="'+s+'" onclick="fs29(\''+s+'\')">'+ST[s]+'</div>'}).join('')+'</div>':'';
 var nk=V.tab=='ord'?kemasSiap().length:0;
 d.innerHTML='<input type="search" id="fq29i" enterkeyhint="search" autocomplete="off" placeholder="Cari nama, invoice, atau nomor WhatsApp" value="'+h(V.fq29||'')+'" oninput="fq29(this.value)">'+chips
  +'<div class="row"><small class="mut" id="fc29"></small>'+(nk?'<button class="btn o s" onclick="kemas29()">📦 Kemas semua yang sudah dibayar ('+nk+')</button>':'')+'</div>';
 tabs.insertAdjacentElement('afterend',d);
 /* chip "Semua" memakai data-s kosong: pastikan klik mengosongkan saringan */
 var all=d.querySelector('.chip[data-s=""]');if(all)all.onclick=function(){V.fs29='';[].forEach.call(d.querySelectorAll('.chip'),function(c){c.classList.toggle('on',c===all)});terapkan()};
 terapkan()}

/* 3. Judul tab dan ikon aplikasi */
function lencana(){
 var base=document.title.replace(/^\(\d+\)\s*/,''),n=0;
 if(adm())n=(S.o||[]).filter(function(o){return o.status=='verifikasi'}).length;
 var t=(n?'('+n+') ':'')+base;if(document.title!=t)document.title=t;
 try{if(n&&navigator.setAppBadge)navigator.setAppBadge(n);else if(navigator.clearAppBadge)navigator.clearAppBadge()}catch(e){}}
setInterval(function(){safe(lencana,'lencana')},4000);

/* 4. Label kirim + tautan toko (Alat Toko) */
function labelOrders(){return (S.o||[]).filter(function(o){return o.src!='kasir'&&(o.status=='dibayar'||o.status=='dikemas')&&o.alamat&&o.alamat!='-'})
 .sort(function(a,b){return (a.t||0)-(b.t||0)})}
function alamatTeks(o){return (o.nama||'')+' ('+(o.wa||'')+')\n'+(o.alamat||'')+(o.kota?', '+o.kota:'')+(o.pos?' '+o.pos:'')}
function labelHTML(o){
 var isi=typeof items=='function'?items(o):'',po=o.po&&typeof poFmt=='function'?poFmt(o.po):'';
 return '<div class="lb"><div class="in"><div class="top"><b>'+h(NM().toUpperCase())+'</b><span>Pengirim: '+h(NA())+''+(S.wa?' · WA '+h(S.wa):'')+'</span></div>'
  +'<div class="kp">KEPADA</div><div class="nm">'+h(o.nama)+'</div><div class="wa">'+h(o.wa)+'</div>'
  +'<div class="al">'+h(o.alamat)+'<br><b>'+h(o.kota||'')+' '+h(o.pos||'')+'</b></div>'
  +'<div class="kr">'+h(o.kurir||'')+'</div>'
  +'<div class="is"><b>Isi:</b> '+h(isi)+'</div>'
  +(o.cat?'<div class="ct"><b>Catatan:</b> '+h(o.cat)+'</div>':'')
  +(o.food?'<div class="fz">❄ FROZEN FOOD: segera masukkan freezer</div>':'')
  +(po?'<div class="fz">PRE-ORDER, kirim '+h(po)+'</div>':'')
  +'<div class="ft">'+h(o.inv)+' · '+new Date(o.t||Date.now()).toLocaleDateString('id-ID')+'</div></div></div>'}
function cetakLabel(L){
 if(!L.length)return toast('Tidak ada pesanan untuk dicetak.');
 var w=open('','_blank');if(!w)return toast('Izinkan pop-up untuk mencetak.');
 var css='@page{size:100mm 150mm;margin:0}*{box-sizing:border-box}html,body{margin:0}body{font:12px/1.35 Arial,sans-serif;color:#000;background:#eee}'
 +'.lb{width:100mm;height:150mm;padding:3mm;page-break-after:always;background:#fff;margin:0 auto 8px}.in{height:100%;border:1.5px solid #000;padding:3mm;display:flex;flex-direction:column;gap:1.6mm;overflow:hidden}'
 +'.top{display:flex;flex-direction:column;border-bottom:1.5px solid #000;padding-bottom:2mm}.top b{font-size:15px}.top span{font-size:10px}'
 +'.kp{font-size:10px;letter-spacing:.12em;margin-top:1mm}.nm{font-size:21px;font-weight:800;line-height:1.15}.wa{font-size:15px;font-weight:700}.al{font-size:14px;line-height:1.35}'
 +'.kr{font-size:19px;font-weight:800;border:1.5px solid #000;padding:1.5mm 3mm;align-self:flex-start;margin-top:1mm}.is{font-size:11.5px}.ct{font-size:11.5px}'
 +'.fz{font-size:12px;font-weight:800;border:1.5px dashed #000;padding:1.5mm;text-align:center}.ft{margin-top:auto;font-size:10.5px;border-top:1px dashed #000;padding-top:1.5mm}'
 +'button{display:block;margin:10px auto;padding:10px 20px;font-size:15px}@media print{button{display:none}body{background:#fff}.lb{margin:0}}';
 w.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Label kirim</title><style>'+css+'</style></head><body>'+L.map(labelHTML).join('')+'<button onclick="print()">Cetak ('+L.length+' label)</button></body></html>');
 w.document.close()}
function dataOrd(inv){return (S.o||[]).filter(function(o){return o.inv==inv})[0]}
window.lb29=function(el,aksi){var o=dataOrd(el.dataset.inv);if(!o)return toast('Pesanan tidak ditemukan.');
 if(aksi=='cetak')cetakLabel([o]);
 else if(aksi=='salin')cp(alamatTeks(o),'Alamat disalin.');
 else if(aksi=='peta')open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([o.alamat,o.kota,o.pos].filter(Boolean).join(', ')),'_blank')};
window.lbAll29=function(){cetakLabel(labelOrders())};
function boxLabel(){
 var L=labelOrders();
 return '<div class="box"><div class="row"><b>Label kirim 10 x 15 cm</b>'+(L.length?'<button class="btn s" onclick="lbAll29()">🖨 Cetak semua ('+L.length+')</button>':'')+'</div>'
  +'<p class="mut">Untuk pesanan Sudah Dibayar dan Sedang Dikemas. Di jendela cetak, pilih kertas 100 x 150 mm (label thermal) atau A6. Nama, alamat, kurir, isi, dan catatan sudah tertata besar.</p>'
  +(L.length?L.map(function(o){return '<div class="lb29row"><div><b>'+h(o.nama)+'</b> · '+h(o.kota||'')+' · '+h(o.kurir||'')+'</div><div class="mut">'+h(o.inv)+' · '+h(ST[o.status]||o.status)+'</div>'
   +'<div class="row" style="justify-content:flex-start;gap:6px;margin-top:6px"><button class="btn o s" data-inv="'+h(o.inv)+'" onclick="lb29(this,\'cetak\')">🖨 Label</button><button class="btn o s" data-inv="'+h(o.inv)+'" onclick="lb29(this,\'salin\')">📋 Salin alamat</button><button class="btn o s" data-inv="'+h(o.inv)+'" onclick="lb29(this,\'peta\')">🗺 Peta</button></div></div>'}).join('')
   :'<p class="ok"><b>Tidak ada pesanan yang menunggu dikemas.</b></p>')+'</div>'}
function baseUrl(){return location.origin+location.pathname.replace(/index\.html$/,'')}
window.tt29=function(el){cp(el.dataset.t,'Tautan disalin.')};
function boxTautan(){
 var u=baseUrl(),n=typeof waNo=='function'?waNo(S.wa||''):'',wl=n.length>=9?'https://wa.me/'+n+'?text='+encodeURIComponent('Halo '+NM()+', saya mau pesan'):'';
 var row=function(j,t){return '<div class="lb29row"><div class="row"><b>'+h(j)+'</b><button class="btn o s" data-t="'+h(t)+'" onclick="tt29(this)">Salin</button></div><div class="mut" style="word-break:break-all;font-size:13px">'+h(t)+'</div></div>'};
 return '<div class="box"><b>Tautan toko siap salin</b><p class="mut">Tempel di bio Instagram/TikTok, status WhatsApp, atau kemasan.</p>'
  +row('Tautan toko',u)+(wl?row('Tautan chat WhatsApp toko',wl):'<p class="mut">Isi nomor WhatsApp toko di Pengaturan untuk membuat tautan chat.</p>')
  +row('Teks bio siap pakai','Pesan frozen food '+NM()+' (Surabaya, kirim ke seluruh Indonesia): '+u)
  +'<details style="margin-top:8px"><summary><b>Tautan per produk</b></summary>'+(S.p||[]).map(function(p){return row(p.n,u+'index.html#/p/'+p.id)}).join('')+'</details></div>'}
var aa0=window.aAlat;
window.aAlat=function(){return (typeof aa0=='function'?aa0():'')+'<div class="al27">'+boxLabel()+boxTautan()+'</div>'};

/* 5. Peringatan sebelum menutup halaman bila nota kasir belum dicatat */
addEventListener('beforeunload',function(e){if(adm()&&V.kas&&V.kas.length){e.preventDefault();e.returnValue='Nota kasir belum dicatat.';return e.returnValue}});

/* ---------- Pemasangan ---------- */
function postAll29(){
 safe(postCheckout,'checkout');safe(postCartHapus,'hapus keranjang');safe(postCartOngkir,'cek ongkir');
 safe(postStepper,'jumlah');safe(postPay,'halaman bayar');safe(postCek,'cek pesanan');
 safe(postKasir,'kasir');safe(postFilter,'saringan');safe(lencana,'lencana');
 if(ordBusy)safe(function(){ordBtn(true)},'tombol bayar')}
var app=$1('app');
if(app&&window.MutationObserver)new MutationObserver(postAll29).observe(app,{childList:true});
window.T29={kasSub:kasSub,labelOrders:labelOrders,labelHTML:labelHTML,kemasSiap:kemasSiap};
postAll29();
(window.__muat=window.__muat||[]).push(FILE);
})();
