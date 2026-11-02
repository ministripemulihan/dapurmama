/* js/admin/cetakmulti.js (v43): cetak invoice banyak sekaligus (pilih manual, pilih semua, per tanggal).
   Dua bentuk: Struk 4 cm (printStruk) dan Invoice standar A5 (printInv). Memakai tampilan cetak yang sudah ada, jadi isi dan gayanya sama dengan cetak satuan. */
const cmWib=ms=>new Date((+ms||0)+7*36e5).toISOString().slice(0,10);
const cmHariIni=()=>cmWib(Date.now());
const cmGeser=n=>cmWib(Date.now()-n*864e5);
function cmS(){return V.cm=V.cm||{dari:cmHariIni(),sampai:cmHariIni(),st:'paid',q:'',sel:{}}}
function cmQ(){const c=cmS(),q=c.q.trim().toLowerCase();
 return(S.o||[]).filter(o=>{const d=cmWib(o.t);if(c.dari&&d<c.dari)return false;if(c.sampai&&d>c.sampai)return false;
  if(c.st=='paid'?!PAID.includes(o.status):(o.status=='dibatalkan'||o.status=='kedaluwarsa'))return false;
  return!q||String(o.inv).toLowerCase().includes(q)||String(o.nama||'').toLowerCase().includes(q)}).sort((a,b)=>(+b.t||0)-(+a.t||0))}
const cmPilih=()=>{const s=cmS().sel;return cmQ().filter(o=>s[o.inv])};
function cmRef(){const e=$('#cml');if(e)e.innerHTML=cmList()}
function cmSet(k,v){cmS()[k]=v;cmRef()}
function cmChip(n){const c=cmS();if(n<0){c.dari='';c.sampai=''}else if(n==1){c.dari=c.sampai=cmGeser(1)}else{c.dari=cmGeser(n==0?0:n-1);c.sampai=cmHariIni()}draw()}
function cmTog(inv,on){const s=cmS().sel;if(on)s[inv]=1;else delete s[inv];cmRef()}
function cmAll(){const s=cmS().sel;cmQ().forEach(o=>s[o.inv]=1);cmRef()}
function cmNone(){cmS().sel={};cmRef()}
function cmList(){const L=cmQ(),s=cmS().sel,n=L.filter(o=>s[o.inv]).length,dis=n?'':' disabled',tg=ms=>new Date(+ms||0).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
 return`<div class="box"><b>${L.length} pesanan</b> · <b>${n} dipilih</b><div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0"><button class="btn o s" onclick="cmAll()">Pilih semua (${L.length})</button><button class="btn o s" onclick="cmNone()">Kosongkan</button></div>
<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn s"${dis} onclick="cmCetak('s')">🧾 Struk 4 cm (${n})</button><button class="btn s"${dis} onclick="cmCetak('a')">📄 Invoice standar A5 (${n})</button></div><p class="mut" style="margin:8px 0 0">Satu jendela cetak berisi semua pilihan, tiap pesanan di halaman sendiri. Struk hanya untuk pesanan yang sudah dibayar.</p></div>`
 +(L.length?L.slice(0,400).map(o=>`<div class="box" style="display:flex;gap:10px;align-items:center"><input type="checkbox" style="width:22px;height:22px;min-height:0;flex:none" ${s[o.inv]?'checked':''} onchange="cmTog('${esc(o.inv)}',this.checked)"><div style="flex:1;min-width:0"><b>${esc(o.inv)}</b> · ${rp(o.tf||o.total)}<br><small class="mut">${esc(o.nama||'-')} · ${tg(o.t)} · ${esc(ST[o.status]||o.status)}</small></div><div style="display:flex;flex-direction:column;gap:4px"><button class="btn o s" onclick="printStruk('${esc(o.inv)}')">4 cm</button><button class="btn o s" onclick="printInv('${esc(o.inv)}')">A5</button></div></div>`).join('')+(L.length>400?'<p class="mut">Menampilkan 400 teratas. Persempit tanggal untuk melihat sisanya; "Pilih semua" tetap memilih semuanya.</p>':''):'<p class="mut">Tidak ada pesanan pada pilihan ini. Ubah tanggal/status, atau tekan Tarik dari Sheet.</p>')}
