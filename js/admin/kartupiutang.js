/* js/admin/kartupiutang.js (v54): Kartu Piutang per orang (pesanan ONLINE yang dicicil dan pesanan OFFLINE yang belum lunas). Hanya membaca data yang sudah ada; tidak mengubah angka apa pun.
   Sisa = piutang. Yang dianggap lunas = dihapuskan (tidak lagi piutang, tetap dicatat di kartu). Orang yang sama digabung lewat nomor WhatsApp, atau nama bila tanpa nomor. */
const kptRp=n=>rp(Math.max(0,Math.round(+n||0)));
const kptTgl=v=>{const d=typeof v=='string'?new Date(v+'T00:00:00'):new Date(+v||0);return isNaN(d)?'':d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})};
const kptKey=(wa,nama)=>{const d=String(wa||'').replace(/\D/g,'').replace(/^0/,'62');return d.length>=9?d:'n:'+String(nama||'').trim().toLowerCase()};
function kptData(){const M={};
 const ambil=(wa,nama)=>{const k=kptKey(wa,nama);return M[k]||(M[k]={key:k,nama:String(nama||'(tanpa nama)'),wa:String(wa||''),sisa:0,rows:[],hapus:[],hapusN:0})};
 (S.o||[]).forEach(o=>{if(!o||!o.cicil)return;if(['menunggu','verifikasi','dibatalkan','kedaluwarsa'].includes(o.status))return;
  const tot=+o.tf||0,rc=typeof oRc=='function'?oRc(o):(o.rcv!=null?+o.rcv:tot),ps=(o.pays||[]).filter(x=>x&&x.st=='ok'&&(+x.n||0)>0);
  if(o.anggap){const p=ambil(o.wa,o.nama);p.hapus.push({ref:o.inv,n:+o.anggap.n||0,a:o.anggap.a||'',t:o.anggap.t});p.hapusN+=+o.anggap.n||0;return}
  const sisa=Math.max(0,tot-rc);if(!(sisa>0))return;const p=ambil(o.wa,o.nama);p.sisa+=sisa;
  p.rows.push({src:'Online',ref:o.inv,tgl:o.t,total:tot,dibayar:Math.min(rc,tot),sisa,pays:ps.map(x=>({n:+x.n,t:x.t}))})});
 (typeof OF=='function'?OF():[]).forEach(o=>{if(!o||o.st=='batal'||!Array.isArray(o.items))return;const pl=plOf(o.pel),p=ambil(pl.wa,pl.nama);
  if(o.anggap){p.hapus.push({ref:o.no||o.id,n:+o.anggap.n||0,a:o.anggap.a||'',t:o.anggap.t});p.hapusN+=+o.anggap.n||0;return}
  const tot=oT(o),by=oB(o),sisa=oS(o);if(!(sisa>0))return;p.sisa+=sisa;
  p.rows.push({src:'Offline',ref:o.no||o.id,tgl:o.tgl||o.t,total:tot,dibayar:Math.max(0,by),sisa,pays:(o.pays||[]).filter(x=>x.st=='ok'&&(+x.n||0)>0).map(x=>({n:+x.n,t:x.t}))})});
 return Object.values(M).filter(p=>p.sisa>0).sort((a,b)=>b.sisa-a.sisa||a.nama.localeCompare(b.nama))}
function kptTeks(p){return 'KARTU PIUTANG '+NM()+'\n'+p.nama+(p.wa?' ('+p.wa+')':'')+'\n'+p.rows.map(r=>r.ref+' ('+r.src+', '+kptTgl(r.tgl)+')\n  Total '+kptRp(r.total)+' · Dibayar '+kptRp(r.dibayar)+' · Sisa '+kptRp(r.sisa)+(r.pays.length?'\n  Cicilan: '+r.pays.map(x=>kptRp(x.n)+' '+kptTgl(x.t)).join(', '):'')).join('\n')+'\nTOTAL SISA: '+kptRp(p.sisa)}
function kptTagih(key){const p=kptData().find(x=>x.key==key);if(!p)return;waOpen(p.wa,'Halo '+p.nama+', kami dari '+NM()+' mengingatkan sisa pembayaran Anda sebesar '+kptRp(p.sisa)+' untuk pesanan '+p.rows.map(r=>r.ref).join(', ')+'. Terima kasih.')}
function kptSalin(key){const p=kptData().find(x=>x.key==key);if(!p)return;const t=kptTeks(p);if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>toast('Kartu disalin.')).catch(()=>toast('Tidak bisa menyalin.'));else toast('Tidak bisa menyalin.')}
function kptBuka(key){V.kpo=V.kpo==key?null:key;draw()}
function kptKartu(p){return `<div style="margin-top:8px">${p.rows.map(r=>`<div class="box" style="margin:6px 0"><div class="row"><b>${esc(r.ref)}</b><span class="mut">${esc(r.src)} · ${esc(kptTgl(r.tgl))}</span></div><div class="row"><span>Total</span><span>${kptRp(r.total)}</span></div><div class="row"><span>Dibayar</span><span>${kptRp(r.dibayar)}</span></div>${r.pays.map(x=>`<div class="mut">• ${kptRp(x.n)} · ${esc(kptTgl(x.t))}</div>`).join('')}<div class="row"><b>Sisa</b><b class="bad">${kptRp(r.sisa)}</b></div></div>`).join('')}${p.hapus.length?`<div class="mut">Dihapuskan (dianggap lunas): ${kptRp(p.hapusN)} · ${p.hapus.map(h=>esc(h.ref)+(h.a?' ('+esc(h.a)+')':'')).join(', ')}</div>`:''}<div class="row" style="margin-top:8px"><button class="btn s" onclick="kptTagih('${esc(p.key)}')">Tagih lewat WhatsApp</button><button class="btn o s" onclick="kptSalin('${esc(p.key)}')">Salin kartu</button></div></div>`}
function aKpt(){const L=kptData(),tot=L.reduce((a,p)=>a+p.sisa,0);
 return `<h2>Kartu Piutang</h2><p class="mut">Sisa tagihan tiap orang dari pesanan online (cicilan) dan pesanan offline. Yang dianggap lunas tidak lagi piutang.</p><div class="box"><div class="row"><span>Total piutang</span><b class="big">${kptRp(tot)}</b></div><div class="mut">${L.length} orang</div></div>`+
 (L.length?L.map(p=>`<div class="box"><div class="row" onclick="kptBuka('${esc(p.key)}')" style="cursor:pointer"><b>${esc(p.nama)}</b><b class="bad">${kptRp(p.sisa)}</b></div><div class="mut">${p.wa?esc(p.wa)+' · ':''}${p.rows.length} pesanan · ${V.kpo==p.key?'tutup':'lihat kartu'}</div>${V.kpo==p.key?kptKartu(p):''}</div>`).join(''):'<div class="box">Tidak ada piutang. Semua pesanan sudah lunas.</div>')}
(window.__muat=window.__muat||[]).push('js/admin/kartupiutang.js');
