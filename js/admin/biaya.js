/* js/admin/biaya.js : v32 catat uang keluar (biaya) dari HP. Tersimpan di tab Biaya di Google Sheet (dibaca Ringkasan Keuangan). Hanya admin. */
function biayaMuat(){V.bq=1;return post({act:'biaya_list'}).then(r=>{V.bia=(r&&r.ok)?r:{err:(r&&r.err)||'Gagal memuat daftar biaya.'}}).catch(()=>{V.bia={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V.bq=0;if(V.tab=='bia')draw()})}
function biayaSimpan(){if(V.bs)return;const j=Math.round(+$('#bj').value||0),ket=$('#bn').value.trim();
 if(!(j>0))return toast('Isi jumlah uang (angka lebih dari 0).');
 if(!ket)return toast('Isi keterangan, mis. Belanja ayam 10 kg.');
 V.bs=1;V.bkat=$('#bk').value;V.bcara=$('#bc').value;
 post({act:'biaya_add',tgl:$('#bt').value,kat:V.bkat,ket,jml:j,cara:V.bcara}).then(r=>{
  if(r&&r.ok){toast('Biaya '+rp(j)+' tercatat.');V.bia=null}else toast((r&&r.err)||'Gagal mencatat biaya.')
 }).catch(()=>toast('Tidak ada koneksi. Biaya belum tercatat, coba lagi.')).then(()=>{V.bs=0;draw()})}
function aBia(){
 if(!gk())return'<div class="box">Belum tersambung ke Google Sheet. Buka tab Pengaturan, tempel Kunci sinkron, lalu kembali ke sini.</div>';
 if(!V.bia&&!V.bq)biayaMuat();
 const d=V.bia,kat=(d&&d.kat)||['Bahan baku','Kemasan','Ongkir/kurir','Gaji','Sewa','Listrik/gas/air','Iklan','Peralatan','Lain-lain'],cara=['Tunai','Transfer','QRIS','Lainnya'],
  opt=(L,v)=>L.map(x=>`<option${x==v?' selected':''}>${esc(x)}</option>`).join('');
 return`<div class="box"><b>Catat uang keluar</b><p class="mut">Bahan, kemasan, ongkir, gaji, dan lain-lain. Masuk ke tab Biaya di Google Sheet dan dihitung di Ringkasan Keuangan.</p>
<label>Tanggal</label><input id="bt" type="date" value="${tglWIB()}" max="${tglWIB()}">
<label>Kategori</label><select id="bk">${opt(kat,V.bkat)}</select>
<label>Keterangan</label><input id="bn" maxlength="120" placeholder="mis. Belanja ayam dan udang 10 kg">
<label>Jumlah (Rp)</label><input id="bj" type="number" inputmode="numeric" min="1" placeholder="mis. 650000">
<label>Dibayar lewat</label><select id="bc">${opt(cara,V.bcara)}</select>
<button class="btn" style="margin-top:10px;width:100%" onclick="biayaSimpan()">Simpan biaya</button></div>
<div class="box"><div class="row"><b>Biaya terbaru</b><button class="btn o s" onclick="V.bia=null;draw()">Muat ulang</button></div>${
 !d?'<p class="mut">Memuat…</p>':d.err?`<p class="bad">${esc(d.err)}</p>`:
 `<p>Bulan ini (${esc(d.bln)}): <b>${rp(d.tot)}</b> dari ${d.n} catatan</p>`+(d.l.length?d.l.map(x=>`<div class="row" style="padding:6px 0;border-top:1px solid var(--line,#eee)"><span>${esc(x.t)} · ${esc(x.k)}<br><small class="mut">${esc(x.ket)} · ${esc(x.c)}</small></span><b>${rp(x.j)}</b></div>`).join(''):'<p class="mut">Belum ada catatan biaya.</p>')}</div>`}
(window.__muat=window.__muat||[]).push('js/admin/biaya.js');
