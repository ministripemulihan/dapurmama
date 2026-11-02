/* js/admin/cicilon.js (v52): cicilan dan lunas dengan alasan untuk pesanan ONLINE. Pesanan online memakai o.rcv (uang yang sudah masuk), o.pays (daftar cicilan) dan o.anggap {a,n,by,t} (dianggap lunas, alasan dari daftar ALS: Hutang, Orang gereja, Anak kecil, Tidak mampu, Persembahan, Ganti rugi, Karena iba). Keuangan (server): uang masuk = jumlah o.pays per tanggal bayar; sisa = piutang; dianggap lunas = dihapuskan (sama dengan pesanan offline). */
const oRc=o=>o.rcv!=null?+o.rcv:(+o.tf||0);
const oSs=o=>o.anggap?0:Math.max(0,(+o.tf||0)-oRc(o));
function cicOnBox(o){if(!o.cicil&&!o.anggap)return'';const s=oSs(o),ad=me()&&me().r=='admin';
 let h=`<div class="box" style="margin-top:8px"><b>${o.anggap?'Lunas (dianggap: '+esc(o.anggap.a)+')':s?'Cicilan: sisa '+rp(s):'Cicilan lunas'}</b><div class="mut">Total ${rp(o.tf)} · uang masuk ${rp(oRc(o))}${o.anggap?' · dihapuskan '+rp(o.anggap.n):''}</div>`;
 h+=(o.pays||[]).map(x=>`<div class="mut">• ${rp(x.n)} (${esc(x.met||'')}) ${new Date(x.t).toLocaleDateString('id-ID')}</div>`).join('');
 if(s&&ad)h+=`<div class="row" style="margin-top:8px"><input id="cn${o.inv}" type="number" min="1" max="${s}" placeholder="Nominal Rp" style="flex:1" data-pas="${s}">${typeof metSel=='function'?metSel('cm'+o.inv):''}<button class="btn s" onclick="cicOnBayar('${o.inv}')">Catat cicilan</button></div><div class="row" style="margin-top:8px"><select id="ca${o.inv}">${ALS.map(a=>`<option>${esc(a)}</option>`).join('')}</select><button class="btn o s" onclick="cicOnAng('${o.inv}')">Anggap lunas sisa</button></div>`;
 return h+'</div>'}
function cicOnBayar(inv){const o=S.o.find(x=>x.inv==inv);if(!o||!o.cicil||o.anggap)return;const s=oSs(o),n=Math.round(+$('#cn'+inv).value||0);
 if(!(n>0))return toast('Isi nominal cicilan.');if(n>s)return toast('Nominal melebihi sisa ('+rp(s)+').');
 const m=$('#cm'+inv);(o.pays=o.pays||[]).push({id:nid('B'),j:'cicil',n,met:m?m.value:'Transfer BCA',st:'ok',t:Date.now(),by:me().u,ok:me().u});o.rcv=oRc(o)+n;save();draw();toast('Cicilan dicatat. '+(oSs(o)?'Sisa '+rp(oSs(o))+'.':'Lunas.'))}
function cicOnAng(inv){const o=S.o.find(x=>x.inv==inv);if(!o||!o.cicil||o.anggap)return;const s=oSs(o);if(!(s>0))return;const a=$('#ca'+inv).value;
 konfirm('Anggap lunas sisa '+rp(s)+' ('+a+')? Nilai ini tidak dihitung sebagai uang masuk dan tidak bisa dibatalkan.',()=>{o.anggap={a,n:s,by:me().u,t:Date.now()};save();draw();toast('Dianggap lunas: '+a+'.')},'Ya, anggap lunas')}
/* v53+v57: invoice A5 dan struk 4 cm pesanan online selalu menampilkan Dibayar dan Sisa, baik dicetak dari HP penjual (o.cicil/o.rcv/o.anggap) maupun dari HP tamu (o.gc dari server, v55). Alasan dianggap lunas TIDAK dicetak (dokumen ini dibaca pembeli). */
function cicInfo(o){if(!o||o.src=='kasir')return null;
 if(o.cicil||o.anggap)return{by:oRc(o),sa:oSs(o),ag:o.anggap?1:0,hp:o.anggap?(+o.anggap.n||0):0,cc:1};
 if(o.gc&&o.gc.cc)return{by:+o.gc.by||0,sa:+o.gc.sa||0,ag:o.gc.ag?1:0,hp:+o.gc.hp||0,cc:1};
 if(typeof PAID!='undefined'&&PAID.includes(o.status))return{by:+o.tf||0,sa:0,ag:0,hp:0,cc:0};
 return null}
function cicInvBaris(o){const c=cicInfo(o);if(!c)return'';
 return`<tr><td class="r">Dibayar</td><td class="r">${rp(c.by)}</td></tr>`+(c.ag?`<tr><td class="r">Dibebaskan toko</td><td class="r">${rp(c.hp)}</td></tr>`:'')+`<tr class="g"><td class="r">Sisa</td><td class="r">${rp(c.ag?0:c.sa)}</td></tr>`}
function cicInvStempel(o){const c=cicInfo(o);if(!c||c.ag||!c.sa)return'<span class="lunas">LUNAS</span>';return'<span class="lunas" style="border-color:#c0392b;color:#c0392b">BELUM LUNAS</span>'}
function cicStrukBaris(o,n){const c=cicInfo(o);if(!c)return'';
 return`<div class="r"><span>Dibayar</span><span>${n(c.by)}</span></div>`+(c.ag?`<div class="r"><span>Dibebaskan</span><span>${n(c.hp)}</span></div>`:'')+`<div class="r t"><span>SISA</span><span>${n(c.ag?0:c.sa)}</span></div>`}
function cicStrukStempel(o){const c=cicInfo(o);if(!c||c.ag||!c.sa)return'** LUNAS **';return'** BELUM LUNAS **'}
/* v57: satu baris Dibayar / Sisa di layar Owner, Administrator, dan Staf (tab Invoice dan Pesanan). Hanya angka, tanpa alasan lunas. */
function cicBaris(o){const c=cicInfo(o);if(!c)return'';
 return`<div class="row" style="margin-top:4px"><span>Dibayar <b>${rp(c.by)}</b></span><span>${c.ag?'Dibebaskan <b>'+rp(c.hp)+'</b>':'Sisa <b'+(c.sa>0?' class="bad"':'')+'>'+rp(c.sa)+'</b>'}</span></div>`}
(window.__muat=window.__muat||[]).push('js/admin/cicilon.js');
