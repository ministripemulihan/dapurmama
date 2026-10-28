/* js/admin/rekap.js : v33 tanggal siap kirim per pesanan + tab Rekap (barang yang dipesan per tanggal siap kirim).
   Tanggal siap kirim dihitung server saat pesanan masuk (tab Pengaturan, "Lama siap kirim (hari)"), penjual boleh mengubahnya per pesanan. */
const HR33=['Min','Sen','Sel','Rab','Kam','Jum','Sab'],BL33=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const wibD33=ms=>new Date(ms+7*36e5).toISOString().slice(0,10);
const tglOk33=d=>/^\d{4}-\d{2}-\d{2}$/.test(String(d||''));
function siapFmt(d){if(!tglOk33(d))return'-';const x=new Date(d+'T12:00:00');return HR33[x.getDay()]+', '+x.getDate()+' '+BL33[x.getMonth()]+(x.getFullYear()!=+tglWIB().slice(0,4)?' '+x.getFullYear():'')}
/* Tanggal siap kirim sebuah pesanan: isian siap, atau tanggal pre-order, atau (pesanan lama) tanggal dibayar/dibuat */
function siapTgl(o){if(tglOk33(o.siap))return o.siap;if(tglOk33(o.po))return o.po;return wibD33(o.paid||o.t||Date.now())}
function siapSel(d){const t=tglWIB();return d<t?'telat':d==t?'hari':d==addHari(t,1)?'besok':'nanti'}
function siapTag(d){const s=siapSel(d);return s=='telat'?'<span class="bad"><b>TERLAMBAT</b></span>':s=='hari'?'<b>HARI INI</b>':s=='besok'?'<b>BESOK</b>':''}
/* Kotak tanggal di kartu pesanan penjual */
function siapBox(o){if(!o||o.src=='kasir'||!['menunggu','verifikasi','dibayar','dikemas'].includes(o.status))return'';
 const d=siapTgl(o),t=tglWIB();
 return`<div class="box" style="margin:8px 0 0"><div>📅 Siap dikirim: <b>${siapFmt(d)}</b> ${siapTag(d)}</div><div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><input type="date" id="sd${o.inv}" value="${d}" min="${addHari(t,-30)}" max="${addHari(t,120)}" style="flex:1;min-width:140px"><button class="btn o s" onclick="siapSimpan('${o.inv}')">Ubah tanggal</button>${PAID.includes(o.status)&&o.wa?`<button class="btn o s" onclick="siapWA('${o.inv}')">Kabari pembeli (WA)</button>`:''}</div></div>`}
function siapSimpan(inv){const o=S.o.find(x=>x.inv==inv),el=$('#sd'+inv);if(!o||!el)return;const v=el.value;
 if(!tglOk33(v)||v<addHari(tglWIB(),-30)||v>addHari(tglWIB(),120))return toast('Pilih tanggal yang benar (maksimal 120 hari ke depan).');
 o.siap=v;save();draw();toast('Tanggal siap kirim: '+siapFmt(v)+'. Pembeli melihatnya setelah data terkirim ke Sheet.')}
function siapWA(inv){const o=S.o.find(x=>x.inv==inv);if(!o)return;const d=siapTgl(o);
 waOpen(o.wa,'Halo '+o.nama+', pesanan '+o.inv+' di '+NM()+' sudah kami terima. Barang siap dikirim pada '+siapFmt(d)+(o.po?' (pre-order)':'')+'. Terima kasih!')}
/* Catatan untuk pembeli di halaman pesanannya */
function siapNote(o){if(!o||o.src=='kasir'||!['menunggu','verifikasi','dibayar','dikemas'].includes(o.status))return'';const d=tglOk33(o.siap)?o.siap:(tglOk33(o.po)?o.po:'');if(!d)return'';
 return`<div class="box" style="margin-top:8px">📅 Perkiraan barang siap dikirim: <b>${siapFmt(d)}</b>${o.status=='menunggu'||o.status=='verifikasi'?' <small class="mut">(setelah pembayaran dikonfirmasi)</small>':''}</div>`}
/* Baris untuk invoice */
function siapInv(o){return o&&o.src!='kasir'&&tglOk33(o.siap)?'<br><small>Siap dikirim: '+esc(siapFmt(o.siap))+'</small>':''}

/* ---------- Rekap barang yang dipesan ---------- */
const rkLbl=i=>i.n+(i.key&&i.key!='porsi'?' ('+String(i.key).replace('|',' / ')+')':'');
function rkRows(){const mode=V.rkm||'bayar',R=[];
 (S.o||[]).forEach(o=>{if(o.src=='kasir')return;const st=o.status,ok=st=='dibayar'||st=='dikemas'||(mode=='semua'&&(st=='verifikasi'||st=='menunggu'));if(!ok)return;
  R.push({d:siapTgl(o),src:'online',ref:o.inv,nama:o.nama,paid:PAID.includes(st),items:o.items||[]})});
 (S.off||[]).forEach(o=>{if(o.st!='baru')return;R.push({d:o.tgl,src:'offline',ref:o.no||o.id,nama:plOf(o.pel).nama,paid:true,items:o.items||[]})});
 return R}
function rkGroup(R){const G={};R.forEach(r=>{const g=G[r.d]||(G[r.d]={d:r.d,n:0,nw:0,items:{},orders:[]});g.orders.push(r);r.paid?g.n++:g.nw++;
  r.items.forEach(i=>{const k=rkLbl(i),x=g.items[k]||(g.items[k]={q:0,w:0});if(r.paid)x.q+=+i.q||0;else x.w+=+i.q||0})});
 return Object.keys(G).sort().map(k=>G[k])}
