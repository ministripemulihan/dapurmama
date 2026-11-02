/* js/admin/biaya.js : v32 catat uang keluar (biaya) dari HP. Tersimpan di tab Biaya di Google Sheet (dibaca Ringkasan Keuangan). Hanya admin. */
function biayaMuat(){V.bq=1;return post({act:'biaya_list',lim:V.blim||25}).then(r=>{V.bia=(r&&r.ok)?r:{err:(r&&r.err)||'Gagal memuat daftar biaya.',antre:(r&&r.antre)||0}}).catch(()=>{V.bia={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V.bq=0;if(V.tab=='bia')draw()})}
function biayaDal(i,v){const x=((V.bia||{}).l||[])[i];if(!x)return;
 post({act:'biaya_dal',row:x.row,t:x.t,ket:x.ket,dal:v}).then(r=>{if(r&&r.ok){toast(v?'Dana alokasi '+v+' dipasang; salinan masuk CALK.':'Dana alokasi dilepas.');V.bia=null;if(typeof dalSegar=='function')dalSegar();else draw()}else{toast((r&&r.err)||'Gagal mengubah dana alokasi.');V.bia=null;draw()}}).catch(()=>toast('Tidak ada koneksi.'))}
function biayaSimpan(){if(V.bs)return;const j=Math.round(+$('#bj').value||0),ket=$('#bn').value.trim();
 if(!(j>0))return toast('Isi jumlah uang (angka lebih dari 0).');
 if(!ket)return toast('Isi keterangan, mis. Belanja ayam 10 kg.');
 V.bs=1;V.bkat=$('#bk').value;V.bcara=$('#bc').value;
 post({act:'biaya_add',tgl:$('#bt').value,kat:V.bkat,ket,jml:j,cara:V.bcara,bid:$('#bb').value,ura:$('#bu').value.trim(),qty:$('#bq').value,sat:$('#bs2').value.trim(),tmp:$('#bm').value.trim(),dal:($('#bd')||{}).value||''}).then(r=>{
  if(r&&r.ok){toast('Biaya '+rp(j)+' tercatat.');V.bia=null;V.bkr=null}else toast((r&&r.err)||'Gagal mencatat biaya.')
 }).catch(()=>toast('Tidak ada koneksi. Biaya belum tercatat, coba lagi.')).then(()=>{V.bs=0;draw()})}

/* ---------- v33: Rekap biaya per kategori, cara bayar, dan hari ---------- */
function bkRentang(p){const t=tglWIB();if(p=='hari')return[t,t];if(p=='minggu')return[addHari(t,-6),t];if(p=='bulan')return[t.slice(0,8)+'01',t];
 if(p=='lalu'){const aw=t.slice(0,8)+'01',ak=addHari(aw,-1);return[ak.slice(0,8)+'01',ak]}if(p=='semua')return['',''];return[V.bkd||'',V.bke||'']}
function bkMuat(){V.bkq=1;const r=bkRentang(V.bkp||'bulan');return post({act:'biaya_rekap',dari:r[0],ke:r[1]}).then(x=>{V.bkr=(x&&x.ok)?x:{err:(x&&x.err)||'Gagal memuat rekap.'}}).catch(()=>{V.bkr={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V.bkq=0;if(V.tab=='bia')draw()})}
function bkSet(p){V.bkp=p;V.bkr=null;draw()}
function bkTgl(){V.bkd=$('#bkd').value;V.bke=$('#bke').value;V.bkp='pilih';V.bkr=null;if(V.bkd&&V.bke)draw()}
function bkTeks(){const r=V.bkr;if(!r||!r.ok)return'';const p=r.dari||r.ke?(r.dari||'awal')+' s/d '+(r.ke||'sekarang'):'semua waktu';
 return'REKAP BIAYA '+NM()+'\nPeriode: '+p+'\nTotal: '+rp(r.tot)+' ('+r.n+' catatan)\n\nPer kategori\n'+r.kat.map(x=>'- '+x.k+': '+rp(x.j)).join('\n')+'\n\nPer cara bayar\n'+r.cara.map(x=>'- '+x.k+': '+rp(x.j)).join('\n')}
function bkCsv(){const r=V.bkr;if(!r||!r.ok||!r.l.length)return toast('Tidak ada data untuk diunduh.');const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
 const t=['Tanggal,Kategori,Keterangan,Jumlah,Dibayar lewat,Dicatat oleh'].concat(r.l.map(x=>[x.t,q(x.k),q(x.ket),x.j,q(x.c),q(x.by)].join(','))).join('\r\n'),
 a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+t],{type:'text/csv;charset=utf-8'}));a.download='biaya_'+(r.dari||'awal')+'_'+(r.ke||'kini')+'.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function bkBar(L,tot){return L.map(x=>{const pc=tot>0?Math.round(x.j*100/tot):0;return`<div style="margin:6px 0"><div class="row"><span>${esc(x.k)}</span><b>${rp(x.j)} <small class="mut">${pc}%</small></b></div><div style="background:#eee;border-radius:4px;height:7px"><div style="width:${pc}%;background:#ff5a1f;height:7px;border-radius:4px"></div></div></div>`}).join('')}
