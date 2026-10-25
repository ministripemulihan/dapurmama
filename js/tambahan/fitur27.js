/* js/tambahan/fitur27.js
   Dimsum Mama v27: fitur tambahan (berdiri sendiri, dimuat setelah index.html).
   Pembeli: favorit, urutkan/filter katalog, bagikan produk (tautan langsung), banner offline, SEO.
   Penjual (Admin > Alat Toko): ringkasan hari ini, packing list cetak, stok menipis,
   harga modal & laba, balasan cepat WhatsApp.
   Tidak mengubah Code.gs. Jika berkas ini gagal dimuat, aplikasi tetap jalan seperti v26. */
(function(){
'use strict';
var LS={get:function(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var h=function(s){return esc(s==null?'':s)};
var $1=function(id){return document.getElementById(id)};
var wibD=function(t){return new Date(t+7*36e5).toISOString().slice(0,10)};
var todayW=function(){return wibD(Date.now())};
var lbl=function(i){return i.n+(i.key&&i.key!='porsi'?' ('+String(i.key).replace('|',' / ')+')':'')};
var TXT={};

/* ---------- CSS ---------- */
var st=document.createElement('style');
st.textContent='.h27{position:absolute;right:10px;bottom:10px;width:38px;height:38px;border-radius:50%;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:19px;line-height:1;cursor:pointer;display:grid;place-items:center;z-index:2}'
+'.h27.on,.m27.on span{color:#ff4d6d}'
+'#f27 select{width:auto;max-width:100%;min-height:40px;padding:8px 12px}'
+'#off27{position:fixed;left:0;right:0;top:env(safe-area-inset-top,0px);z-index:60;background:#d29922;color:#111;padding:7px 12px;text-align:center;font-size:13px;font-weight:700;display:none}'
+'.al27 textarea{min-height:92px;resize:vertical}.al27 table{width:100%;border-collapse:collapse}.al27 td,.al27 th{padding:6px 4px;text-align:left;border-bottom:1px solid var(--line);vertical-align:middle}'
+'.al27 td input{min-height:38px;padding:6px 10px}.al27 .sc{overflow-x:auto}';
document.head.appendChild(st);

/* ---------- Salin teks ---------- */
function salin(t,msg){
 var ok=function(){toast(msg||'Teks disalin.')};
 var fb=function(){try{var a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok()}catch(e){prompt('Salin teks ini:',t)}};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok).catch(fb);else fb()}
window.cp27=function(id,msg){salin(TXT[id]||'',msg)};

/* ---------- Favorit ---------- */
var FAV=new Set(LS.get('dm27fav',[]));
var F={sort:'',hrg:'',stok:0,fav:0};window.F27=F;
function heart(id){var on=FAV.has(id);return '<button type="button" class="h27'+(on?' on':'')+'" data-f27="'+id+'" aria-label="Favorit" onclick="event.stopPropagation();fav27(\''+id+'\')">'+(on?'♥':'♡')+'</button>'}
window.fav27=function(id){
 if(FAV.has(id))FAV.delete(id);else FAV.add(id);LS.set('dm27fav',Array.from(FAV));
 var on=FAV.has(id);
 document.querySelectorAll('[data-f27="'+id+'"]').forEach(function(b){b.classList.toggle('on',on);var s=b.querySelector('span');(s||b).textContent=on?'♥':'♡'});
 toast(on?'Ditambah ke favorit.':'Dihapus dari favorit.');
 var f=$1('f27');if(f){f.remove()}if(F.fav&&typeof grid=='function')grid();else if(f)postGrid()};

/* ---------- Urutkan & filter katalog ---------- */
function opt(v,t,cur){return '<option value="'+v+'"'+(cur==v?' selected':'')+'>'+t+'</option>'}
function barHTML(){
 return '<div id="f27" class="row" style="justify-content:flex-start;gap:8px;margin:0 0 14px">'
 +'<select aria-label="Urutkan" onchange="f27(\'sort\',this.value)">'+opt('','Urutkan: bawaan',F.sort)+opt('laris','Terlaris',F.sort)+opt('murah','Harga termurah',F.sort)+opt('mahal','Harga termahal',F.sort)+'</select>'
 +'<select aria-label="Rentang harga" onchange="f27(\'hrg\',this.value)">'+opt('','Semua harga',F.hrg)+opt('a25','Sampai Rp25.000',F.hrg)+opt('a50','Sampai Rp50.000',F.hrg)+opt('a100','Sampai Rp100.000',F.hrg)+opt('b100','Di atas Rp100.000',F.hrg)+'</select>'
 +'<span class="chip'+(F.stok?' on':'')+'" onclick="f27(\'stok\',F27.stok?0:1)">Tersedia saja</span>'
 +'<span class="chip'+(F.fav?' on':'')+'" onclick="f27(\'fav\',F27.fav?0:1)">♥ Favorit ('+FAV.size+')</span></div>'}
window.f27=function(k,v){
 if(k=='reset'){F.sort='';F.hrg='';F.stok=0;F.fav=0}else F[k]=v;
 var f=$1('f27');if(f)f.remove();grid()};
function postGrid(){
 var g=$1('grid');if(!g)return;
 if(!$1('f27'))g.insertAdjacentHTML('beforebegin',barHTML());
 var old=$1('e27');if(old)old.remove();
 var rows=[];Array.prototype.forEach.call(g.children,function(c){
  if(!c.classList||!c.classList.contains('card'))return;
  var m=/openP\('([^']+)'\)/.exec(c.getAttribute('onclick')||'');var p=m&&P(m[1]);if(p)rows.push({c:c,p:p})});
 if(!rows.length)return;
 rows.forEach(function(r){var v=r.c.querySelector('.vis');if(v&&!v.querySelector('.h27'))v.insertAdjacentHTML('beforeend',heart(r.p.id))});
 var by={laris:function(a,b){return (b.p.sold||0)-(a.p.sold||0)},murah:function(a,b){return price(a.p)-price(b.p)},mahal:function(a,b){return price(b.p)-price(a.p)}}[F.sort];
 if(by)rows.sort(by);
 rows.forEach(function(r){g.appendChild(r.c)});
 var shown=0;
 rows.forEach(function(r){var p=r.p,pr=price(p),ok=true;
  if(F.stok&&tot(p)<=0)ok=false;
  if(F.fav&&!FAV.has(p.id))ok=false;
  if(F.hrg=='a25'&&pr>25000)ok=false;if(F.hrg=='a50'&&pr>50000)ok=false;if(F.hrg=='a100'&&pr>100000)ok=false;if(F.hrg=='b100'&&pr<=100000)ok=false;
  r.c.style.display=ok?'':'none';if(ok)shown++});
 if(!shown)g.insertAdjacentHTML('beforeend','<p id="e27" class="mut" style="grid-column:1/-1">Tidak ada produk yang cocok. <a href="javascript:f27(\'reset\')">Hapus filter</a></p>')}
if(typeof grid=='function'){var grid0=grid;window.grid=function(){grid0();try{postGrid()}catch(e){}}}

/* ---------- Bagikan produk + tautan langsung ---------- */
window.share27=function(id){
 var p=P(id);if(!p)return;
 var url=location.href.split('#')[0]+'#/p/'+id;
 var text=p.n+' - '+rp(price(p))+(p.d?' (hemat '+rp(p.h-p.d)+')':'')+'\n'+NM()+', '+NA();
 if(navigator.share){navigator.share({title:p.n,text:text,url:url}).catch(function(){})}
 else salin(text+'\n'+url,'Tautan produk disalin.')};
function postModal(){
 if(!V.open||$1('s27'))return;var p=P(V.open);if(!p)return;
 var m=document.querySelector('.mod > div');if(!m)return;var r=m.querySelector('.row');if(!r)return;
 var on=FAV.has(p.id);
 r.insertAdjacentHTML('afterend','<div id="s27" class="row" style="justify-content:flex-start;gap:8px;margin:8px 0"><button type="button" class="btn o s m27'+(on?' on':'')+'" data-f27="'+p.id+'" onclick="fav27(\''+p.id+'\')"><span>'+(on?'♥':'♡')+'</span> Favorit</button><button type="button" class="btn o s" onclick="share27(\''+p.id+'\')">📤 Bagikan</button></div>')}
var PEND=null,PENDT=0;
function deep(){
 var m=/^#\/p\/([\w-]+)$/.exec(location.hash);if(!m)return;
 var id=m[1];try{history.replaceState(null,'',location.href.split('#')[0]+'#/')}catch(e){}
 if(P(id)){V.open=id;V.gi=0;V.sel={q:1}}else{PEND=id;PENDT=Date.now()}
 draw()}

/* ---------- Banner offline ---------- */
var ob=document.createElement('div');ob.id='off27';ob.setAttribute('role','status');
ob.textContent='Anda sedang offline. Pesanan baru bisa dikirim setelah internet kembali.';
document.body.appendChild(ob);
function net(){ob.style.display=navigator.onLine===false?'block':'none'}
addEventListener('offline',net);
addEventListener('online',function(){net();toast('Internet kembali.');try{pub()}catch(e){}});
net();

/* ---------- SEO (JSON-LD) ---------- */
function seo(){
 try{
  if(adm())return;
  var base=location.href.split('#')[0].split('?')[0],abs=function(u){try{return new URL(u,base).href}catch(e){return ''}};
  var tel=String(S.wa||'').replace(/\D/g,'');if(tel[0]=='0')tel='62'+tel.slice(1);
  var g=[{'@type':'Store','name':NM(),'description':NM()+' - '+NA(),'url':base,'image':abs('icon-512.png'),
   'address':{'@type':'PostalAddress','streetAddress':NA(),'addressLocality':NK(),'addressCountry':'ID'}}];
  if(tel.length>=9)g[0].telephone='+'+tel;
  (S.p||[]).slice(0,60).forEach(function(p){var im=(p.imgs&&p.imgs[0])||p.img;
   var o={'@type':'Product','name':p.n,'category':p.k||'','offers':{'@type':'Offer','price':String(price(p)),'priceCurrency':'IDR','availability':tot(p)>0?'https://schema.org/InStock':'https://schema.org/OutOfStock','url':base}};
   if(im)o.image=abs(im);g.push(o)});
  var j=JSON.stringify({'@context':'https://schema.org','@graph':g}).replace(/</g,'\\u003c'),el=$1('ld27');
  if(!el){el=document.createElement('script');el.type='application/ld+json';el.id='ld27';document.head.appendChild(el)}
  if(el.textContent!==j)el.textContent=j}catch(e){}}

/* ---------- Penjual: Alat Toko ---------- */
function barang(o){return (o.items||[]).reduce(function(a,i){return a+(+i.hd||0)*(+i.q||0)},0)}
function ringkas(){
 var td=todayW(),O=S.o||[],
  baru=O.filter(function(o){return o.t&&wibD(o.t)==td}),
  byr=O.filter(function(o){return PAID.indexOf(o.status)>=0&&wibD(o.paid||o.t||0)==td}),
  omz=byr.reduce(function(a,o){return a+barang(o)},0),per={};
 byr.forEach(function(o){(o.items||[]).forEach(function(i){var k=lbl(i);per[k]=(per[k]||0)+(+i.q||0)})});
 var c=function(f){return O.filter(f).length};
 return{td:td,baru:baru.length,byr:byr.length,omz:omz,per:per,
  ver:c(function(o){return o.status=='verifikasi'}),mnt:c(function(o){return o.status=='menunggu'}),
  kem:c(function(o){return o.status=='dibayar'||o.status=='dikemas'}),kir:c(function(o){return o.status=='dikirim'})}}
function ringkasTeks(r){
 var L=Object.keys(r.per).map(function(k){return '- '+k+' x'+r.per[k]});
 return 'RINGKASAN DIMSUM MAMA, '+r.td+'\nPesanan masuk: '+r.baru+'\nPesanan dibayar: '+r.byr+'\nOmzet barang (belum ongkir): '+rp(r.omz)+'\n\nTerjual hari ini:\n'+(L.join('\n')||'- belum ada')
 +'\n\nPerlu tindakan:\n- Menunggu verifikasi: '+r.ver+'\n- Menunggu pembayaran: '+r.mnt+'\n- Perlu dikemas: '+r.kem+'\n- Sedang dikirim: '+r.kir}
function boxRingkas(){
 var r=ringkas(),t=ringkasTeks(r);TXT.ring=t;
 return '<div class="box"><b>Ringkasan hari ini</b><div class="grid" style="margin:10px 0;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">'
 +'<div><div class="mut">Pesanan masuk</div><b class="big">'+r.baru+'</b></div><div><div class="mut">Dibayar</div><b class="big">'+r.byr+'</b></div><div><div class="mut">Omzet barang</div><b class="big">'+rp(r.omz)+'</b></div></div>'
 +'<p class="mut" style="margin:0 0 10px">Perlu tindakan: verifikasi <b>'+r.ver+'</b> · menunggu bayar <b>'+r.mnt+'</b> · perlu dikemas <b>'+r.kem+'</b> · dikirim <b>'+r.kir+'</b></p>'
 +'<button class="btn o s" onclick="cp27(\'ring\',\'Ringkasan disalin.\')">Salin ringkasan (untuk WhatsApp)</button></div>'}

/* Packing list */
function plOrders(){
 var mode=LS.get('dm27pl','dibayar'),jn=LS.get('dm27plj','semua');
 var L=(S.o||[]).filter(function(o){return mode=='dibayar'?o.status=='dibayar':(o.status=='dibayar'||o.status=='dikemas')});
 if(jn=='reguler')L=L.filter(function(o){return !o.po});else if(jn.indexOf('po:')==0)L=L.filter(function(o){return o.po==jn.slice(3)});
 return L.sort(function(a,b){return (a.t||0)-(b.t||0)})}
function plTotals(L){var m={};L.forEach(function(o){(o.items||[]).forEach(function(i){var k=lbl(i);m[k]=(m[k]||0)+(+i.q||0)})});
 return Object.keys(m).sort().map(function(k){return[k,m[k]]})}
function plAlamat(o){return o.alamat||[o.jalan,o.kel,o.kec,o.kota,o.prov,o.pos].filter(Boolean).join(', ')}
function plTeks(L){
 var s='PACKING LIST DIMSUM MAMA, '+todayW()+'\nJumlah pesanan: '+L.length+'\n\nTOTAL YANG DISIAPKAN\n'+plTotals(L).map(function(x){return '[ ] '+x[0]+' x'+x[1]}).join('\n')+'\n';
 L.forEach(function(o){s+='\n----\n'+o.inv+(o.po?'  PRE-ORDER kirim '+o.po:'')+'\n'+o.nama+' / '+o.wa+'\nKurir: '+(o.kurir||'-')+'\n'+plAlamat(o)+'\n'
  +(o.items||[]).map(function(i){return '- '+lbl(i)+' x'+i.q}).join('\n')+(o.cat?'\nCatatan: '+o.cat:'')+'\n'});
 return s}
function plHTML(L){
 var tr=plTotals(L).map(function(x){return '<tr><td>&#9744;</td><td>'+h(x[0])+'</td><td style="text-align:right"><b>'+x[1]+'</b></td></tr>'}).join('');
 var os=L.map(function(o){return '<div class="o"><div class="r"><b>&#9744; '+h(o.inv)+'</b><span>'+h(o.kurir||'-')+(o.po?' &middot; <b>PRE-ORDER kirim '+h(o.po)+'</b>':'')+'</span></div>'
  +'<div><b>'+h(o.nama)+'</b> &middot; '+h(o.wa)+'</div><div>'+h(plAlamat(o))+'</div>'
  +'<ul>'+(o.items||[]).map(function(i){return '<li>'+h(i.q)+' &times; '+h(lbl(i))+'</li>'}).join('')+'</ul>'
  +(o.cat?'<div class="n">Catatan: '+h(o.cat)+'</div>':'')+'</div>'}).join('');
 return '<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Packing list</title><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font:13px/1.45 system-ui,Arial,sans-serif;color:#111;margin:0}h1{font-size:18px;margin:0 0 4px}h2{font-size:15px;margin:16px 0 6px}table{width:100%;border-collapse:collapse}td{padding:4px 6px;border-bottom:1px solid #ccc}.o{border:1px solid #999;border-radius:6px;padding:8px 10px;margin:8px 0;page-break-inside:avoid}.r{display:flex;justify-content:space-between;gap:8px}ul{margin:4px 0 4px 18px;padding:0}.n{background:#fff3cd;padding:3px 6px;border-radius:4px;margin-top:4px}</style></head><body><h1>Packing list '+esc(NM())+'</h1><div>'+todayW()+' &middot; '+L.length+' pesanan</div><h2>Total yang disiapkan</h2><table>'+tr+'</table><h2>Per pesanan</h2>'+os+'</body></html>'}
window.pl27set=function(k,v){LS.set(k,v);draw()};
window.pl27print=function(){
 var L=plOrders();if(!L.length)return toast('Tidak ada pesanan untuk dicetak.');
 var w=open('','_blank');if(!w)return toast('Izinkan pop-up untuk mencetak.');
 w.document.write(plHTML(L));w.document.close();setTimeout(function(){try{w.focus();w.print()}catch(e){}},400)};
window.pl27copy=function(){var L=plOrders();if(!L.length)return toast('Tidak ada pesanan.');salin(plTeks(L),'Packing list disalin.')};
function boxPacking(){
 var mode=LS.get('dm27pl','dibayar'),jn=LS.get('dm27plj','semua');
 var base=(S.o||[]).filter(function(o){return o.status=='dibayar'||o.status=='dikemas'}),pos={};
 base.forEach(function(o){if(o.po)pos[o.po]=1});
 var L=plOrders(),tr=plTotals(L);
 return '<div class="box"><b>Packing list</b><p class="mut">Daftar barang yang harus disiapkan dan lembar per pesanan (nama, alamat, kurir, catatan), siap cetak.</p>'
 +'<div class="row" style="justify-content:flex-start;gap:8px;margin-bottom:10px"><select style="width:auto" onchange="pl27set(\'dm27pl\',this.value)">'+opt('dibayar','Sudah Dibayar saja',mode)+opt('semua','Sudah Dibayar + Sedang Dikemas',mode)+'</select>'
 +'<select style="width:auto" onchange="pl27set(\'dm27plj\',this.value)">'+opt('semua','Semua jenis',jn)+opt('reguler','Bukan pre-order',jn)+Object.keys(pos).sort().map(function(d){return opt('po:'+d,'Pre-order '+d,jn)}).join('')+'</select></div>'
 +(L.length?'<p><b>'+L.length+'</b> pesanan. Total: '+tr.map(function(x){return h(x[0])+' <b>x'+x[1]+'</b>'}).join(' · ')+'</p>':'<p class="mut">Tidak ada pesanan yang cocok.</p>')
 +'<div class="row" style="justify-content:flex-start;gap:8px"><button class="btn s" onclick="pl27print()">🖨 Cetak packing list</button><button class="btn o s" onclick="pl27copy()">Salin sebagai teks</button></div></div>'}

/* Stok menipis */
function stokRows(th){
 var R=[];(S.p||[]).forEach(function(p){
  if(p.t=='fashion'){Object.keys(p.v||{}).forEach(function(k){var a=avail(p,k);if(a<=th)R.push({n:p.n+' '+k.replace('|',' / '),a:a})})}
  else{var a=tot(p);if(a<=th)R.push({n:p.n,a:a})}});
 return R.sort(function(a,b){return a.a-b.a})}
window.thr27=function(v){v=Math.max(0,Math.min(999,Math.floor(+v)||0));LS.set('dm27thr',v);var e=$1('sm27');if(e)e.innerHTML=stokHTML()};
function stokHTML(){
 var th=LS.get('dm27thr',3),R=stokRows(th);
 TXT.stok='STOK MENIPIS DIMSUM MAMA, '+todayW()+'\n'+(R.length?R.map(function(r){return '- '+r.n+': '+(r.a<=0?'HABIS':r.a)}).join('\n'):'Semua aman.');
 return (R.length?'<table>'+R.map(function(r){return '<tr><td>'+h(r.n)+'</td><td style="text-align:right">'+(r.a<=0?'<b class="bad">HABIS</b>':'<b>'+r.a+'</b>')+'</td></tr>'}).join('')+'</table>':'<p class="ok" style="margin:6px 0"><b>Semua stok aman.</b></p>')
 +'<button class="btn o s" style="margin-top:8px" onclick="cp27(\'stok\',\'Daftar stok disalin.\')">Salin daftar</button>'}
function boxStok(){
 var th=LS.get('dm27thr',3);
 return '<div class="box"><div class="row"><b>Stok menipis (semua produk)</b><label class="mut" style="display:flex;align-items:center;gap:8px;margin:0">Batas <input type="number" min="0" value="'+th+'" style="width:76px" onchange="thr27(this.value)"></label></div><div id="sm27">'+stokHTML()+'</div></div>'}

/* Harga modal & laba */
function MD(){return S.modal||(S.modal={})}
function labaData(per){
 var td=todayW(),mo=td.slice(0,7),m=MD(),T={omz:0,mod:0,lab:0,noM:0},R={};
 (S.o||[]).filter(function(o){return PAID.indexOf(o.status)>=0}).forEach(function(o){
  var d=wibD(o.paid||o.t||0);if(per=='hari'&&d!=td)return;if(per=='bulan'&&d.slice(0,7)!=mo)return;
  (o.items||[]).forEach(function(i){
   var q=+i.q||0,hd=+i.hd||0,pr=i.pid?{id:i.pid}:(S.p||[]).find(function(p){return p.n==i.n}),pid=pr?pr.id:null,c=pid!=null?m[pid]:undefined,key=pid||i.n;
   var r=R[key]||(R[key]={n:i.n,q:0,omz:0,lab:0,has:false});
   r.q+=q;r.omz+=hd*q;T.omz+=hd*q;
   if(c!=null){r.has=true;r.lab+=(hd-c)*q;T.lab+=(hd-c)*q;T.mod+=c*q}else T.noM+=hd*q})});
 return{T:T,R:R}}
window.lbper27=function(v){LS.set('dm27lp',v);var e=$1('lb27');if(e)e.innerHTML=labaHTML()};
function labaHTML(){
 var per=LS.get('dm27lp','bulan'),D=labaData(per),T=D.T,known=T.omz-T.noM,mg=known>0?Math.round(T.lab/known*1000)/10:0;
 var rows=Object.keys(D.R).map(function(k){return D.R[k]}).sort(function(a,b){return b.lab-a.lab||b.omz-a.omz});
 return '<div class="row" style="justify-content:flex-start;gap:8px;margin:8px 0"><select style="width:auto" onchange="lbper27(this.value)">'+opt('hari','Hari ini',per)+opt('bulan','Bulan ini',per)+opt('semua','Semua waktu',per)+'</select></div>'
 +'<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:10px"><div><div class="mut">Omzet barang</div><b class="big">'+rp(T.omz)+'</b></div><div><div class="mut">Laba kotor</div><b class="big">'+rp(T.lab)+'</b></div><div><div class="mut">Margin</div><b class="big">'+mg+'%</b></div></div>'
 +(T.noM>0?'<p class="mut">Penjualan '+rp(T.noM)+' belum punya harga modal, jadi belum masuk hitungan laba. Isi modal produknya di atas.</p>':'')
 +(rows.length?'<div class="sc"><table><tr><th>Produk</th><th>Terjual</th><th>Omzet</th><th>Laba</th></tr>'+rows.map(function(r){return '<tr><td>'+h(r.n)+'</td><td>'+r.q+'</td><td>'+rp(r.omz)+'</td><td>'+(r.has?rp(r.lab):'<span class="mut">isi modal</span>')+'</td></tr>'}).join('')+'</table></div>':'<p class="mut">Belum ada penjualan pada periode ini.</p>')
 +'<p class="mut" style="font-size:13px">Belum memotong refund, biaya kemasan, dan ongkir. Hanya pesanan toko online (bukan Kasir/Offline terpisah).</p>'}
window.mdl27=function(id,v){
 v=String(v).replace(/[^\d]/g,'');var m=MD();if(v==='')delete m[id];else m[id]=Math.min(+v,1e9);
 save();var e=$1('lb27');if(e)e.innerHTML=labaHTML();
 var u=$1('lu27'+id),p=P(id);if(u&&p)u.textContent=v===''?'-':rp(price(p)-m[id])};
function boxLaba(){
 var m=MD();
 return '<div class="box"><b>Harga modal dan laba</b><p class="mut">Isi modal per unit. Data ini hanya tersimpan di akun admin dan tidak tampil ke pembeli.</p>'
 +'<div class="sc"><table><tr><th>Produk</th><th>Harga jual</th><th>Modal</th><th>Laba/unit</th></tr>'
 +(S.p||[]).map(function(p){var c=m[p.id];return '<tr><td>'+h(p.n)+'</td><td>'+rp(price(p))+'</td><td><input inputmode="numeric" style="width:110px" value="'+(c==null?'':c)+'" placeholder="Rp" onchange="mdl27(\''+p.id+'\',this.value)"></td><td id="lu27'+p.id+'">'+(c==null?'-':rp(price(p)-c))+'</td></tr>'}).join('')
 +'</table></div><div id="lb27">'+labaHTML()+'</div></div>'}

/* Balasan cepat WhatsApp */
var BAL=[
 ['terima','Terima pesanan','Halo kak {nama}, terima kasih sudah order di {toko} 🙏\nPesanan {inv} sudah kami terima. Total {total}.'],
 ['bayar','Ingatkan pembayaran','Halo kak {nama}, pesanan {inv} (total {total}) belum kami terima pembayarannya. Silakan bayar lewat QRIS sesuai nominal sampai angka terakhir, lalu kirim bukti bayarnya di sini ya kak. Terima kasih 🙏'],
 ['proses','Pembayaran diterima','Pembayaran pesanan {inv} sudah kami terima ✅ Pesanan kakak sedang kami siapkan.'],
 ['kirim','Pesanan dikirim','Halo kak {nama}, pesanan {inv} sudah dikirim via {kurir}. No. resi: {resi}. Mohon dicek ya kak, terima kasih 🙏'],
 ['habis','Stok habis','Mohon maaf kak {nama}, ada item di pesanan {inv} yang stoknya habis. Mau kami ganti menu lain atau di-refund?'],
 ['frozen','Pesan simpan frozen','Halo kak {nama}, paket frozen mohon langsung dimasukkan ke freezer begitu diterima ya 🙏 Terima kasih sudah belanja di {toko}.'],
 ['ulasan','Minta ulasan','Terima kasih kak {nama}, semoga suka ya 😊 Kalau berkenan, boleh tinggalkan ulasan di aplikasi kami. Ditunggu order berikutnya!']];
function balTpl(b){var s=S.balas27&&S.balas27[b[0]];return typeof s=='string'&&s?s:b[2]}
function balOrd(){var inv=LS.get('dm27bo','');return (S.o||[]).find(function(o){return o.inv==inv})}
function balIsi(t,o){
 var v={nama:o?o.nama:'',inv:o?o.inv:'',total:o?rp(oT(o)):'',kurir:o?(o.kurir||''):'',resi:o?(o.resi||'(belum ada)'):'',toko:NM()};
 return t.replace(/\{(\w+)\}/g,function(m,k){return k in v?v[k]:m}).replace(/[ \t]{2,}/g,' ').replace(/ ([,.!?])/g,'$1')}
window.balo27=function(v){LS.set('dm27bo',v);draw()};
window.bals27=function(id){var e=$1('bt27'+id);if(!e)return;(S.balas27||(S.balas27={}))[id]=e.value.slice(0,1500);save();toast('Balasan disimpan.')};
window.balr27=function(id){if(S.balas27)delete S.balas27[id];save();draw()};
window.balc27=function(id){var e=$1('bt27'+id);if(e)salin(balIsi(e.value,balOrd()),'Balasan disalin.')};
window.balw27=function(id){var e=$1('bt27'+id),o=balOrd();if(!e)return;if(!o||!o.wa)return toast('Pilih pesanan dulu agar nomor pembeli terisi.');
 var t=balIsi(e.value,o);try{waOpen(o.wa,t)}catch(x){open('https://wa.me/'+waNo(o.wa)+'?text='+encodeURIComponent(t))}};
function boxBalas(){
 var O=(S.o||[]).slice().sort(function(a,b){return (b.t||0)-(a.t||0)}).slice(0,30),cur=LS.get('dm27bo','');
 return '<div class="box"><b>Balasan cepat WhatsApp</b><p class="mut">Pilih pesanan, teks terisi otomatis (nama, invoice, total, kurir, resi). Teks bisa Anda ubah lalu simpan.</p>'
 +'<select onchange="balo27(this.value)">'+opt('','Tanpa pesanan (isi manual)',cur)+O.map(function(o){return opt(o.inv,o.inv+' · '+(o.nama||'')+' · '+(ST[o.status]||o.status),cur)}).join('')+'</select>'
 +BAL.map(function(b){var cust=S.balas27&&S.balas27[b[0]];return '<div style="margin-top:12px"><b>'+b[1]+'</b><textarea id="bt27'+b[0]+'">'+h(balTpl(b))+'</textarea><div class="row" style="justify-content:flex-start;gap:8px;margin-top:6px"><button class="btn s" onclick="balc27(\''+b[0]+'\')">Salin</button><button class="btn o s" onclick="balw27(\''+b[0]+'\')">Kirim WhatsApp</button><button class="btn o s" onclick="bals27(\''+b[0]+'\')">Simpan teks</button>'+(cust?'<button class="btn o s" onclick="balr27(\''+b[0]+'\')">Standar</button>':'')+'</div></div>'}).join('')+'</div>'}

function boxGalat(){
 var L=window.galatBaca?window.galatBaca():[];
 var t=L.map(function(g){return new Date(g.t).toLocaleString('id-ID')+' | '+g.f+(g.l?':'+g.l:'')+' | '+g.m}).join('\n');TXT.galat=t;
 return '<div class="box"><b>Catatan galat aplikasi</b><p class="mut">Bila ada yang tidak berfungsi, salin catatan ini dan kirim ke pembuat aplikasi. Nama berkas di dalamnya menunjukkan bagian mana yang perlu diperbaiki.</p>'
 +(L.length?'<pre style="white-space:pre-wrap;font-size:12px;max-height:200px;overflow:auto">'+h(t)+'</pre><div class="row" style="justify-content:flex-start;gap:8px"><button class="btn o s" onclick="cp27(\'galat\',\'Catatan disalin.\')">Salin catatan</button><button class="btn o s" onclick="galatHapus();draw()">Hapus catatan</button></div>':'<p class="ok" style="margin:6px 0"><b>Tidak ada galat tercatat.</b></p>')+'</div>'}
window.aAlat=function(){
 return '<div class="al27">'+boxRingkas()+boxPacking()+boxStok()+boxLaba()+boxBalas()+boxGalat()+'</div>'};

/* ---------- Pemasangan ---------- */
function postAll(){
 try{postGrid()}catch(e){}
 try{postModal()}catch(e){}
 try{seo()}catch(e){}
 if(PEND&&Date.now()-PENDT>15000)PEND=null;
 if(PEND&&P(PEND)){var i=PEND;PEND=null;V.open=i;V.gi=0;V.sel={q:1};draw()}}
var app=$1('app');
if(app&&window.MutationObserver)new MutationObserver(postAll).observe(app,{childList:true});
addEventListener('hashchange',deep);
window.T27={plOrders:plOrders,plTeks:plTeks,plHTML:plHTML,balIsi:balIsi,balOrd:balOrd};
postAll();deep();
(window.__muat=window.__muat||[]).push('js/tambahan/fitur27.js');
})();