function rkTotal(G){const T={};G.forEach(g=>Object.keys(g.items).forEach(k=>{const x=T[k]||(T[k]={q:0,w:0});x.q+=g.items[k].q;x.w+=g.items[k].w}));return T}
const rkQ=x=>x.q+(x.w?' <small class="mut">(+'+x.w+' menunggu bayar)</small>':'');
const rkQt=x=>x.q+(x.w?' (+'+x.w+' menunggu bayar)':'');
function rkTeks(G){const T=rkTotal(G);let s='REKAP BARANG DIPESAN - '+NM()+'\nDibuat '+siapFmt(tglWIB())+'\n';
 G.forEach(g=>{s+='\n== '+siapFmt(g.d)+({telat:' (TERLAMBAT)',hari:' (HARI INI)',besok:' (BESOK)',nanti:''})[siapSel(g.d)]+' - '+g.n+' pesanan'+(g.nw?' + '+g.nw+' menunggu bayar':'')+'\n'+Object.keys(g.items).sort().map(k=>'- '+k+' x'+rkQt(g.items[k])).join('\n')+'\n'});
 return s+'\nTOTAL SEMUA\n'+Object.keys(T).sort().map(k=>'- '+k+' x'+rkQt(T[k])).join('\n')}
function aRek(){const R=rkRows(),G=rkGroup(R),mode=V.rkm||'bayar',T=rkTotal(G);
 const chips=`<div class="tabs"><div class="chip ${mode=='bayar'?'on':''}" onclick="V.rkm='bayar';draw()">Sudah dibayar</div><div class="chip ${mode=='semua'?'on':''}" onclick="V.rkm='semua';draw()">+ Menunggu bayar</div></div>`;
 if(!G.length)return`<div class="box"><b>Rekap barang yang dipesan</b><p class="mut">Belum ada pesanan yang menunggu dikirim.${mode=='bayar'?' Pesanan yang belum dibayar tidak ikut dihitung (pilih "+ Menunggu bayar" untuk melihatnya).':''}</p></div>${chips}`;
 const late=G.filter(g=>siapSel(g.d)=='telat').reduce((a,g)=>a+g.n,0);
 return`<div class="box"><div class="row"><b>Rekap barang yang dipesan</b><span><button class="btn o s" onclick="rkSalin()">Salin (WhatsApp)</button> <button class="btn o s" onclick="rkCetak()">Cetak</button></span></div><p class="mut">Pesanan online (dibayar/dikemas) dan pesanan offline yang belum dikirim, dikelompokkan menurut tanggal siap kirim. Ubah tanggal tiap pesanan di tab Pesanan.</p>${late?`<div class="bad"><b>${late} pesanan sudah lewat tanggal siap kirim.</b></div>`:''}</div>${chips}`
 +G.map(g=>`<div class="box"><div class="row"><b>${siapFmt(g.d)}</b><span>${siapTag(g.d)} <span class="mut">${g.n} pesanan${g.nw?' + '+g.nw+' menunggu bayar':''}</span></span></div>${Object.keys(g.items).sort().map(k=>`<div class="row" style="padding:3px 0"><span>${esc(k)}</span><b>${rkQ(g.items[k])}</b></div>`).join('')}<details style="margin-top:6px"><summary class="mut">Lihat pesanan</summary>${g.orders.map(r=>`<div class="mut">${r.src=='offline'?'Offline':'Online'} · ${esc(r.ref)} · ${esc(r.nama)}${r.paid?'':' (belum dibayar)'}</div>`).join('')}</details></div>`).join('')
 +`<div class="box"><b>Total semua barang yang harus disiapkan</b>${Object.keys(T).sort().map(k=>`<div class="row" style="padding:3px 0"><span>${esc(k)}</span><b>${rkQ(T[k])}</b></div>`).join('')}</div>`}
function rkSalin(){salinTeks(rkTeks(rkGroup(rkRows())),'Rekap disalin. Tempel di WhatsApp.')}
function rkCetak(){const G=rkGroup(rkRows()),T=rkTotal(G),w=open('','_blank');if(!w)return toast('Izinkan pop-up untuk mencetak.');
 const tb=o=>'<table>'+Object.keys(o).sort().map(k=>'<tr><td>&#9744;</td><td>'+esc(k)+'</td><td style="text-align:right"><b>'+rkQt(o[k])+'</b></td></tr>').join('')+'</table>';
 w.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Rekap barang dipesan</title><style>@page{size:A4;margin:12mm}body{font:13px/1.45 system-ui,Arial,sans-serif;color:#111}h1{font-size:18px;margin:0 0 4px}h2{font-size:15px;margin:16px 0 4px;border-bottom:2px solid #ff5a1f}table{width:100%;border-collapse:collapse}td{padding:4px 6px;border-bottom:1px solid #ccc}.t{color:#c00}button{margin:10px 0;padding:8px 16px}@media print{button{display:none}}</style></head><body><h1>Rekap barang dipesan - '+esc(NM())+'</h1><div>Dibuat '+esc(siapFmt(tglWIB()))+'</div>'
 +G.map(g=>'<h2>'+esc(siapFmt(g.d))+' <span class="t">'+({telat:'TERLAMBAT',hari:'HARI INI',besok:'BESOK',nanti:''})[siapSel(g.d)]+'</span> &middot; '+g.n+' pesanan'+(g.nw?' + '+g.nw+' menunggu bayar':'')+'</h2>'+tb(g.items)).join('')
 +'<h2>Total semua</h2>'+tb(T)+'<button onclick="print()">Cetak</button></body></html>');w.document.close()}
(window.__muat=window.__muat||[]).push('js/admin/rekap.js');
