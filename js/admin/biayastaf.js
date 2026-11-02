/* js/admin/biayastaf.js : v49 staf mencatat biaya SENDIRI tanpa kunci terbuka. Angka disandikan di server (kunci antrean) dan dipindah ke tab Biaya saat Administrator/Owner membuka kunci. Staf hanya melihat catatannya sendiri. */
function sbMuat(){V.sbq=1;return post({act:'sb_list'}).then(r=>{V.sb=(r&&r.ok)?r:{err:(r&&r.err)||'Gagal memuat catatan biaya.'};if(r&&r.ok&&r.hk){try{localStorage.setItem('dm_hk',r.hk.join(','))}catch(e){}if((r.hk.indexOf('KasMasuk')>=0||r.hk.indexOf('Modal')>=0)&&!V.sm&&!V.smq)smMuat();if(r.hk.indexOf('KasKeluar')>=0&&!V.sk&&!V.skq)skMuat()}if(r&&r.ok&&r.vl)try{localStorage.setItem('dm_sbvl',JSON.stringify(r.vl))}catch(e){}}).catch(()=>{V.sb={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V.sbq=0;if(V.tab=='sbi')draw()})}
function sbJenis(sel){const h=sel.value=='Hutang';const a=$('#sbh'),b=$('#sbc');if(a)a.style.display=h?'':'none';if(b)b.style.display=h?'none':''}   /* v59: tanpa menggambar ulang supaya isian tidak hilang */
function sbRiwayat(){try{return JSON.parse(localStorage.getItem('dm_sbrec')||'[]')}catch(e){return[]}}
function sbIngat(x){const L=sbRiwayat().filter(y=>!(y.ket==x.ket&&y.vd==x.vd&&y.kat==x.kat));L.unshift(x);try{localStorage.setItem('dm_sbrec',JSON.stringify(L.slice(0,6)))}catch(e){}}
function sbIsi(i){const x=sbRiwayat()[i];if(!x)return;const set=(id,v)=>{const e=$('#'+id);if(e)e.value=v==null?'':v};set('sk',x.kat);set('sn',x.ket);set('sj',x.jml);set('sjn',x.jn);if(x.jn=='Tunai')set('sc',x.cara);set('sv',x.vd);set('su',x.ura);set('ss',x.sat);set('sm',x.tmp);sbJenis($('#sjn'));toast('Terisi dari catatan sebelumnya. Cek jumlahnya.')}
function sbFotoPilih(){fotoPilih(d=>{V.sbfoto=d;const e=$('#sbfp');if(e)e.textContent='✅ Foto nota siap ('+Math.round(d.length*.75/1024)+' KB)'})}
function sbSimpan(){if(V.sbs)return;const j=Math.round(+$('#sj').value||0),ket=$('#sn').value.trim(),hu=$('#sjn')&&$('#sjn').value=='Hutang',vd=hu?$('#sv').value.trim().replace(/\s+/g,' '):'';
 if(!(j>0))return toast('Isi jumlah uang (angka lebih dari 0).');
 if(!ket)return toast('Isi keterangan, mis. Belanja ayam 10 kg.');
 if(hu&&vd.length<2)return toast('Isi nama vendor untuk belanja berutang.');
 V.sbs=1;V.sbkat=$('#sk').value;V.sbcara=$('#sc').value;
 const b={act:'sb_add',tgl:$('#st').value,kat:V.sbkat,ket,jml:j,cara:V.sbcara,bid:$('#sb').value,ura:$('#su').value.trim(),qty:$('#sq').value,sat:$('#ss').value.trim(),tmp:$('#sm').value.trim(),jenis:hu?'Hutang':'Tunai',vendor:vd,jt:hu?$('#sjt').value:''};if(hu&&V.sbfoto)b.foto=V.sbfoto;
 obKirim(b,(hu?'Hutang ':'Biaya ')+rp(j)+' · '+ket).then(r=>{
  if(r&&r.ok){sbIngat({kat:b.kat,ket,jml:j,jn:b.jenis,cara:b.cara,vd,ura:b.ura,sat:b.sat,tmp:b.tmp});V.sbfoto=null;
   toast(r.antre?'Tersimpan di HP. Dikirim otomatis saat internet kembali.':(hu?'Belanja berutang '+rp(j)+' ke '+vd:'Biaya '+rp(j))+' tercatat.'+(r.masuk?'':' Menunggu dibuka oleh Admin/Owner.'));V.sb=null}else toast((r&&r.err)||'Gagal mencatat biaya.')
 }).then(()=>{V.sbs=0;draw()})}
function sbBatal(id){if(!confirm('Batalkan catatan biaya ini?'))return;post({act:'sb_batal',id}).then(r=>{toast(r&&r.ok?'Catatan dibatalkan.':(r&&r.err)||'Gagal membatalkan.');V.sb=null;draw()}).catch(()=>toast('Tidak ada koneksi.'))}
function sbStatus(st){return st=='menunggu'?'<span class="mut">⏳ menunggu dibuka Admin/Owner</span>':st=='dipindah'?'<span>✅ masuk pembukuan</span>':st=='dibatalkan'?'<span class="mut">dibatalkan</span>':'<span class="bad">bermasalah, hubungi Admin</span>'}
function aSbiKeluar(){
 if(!gk())return'<div class="box">Belum tersambung ke Google Sheet. Buka tab Pengaturan, tempel Kunci sinkron, lalu kembali ke sini.</div>';
 if(!V.sb&&!V.sbq)sbMuat();
 const d=V.sb,kat=(d&&d.kat)||['Bahan baku','Kemasan','Ongkir/kurir','Gaji','Sewa','Listrik/gas/air','Iklan','Peralatan','Lain-lain'],cara=(d&&d.cara)||['Tunai','Transfer','QRIS','Lainnya'],bid=(d&&d.bid)||['Umum'],
  opt=(L,v)=>L.map(x=>`<option${x==v?' selected':''}>${esc(x)}</option>`).join('');
 return`<div class="box"><b>Catat biaya usaha</b>${obBox(['sb_add'])}${sbRiwayat().length?`<div class="mut">Ulangi cepat:</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">${sbRiwayat().map((x,i)=>`<button class="btn o s" onclick="sbIsi(${i})">${esc(String(x.ket).slice(0,22))}</button>`).join('')}</div>`:''}<p class="mut">Biaya usaha yang masuk pembukuan (Laba Rugi). Tidak perlu kunci. Angka langsung disandikan di server dan hanya Admin/Owner yang bisa melihat semuanya. Anda hanya melihat catatan yang Anda buat sendiri. Untuk uang keluar dari dana alokasi, pakai kotak Catat uang keluar dana alokasi.</p>
<label>Tanggal</label><input id="st" type="date" value="${tglWIB()}" max="${tglWIB()}">
<label>Kategori</label><select id="sk">${opt(kat,V.sbkat)}</select>
<label>Keterangan</label><input id="sn" maxlength="120" placeholder="mis. Belanja ayam dan udang 10 kg">
<label>Jumlah (Rp)</label><input id="sj" type="number" inputmode="numeric" min="1" placeholder="mis. 650000">
<label>Pembayaran</label><select id="sjn" onchange="sbJenis(this)"><option value="Tunai">Sudah dibayar</option><option value="Hutang">Belum dibayar (berutang ke vendor)</option></select>
<div id="sbc"><label>Dibayar lewat</label><select id="sc">${opt(cara,V.sbcara)}</select></div>
<div id="sbh" style="display:none"><label>Nama vendor</label><datalist id="svl">${((d&&d.vl)||(()=>{try{return JSON.parse(localStorage.getItem('dm_sbvl')||'[]')}catch(e){return[]}})()).map(n=>`<option value="${esc(n)}">`).join('')}</datalist><input id="sv" list="svl" maxlength="60" placeholder="pilih dari daftar atau ketik nama"><div class="mut">Pilih dari daftar agar tidak ada nama ganda. Nama baru langsung terdaftar sebagai vendor.</div><label>Jatuh tempo (opsional)</label><input id="sjt" type="date" min="${tglWIB()}"><div class="row" style="margin-top:6px"><button class="btn o s" onclick="sbFotoPilih()">📷 Foto nota</button><span id="sbfp" class="mut"></span></div><p class="mut">Pelunasan dicatat oleh Admin/Owner, bukan di sini.</p></div>
<details style="margin-top:10px"><summary><b>Rincian pembelian (opsional)</b></summary>
<label>Bidang</label><select id="sb">${opt(bid,bid.length==1?bid[0]:'Umum')}</select>
<label>Uraian barang</label><input id="su" maxlength="120" placeholder="mis. Ayam fillet">
<label>Jumlah barang</label><input id="sq" type="number" inputmode="decimal" min="0" step="any">
<label>Satuan</label><input id="ss" maxlength="20" placeholder="kg, pak, pcs">
<label>Tempat beli</label><input id="sm" maxlength="120" placeholder="mis. Pasar Keputran"></details>
<button class="btn" style="margin-top:10px;width:100%" onclick="sbSimpan()">Simpan biaya</button></div>
<div class="box"><div class="row"><b>Catatan saya</b><button class="btn o s" onclick="V.sb=null;draw()">Muat ulang</button></div>${
 !d?'<p class="mut">Memuat…</p>':d.err?`<p class="bad">${esc(d.err)}</p>`:
 `<p>Bulan ini (${esc(d.bln)}): <b>${rp(d.tot)}</b> dari ${d.n} catatan</p>`+(d.l.length?d.l.map(x=>`<div class="row" style="padding:6px 0;border-top:1px solid var(--line,#eee)"><span>${esc(x.t)} · ${esc(x.k)}<br><small class="mut">${esc(x.ket)} · ${x.jn=='Hutang'?'<b>HUTANG</b> ke '+esc(x.vd)+(x.jt?' (jatuh tempo '+esc(x.jt)+')':''):esc(x.c)}</small><br><small>${sbStatus(x.st)}</small></span><span style="text-align:right"><b>${x.st=='dibatalkan'?'-':rp(x.j)}</b>${x.st=='menunggu'?`<br><button class="btn r s" onclick="sbBatal('${esc(x.id)}')">Batalkan</button>`:''}</span></div>`).join(''):'<p class="mut">Belum ada catatan.</p>')}</div>`}
/* v62: hak dana alokasi Staf. Masuk = hanya catat uang masuk; Keluar (bawaan) = hanya uang keluar; Keduanya. Server menolak yang tidak berhak. */
function sbHk(){const d=V.sb;if(d&&d.hk)return d.hk;try{const x=localStorage.getItem('dm_hk');if(x!==null)return x?x.split(','):[]}catch(e){}return['KasKeluar','Biaya']}
function sbiNama(){return'Catat'}
function sbiJudul(){return'Catat Kas & Biaya'}
function smMuat(){V.smq=1;return post({act:'sm_list'}).then(r=>{V.sm=(r&&r.ok)?r:{err:(r&&r.err)||'Gagal memuat catatan uang masuk.'}}).catch(()=>{V.sm={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V.smq=0;if(V.tab=='sbi')draw()})}
function smSimpan(){if(V.sms)return;const j=Math.round(+$('#mj').value||0),ket=$('#mk').value.trim(),dal=$('#md').value;
 if(!(j>0))return toast('Isi jumlah uang (angka lebih dari 0).');if(!ket)return toast('Isi keterangan, mis. Setoran modal dari Bu Ani.');
 V.sms=1;V.smdal=dal;V.smcara=$('#mc').value;
 post({act:'sm_add',tgl:$('#mt').value,dal,ket,jml:j,cara:V.smcara}).then(r=>{if(r&&r.ok){toast('Uang masuk '+rp(j)+' tercatat.');V.sm=null}else toast((r&&r.err)||'Gagal mencatat uang masuk.')}).catch(()=>toast('Tidak ada koneksi. Belum tercatat, coba lagi.')).then(()=>{V.sms=0;draw()})}
function aSbiMasuk(){
 if(!V.sm&&!V.smq)smMuat();const d=V.sm,opt=(L,v)=>L.map(x=>`<option${x==v?' selected':''}>${esc(x)}</option>`).join('');
 return`<div class="box"><b>Catat arus kas masuk dana alokasi</b><p class="mut">Bagian CALK: modal (dana Modal), pinjaman, atau dana yang dialokasikan (bahan baku, gaji, entertainment, dst.). Bukan penjualan dan bukan biaya. Anda hanya melihat catatan yang Anda buat sendiri.</p>
${(d&&d.masuk)?`<label>Tanggal</label><input id="mt" type="date" value="${tglWIB()}" max="${tglWIB()}">
<label>Dana alokasi</label><select id="md">${opt(d.masuk,V.smdal)}</select>
<label>Keterangan</label><input id="mk" maxlength="120" placeholder="mis. Setoran modal dari Bu Ani">
<label>Jumlah (Rp)</label><input id="mj" type="number" inputmode="numeric" min="1" placeholder="mis. 1000000">
<label>Diterima lewat</label><select id="mc">${opt(['Tunai','Transfer','QRIS','Lainnya'],V.smcara)}</select>
<button class="btn" style="margin-top:10px;width:100%" onclick="smSimpan()" ${V.sms?'disabled':''}>Simpan uang masuk</button>`:(d&&d.err?`<p class="bad">${esc(d.err)}</p>`:'<p class="mut">Memuat…</p>')}</div>
<div class="box"><div class="row"><b>Uang masuk saya</b><button class="btn o s" onclick="V.sm=null;draw()">Muat ulang</button></div>${!d?'<p class="mut">Memuat…</p>':d.err?'':`<p>Bulan ini (${esc(d.bln)}): <b>${rp(d.tot)}</b> dari ${d.n} catatan</p>`+(d.l.length?d.l.map(x=>`<div class="row" style="padding:6px 0;border-top:1px solid var(--line,#eee)"><span>${esc(x.t)} · <b>${esc(x.dal)}</b><br><small class="mut">${esc(x.ket)} · ${esc(x.c)}</small></span><b>${rp(x.j)}</b></div>`).join(''):'<p class="mut">Belum ada catatan.</p>')}</div>`}
/* v63: Staf mencatat UANG KELUAR dana alokasi: tab Uang Keluar, tidak terenkripsi, tidak lewat antrean, tidak masuk Laba Rugi. Perlu internet (seperti uang masuk). Hanya melihat catatan sendiri. */
function skMuat(){V.skq=1;return post({act:'sk_list'}).then(r=>{V.sk=(r&&r.ok)?r:{err:(r&&r.err)||'Gagal memuat catatan uang keluar dana alokasi.'}}).catch(()=>{V.sk={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V.skq=0;if(V.tab=='sbi')draw()})}
function skSimpan(){if(V.sks)return;const j=Math.round(+$('#kj').value||0),ket=$('#kk').value.trim(),dal=$('#kd').value;
 if(!(j>0))return toast('Isi jumlah uang (angka lebih dari 0).');if(!ket)return toast('Isi keterangan, mis. Belanja bumbu dan saus.');
 V.sks=1;V.skdal=dal;V.skcara=$('#kc').value;
 post({act:'sk_add',tgl:$('#kt').value,dal,ket,jml:j,cara:V.skcara}).then(r=>{if(r&&r.ok){toast('Uang keluar dana alokasi '+rp(j)+' tercatat.');V.sk=null}else toast((r&&r.err)||'Gagal mencatat uang keluar.')}).catch(()=>toast('Tidak ada koneksi. Belum tercatat, coba lagi.')).then(()=>{V.sks=0;draw()})}
function aSbiKeluarDana(){
 if(!V.sk&&!V.skq)skMuat();const d=V.sk,opt=(L,v)=>L.map(x=>`<option${x==v?' selected':''}>${esc(x)}</option>`).join('');
 return`<div class="box"><b>Catat arus kas keluar dana alokasi</b><p class="mut">Uang yang Anda pakai dari dana alokasi (belanja bahan baku, gaji, entertainment, dst.). Tidak terenkripsi dan tidak masuk Laba Rugi. Anda hanya melihat catatan yang Anda buat sendiri.</p>
${(d&&d.keluar)?`<label>Tanggal</label><input id="kt" type="date" value="${tglWIB()}" max="${tglWIB()}">
<label>Dana alokasi</label><select id="kd">${opt(d.keluar,V.skdal)}</select>
<label>Keterangan</label><input id="kk" maxlength="120" placeholder="mis. Belanja bumbu dan saus">
<label>Jumlah (Rp)</label><input id="kj" type="number" inputmode="numeric" min="1" placeholder="mis. 150000">
<label>Dibayar lewat</label><select id="kc">${opt(['Tunai','Transfer','QRIS','Lainnya'],V.skcara)}</select>
<button class="btn" style="margin-top:10px;width:100%" onclick="skSimpan()" ${V.sks?'disabled':''}>Simpan uang keluar</button>`:(d&&d.err?`<p class="bad">${esc(d.err)}</p>`:'<p class="mut">Memuat…</p>')}</div>
<div class="box"><div class="row"><b>Uang keluar dana alokasi saya</b><button class="btn o s" onclick="V.sk=null;draw()">Muat ulang</button></div>${!d?'<p class="mut">Memuat…</p>':d.err?'':`<p>Bulan ini (${esc(d.bln)}): <b>${rp(d.tot)}</b> dari ${d.n} catatan</p>`+(d.l.length?d.l.map(x=>`<div class="row" style="padding:6px 0;border-top:1px solid var(--line,#eee)"><span>${esc(x.t)} · <b>${esc(x.dal)}</b><br><small class="mut">${esc(x.ket)} · ${esc(x.c)}</small></span><b>${rp(x.j)}</b></div>`).join(''):'<p class="mut">Belum ada catatan.</p>')}</div>`}
/* v63: layar Staf = menu terpisah sesuai izin: Arus Kas Masuk (atau Modal bila hanya izin Modal), Arus Kas Keluar, Biaya Usaha. */
function sbMenu(k){V.sbm=k;draw()}
function aSbi(){
 if(!gk())return'<div class="box">Belum tersambung ke Google Sheet. Buka tab Pengaturan, tempel Kunci sinkron, lalu kembali ke sini.</div>';
 if(!V.sb&&!V.sbq)sbMuat();const d=V.sb;
 if(!d)return'<div class="box"><p class="mut">Memuat…</p></div>';
 if(d.err)return`<div class="box"><p class="bad">${esc(d.err)}</p><button class="btn o s" onclick="V.sb=null;draw()">Coba lagi</button></div>`;
 const hk=d.hk||[],M=[['KasMasuk',hk.indexOf('KasMasuk')>=0?'Arus Kas Masuk':'Modal',aSbiMasuk],['KasKeluar','Arus Kas Keluar',aSbiKeluarDana],['Biaya','Biaya Usaha',aSbiKeluar]].filter(x=>x[0]=='KasMasuk'?(hk.indexOf('KasMasuk')>=0||hk.indexOf('Modal')>=0):hk.indexOf(x[0])>=0);
 if(!M.length)return'<div class="box"><b>Belum ada izin mencatat</b><p class="mut">Akun Anda belum diberi izin mencatat arus kas, modal, atau biaya. Minta Administrator/Owner (Admin > Pengguna > Ubah hak akses).</p></div>';
 const k=M.find(x=>x[0]==V.sbm)?V.sbm:M[0][0];
 return(M.length>1?`<div class="chips">${M.map(x=>`<div class="chip ${x[0]==k?'on':''}" onclick="sbMenu('${x[0]}')">${x[1]}</div>`).join('')}</div>`:'')+M.find(x=>x[0]==k)[2]()}
(window.__muat=window.__muat||[]).push('js/admin/biayastaf.js');