function bkRekapBox(){if(!V.bkr&&!V.bkq)bkMuat();const r=V.bkr,p=V.bkp||'bulan',
 ch=[['hari','Hari ini'],['minggu','7 hari'],['bulan','Bulan ini'],['lalu','Bulan lalu'],['semua','Semua']].map(x=>`<div class="chip ${p==x[0]?'on':''}" onclick="bkSet('${x[0]}')">${x[1]}</div>`).join('');
 return`<div class="box"><div class="row"><b>Rekap biaya</b><span><button class="btn o s" onclick="salinTeks(bkTeks(),'Rekap biaya disalin.')">Salin</button> <button class="btn o s" onclick="bkCsv()">Unduh CSV</button></span></div><div class="tabs" style="margin:8px 0">${ch}</div><div class="row" style="gap:6px"><input type="date" id="bkd" value="${esc(V.bkd||'')}" max="${tglWIB()}" onchange="bkTgl()"><span>s/d</span><input type="date" id="bke" value="${esc(V.bke||'')}" max="${tglWIB()}" onchange="bkTgl()"></div>${
 !r?'<p class="mut">Memuat…</p>':r.err?`<p class="bad">${esc(r.err)}</p>`:
 `<p style="margin-top:10px">Total biaya: <b class="big">${rp(r.tot)}</b> <span class="mut">dari ${r.n} catatan</span></p>`+(r.n?`<b>Per kategori</b>${bkBar(r.kat,r.tot)}<b>Per cara bayar</b>${bkBar(r.cara,r.tot)}<details style="margin-top:8px"><summary class="mut">Per hari (${r.hari.length} hari)</summary>${r.hari.slice().reverse().map(x=>`<div class="row" style="padding:3px 0"><span>${esc(siapFmt?siapFmt(x.t):x.t)}</span><b>${rp(x.j)}</b></div>`).join('')}</details>`:'<p class="mut">Tidak ada biaya pada periode ini.</p>')+(r.lebih?`<p class="mut">CSV memuat ${r.l.length} catatan terbaru; ${r.lebih} lainnya tidak ikut.</p>`:'')}<p class="mut" style="margin-top:8px">Perbandingan dengan uang masuk ada di tab Ringkasan Keuangan di Google Sheet.</p></div>`}