function aInv(){const c=cmS();return`<div class="box"><b>🖨 Cetak invoice</b><p class="mut">Pilih tanggal, centang pesanan (atau Pilih semua), lalu cetak sebagai struk 4 cm atau invoice standar A5.</p>
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><button class="btn o s" onclick="cmChip(0)">Hari ini</button><button class="btn o s" onclick="cmChip(1)">Kemarin</button><button class="btn o s" onclick="cmChip(7)">7 hari</button><button class="btn o s" onclick="cmChip(-1)">Semua tanggal</button></div>
<label>Dari tanggal</label><input type="date" value="${c.dari}" onchange="cmSet('dari',this.value)"><label>Sampai tanggal</label><input type="date" value="${c.sampai}" onchange="cmSet('sampai',this.value)">
<label>Status</label><select onchange="cmSet('st',this.value)"><option value="paid"${c.st=='paid'?' selected':''}>Sudah dibayar</option><option value="all"${c.st=='all'?' selected':''}>Semua (kecuali batal/kedaluwarsa)</option></select>
<input placeholder="Cari nomor invoice atau nama" value="${esc(c.q)}" oninput="cmSet('q',this.value)" style="margin-top:8px"></div><div id="cml">${cmList()}</div>`}
/* Ambil HTML cetak satuan yang sudah ada (printInv/printStruk) tanpa membuka jendela. */
function cmAmbil(fn,inv){const asli=window.open;let h='';window.open=()=>({document:{write:x=>{h+=x},close(){},head:{appendChild(){}},querySelector(){return null}},print(){}});try{fn(inv)}finally{window.open=asli}return h}
function cmCetak(m){let L=cmPilih().sort((a,b)=>(+a.t||0)-(+b.t||0));if(!L.length)return toast('Belum ada pesanan yang dipilih.');
 let lewat=0;if(m=='s'){const n0=L.length;L=L.filter(o=>PAID.includes(o.status));lewat=n0-L.length;if(!L.length)return toast('Struk hanya untuk pesanan yang sudah dibayar.')}
 const H=L.map(o=>cmAmbil(m=='s'?printStruk:printInv,o.inv)).filter(Boolean);if(!H.length)return toast('Pesanan tidak ditemukan di perangkat ini. Tekan Tarik dari Sheet.');
 const css=((H[0].match(/<style>([\s\S]*?)<\/style>/)||[])[1]||''),body=h=>(((h.match(/<body[^>]*>([\s\S]*)<\/body>/)||[])[1])||'').replace(/<button[\s\S]*?<\/button>/g,'');
 const w=open('','_blank');if(!w)return toast('Izinkan pop-up untuk mencetak.');
 w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${m=='s'?'Struk':'Invoice'} (${H.length})</title><style>${css}.pg{page-break-after:always;break-after:page}.pg:last-child{page-break-after:auto;break-after:auto}.bar{position:sticky;top:0;background:#fff;padding:8px;text-align:center;z-index:5}@media print{.bar{display:none}}</style></head><body><div class="bar"><b>${H.length} ${m=='s'?'struk 4 cm':'invoice A5'}</b> <button onclick="print()" style="padding:8px 16px">Cetak</button></div>${H.map(h=>'<div class="pg">'+body(h)+'</div>').join('')}</body></html>`);w.document.close();
 setTimeout(()=>{try{if(m=='s'){const ks=[].slice.call(w.document.querySelectorAll('.k')),hs=ks.map(k=>Math.ceil(k.scrollHeight*25.4/96)+4),st=w.document.createElement('style');
   st.textContent='@page{size:40mm '+Math.max.apply(null,hs)+'mm;margin:0}'+hs.map((x,i)=>'@page h'+i+'{size:40mm '+x+'mm;margin:0}').join('');w.document.head.appendChild(st);ks.forEach((k,i)=>{if(k.parentNode)k.parentNode.style.page='h'+i})}w.print()}catch(e){}},450);
 if(lewat)toast(lewat+' pesanan belum dibayar dilewati (struk hanya untuk yang sudah dibayar).')}
(window.__muat=window.__muat||[]).push('js/admin/cetakmulti.js');