function aBia(){
 if(!gk())return'<div class="box">Belum tersambung ke Google Sheet. Buka tab Pengaturan, tempel Kunci sinkron, lalu kembali ke sini.</div>';
 if(!V.bia&&!V.bq)biayaMuat();
 const d=V.bia,kat=(d&&d.kat)||['Bahan baku','Kemasan','Ongkir/kurir','Gaji','Sewa','Listrik/gas/air','Iklan','Peralatan','Lain-lain'],cara=['Tunai','Transfer','QRIS','Lainnya'],
  opt=(L,v)=>L.map(x=>`<option${x==v?' selected':''}>${esc(x)}</option>`).join('');
 return bkRekapBox()+(d&&d.antre?`<div class="box"><b>⏳ ${d.antre} catatan biaya dari staf menunggu</b><p class="mut">Angkanya sudah disandikan. Buka kunci di Admin > Keamanan (master password), lalu muat ulang layar ini: catatan otomatis masuk ke daftar Biaya.</p></div>`:'')+`<div class="box"><b>Catat uang keluar</b><p class="mut">Bahan, kemasan, ongkir, gaji, dan lain-lain. Masuk ke tab Biaya di Google Sheet dan dihitung di Ringkasan Keuangan.</p>
<label>Tanggal</label><input id="bt" type="date" value="${tglWIB()}" max="${tglWIB()}">
<label>Kategori</label><select id="bk">${opt(kat,V.bkat)}</select>
<label>Dana alokasi (opsional)</label><select id="bd"><option value="">(tidak dipilih)</option>${((d&&d.dal)||[]).map(x=>`<option>${esc(x)}</option>`).join('')}</select>
<p class="mut">Biaya tetap masuk Laba Rugi. Bila dana alokasi dipilih, salinannya otomatis tercatat di CALK sebagai uang keluar dana itu (angka polos), jadi jangan dicatat lagi di CALK. Bisa juga dipasang atau diubah nanti dari daftar di bawah. Uang keluar dana alokasi yang bukan biaya usaha dicatat langsung di Admin > CALK Arus Kas.</p>
<label>Keterangan</label><input id="bn" maxlength="120" placeholder="mis. Belanja ayam dan udang 10 kg">
<details style="margin-top:10px"><summary><b>Rincian pembelian (untuk laporan akuntan)</b></summary><p class="mut">Opsional. <b>Uraian</b>, bidang, jumlah, dan satuan ikut tampil di laporan akuntan. <b>Keterangan</b> dan <b>tempat beli</b> tidak pernah tampil ke akuntan.</p><label>Bidang</label><select id="bb"><option>Umum</option><option>Makanan</option><option>Baju</option></select><label>Uraian barang (tampil ke akuntan)</label><input id="bu" maxlength="120" placeholder="mis. Ayam fillet"><div class="row" style="gap:8px"><div style="flex:1"><label>Jumlah barang</label><input id="bq" type="number" inputmode="decimal" min="0" placeholder="mis. 10"></div><div style="flex:1"><label>Satuan</label><input id="bs2" maxlength="20" placeholder="kg / pcs / dus"></div></div><label>Tempat beli (rahasia dari akuntan)</label><input id="bm" maxlength="120" placeholder="mis. nama pasar atau toko"></details>
<label>Jumlah (Rp)</label><input id="bj" type="number" inputmode="numeric" min="1" placeholder="mis. 650000">
<label>Dibayar lewat</label><select id="bc">${opt(cara,V.bcara)}</select>
<button class="btn" style="margin-top:10px;width:100%" onclick="biayaSimpan()">Simpan biaya</button></div>
<div class="box"><div class="row"><b>Biaya terbaru</b><button class="btn o s" onclick="V.bia=null;draw()">Muat ulang</button></div>${
 !d?'<p class="mut">Memuat…</p>':d.err?`<p class="bad">${esc(d.err)}</p>`:
 `<p>Bulan ini (${esc(d.bln)}): <b>${rp(d.tot)}</b> dari ${d.n} catatan</p>`+(d.l.length?d.l.map((x,i)=>`<div class="row" style="padding:6px 0;border-top:1px solid var(--line,#eee)"><span>${esc(x.t)} · ${esc(x.k)}<br><small class="mut">${esc(x.ket)} · ${esc(x.c)}${x.bid&&x.bid!='Umum'?' · '+esc(x.bid):''}${x.ura?' · '+esc(x.ura)+(x.qty?' '+esc(x.qty)+' '+esc(x.sat||''):''):''}</small><br><select aria-label="Dana alokasi" onchange="biayaDal(${i},this.value)" style="margin-top:4px;max-width:100%"><option value="">Dana alokasi: (tidak ada)</option>${(d.dal||[]).map(z=>`<option${z==x.dal?' selected':''}>${esc(z)}</option>`).join('')}</select> ${x.ln?'<small class="mut">✓ tercatat di CALK</small>':x.dal?`<small class="bad">belum masuk CALK</small> <button class="btn o s" onclick="biayaDal(${i},'${esc(x.dal)}')">Masukkan ke CALK</button>`:''}</span><b>${rp(x.j)}</b></div>`).join('')+(d.total>d.l.length&&d.lim<300?`<p style="margin-top:8px"><button class="btn o s" onclick="V.blim=Math.min(300,(V.blim||25)+100);V.bia=null;draw()">Tampilkan lebih banyak (${d.l.length} dari ${d.total})</button></p>`:''):'<p class="mut">Belum ada catatan biaya.</p>')}</div>`}
(window.__muat=window.__muat||[]).push('js/admin/biaya.js');
