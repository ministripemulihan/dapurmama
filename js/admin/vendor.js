/* js/admin/vendor.js (v59): Daftar Vendor. Nama, telepon/WhatsApp, bank, nomor rekening, atas nama, catatan. Tersimpan di tab Vendor di Google Sheet.
   HANYA Administrator dan Owner: server menolak Staf dan Akuntan (vn_list, vn_simpan, vn_hapus). Nama vendor tidak bisa diubah setelah dibuat (catatan utang memakai nama itu).
   Tombol WhatsApp membuka wa.me ke nomor vendor dengan pesan siap kirim. Dipakai juga oleh Kartu Hutang (venWA, venSalinRek, venInfo). */
const venRp=n=>rp(Math.round(+n||0));
const venTgl=v=>{const d=new Date(String(v).slice(0,10)+'T00:00:00');return isNaN(d)?'':d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})};
function venMuat(){V.venq=1;return post({act:'vn_list'}).then(r=>{V.ven=(r&&r.ok)?r:{err:(r&&r.err)||'Gagal memuat daftar vendor.'}}).catch(()=>{V.ven={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V.venq=0;if(V.tab=='ven')draw()})}
/* pesan WhatsApp ke vendor: bila masih ada sisa utang, sebut jumlah dan jatuh tempo; bila tidak, sapaan biasa */
function venPesan(nama,saldo,jt){return saldo>0?'Halo '+nama+', kami dari '+NM()+'. Sisa utang kami ke '+nama+' saat ini '+venRp(saldo)+(jt?' (jatuh tempo '+venTgl(jt)+')':'')+'. Mohon dicek apakah sudah sesuai. Terima kasih.':'Halo '+nama+', kami dari '+NM()+'. '}
function venWA(nama,tel,saldo,jt,teks){if(!waNum(tel))return toast('Nomor WhatsApp vendor belum diisi atau belum benar. Isi di menu Vendor.');return waOpen(tel,teks||venPesan(nama,+saldo||0,jt))}
function venRekTeks(x){return x&&x.rek?(x.bank?x.bank+' ':'')+x.rek+(x.an?' a.n. '+x.an:''):''}
function venSalinRek(nama,bank,rek,an){const t=venRekTeks({bank,rek,an});if(!t)return toast('Rekening vendor belum diisi.');if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>toast('Rekening '+nama+' disalin.')).catch(()=>toast('Tidak bisa menyalin.'));else toast('Tidak bisa menyalin.')}
/* baris info kontak (telepon, bank, rekening) untuk dipakai di layar lain */
function venInfo(x){if(!x)return'';const a=[];if(x.tel)a.push('📱 '+esc('+'+x.tel));const rk=venRekTeks(x);if(rk)a.push('🏦 '+esc(rk));return a.length?`<div class="mut">${a.join(' · ')}</div>`:''}
function venBuka(i){const v=V.ven&&V.ven.v&&V.ven.v[i];if(!v)return;V.venf={row:v.row,nama:v.nama,tel:v.tel,bank:v.bank,rek:v.rek,an:v.an,cat:v.cat,aktif:v.aktif,n:v.n};draw();scrollTo(0,0)}
function venBaru(){V.venf={row:0,nama:'',tel:'',bank:'',rek:'',an:'',cat:'',aktif:true,n:0};draw();scrollTo(0,0)}
function venDaftar(i){const b=V.ven&&V.ven.belum&&V.ven.belum[i];if(!b)return;V.venf={row:0,nama:b.nama,tel:'',bank:'',rek:'',an:'',cat:'',aktif:true,n:b.n};draw();scrollTo(0,0)}
function venBatal(){V.venf=null;draw()}
function venSimpan(){if(V.vens)return;const f=V.venf;if(!f)return;const nama=f.row?f.nama:$('#vnn').value.trim();
 if(nama.length<2)return toast('Isi nama vendor (minimal 2 huruf).');
 V.vens=1;post({act:'vn_simpan',row:f.row||0,nama,tel:$('#vnt').value.trim(),bank:$('#vnb').value.trim(),rek:$('#vnr').value.trim(),an:$('#vna').value.trim(),cat:$('#vnc').value.trim(),aktif:$('#vnk').checked}).then(r=>{
  if(r&&r.ok){toast('Vendor '+nama+' tersimpan.');V.venf=null;V.ven=null;V.hu=null}else toast((r&&r.err)||'Gagal menyimpan vendor.')
 }).catch(()=>toast('Tidak ada koneksi. Belum tersimpan, coba lagi.')).then(()=>{V.vens=0;draw()})}
function venHapus(){const f=V.venf;if(!f||!f.row)return;konfirm('Hapus vendor '+f.nama+' dari daftar? Hanya bisa bila belum ada catatan utang.',()=>{post({act:'vn_hapus',row:f.row,nama:f.nama}).then(r=>{
  if(r&&r.ok){toast('Vendor dihapus.');V.venf=null;V.ven=null;V.hu=null}else toast((r&&r.err)||'Gagal menghapus.');draw()}).catch(()=>toast('Tidak ada koneksi.'))},'Ya, hapus')}
function venForm(f){const ro=f.row?' readonly':'';
 return`<div class="box"><b>${f.row?'Ubah vendor':'Vendor baru'}</b>${f.row?'<p class="mut">Nama tidak bisa diubah (catatan utang memakai nama ini). Salah ketik: nonaktifkan lalu buat vendor baru, atau hapus bila belum ada utang.</p>':''}
 <label>Nama vendor</label><input id="vnn" maxlength="60" value="${esc(f.nama)}"${ro}>
 <label>Telepon / WhatsApp</label><input id="vnt" type="tel" inputmode="tel" placeholder="mis. 0812xxxxxxxx" value="${esc(f.tel)}">
 <label>Nama bank</label><input id="vnb" maxlength="40" placeholder="mis. BCA" value="${esc(f.bank)}">
 <label>Nomor rekening</label><input id="vnr" inputmode="numeric" placeholder="angka saja" value="${esc(f.rek)}">
 <label>Atas nama rekening</label><input id="vna" maxlength="60" value="${esc(f.an)}">
 <label>Catatan</label><input id="vnc" maxlength="200" placeholder="mis. kirim tiap Senin" value="${esc(f.cat)}">
 <label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input id="vnk" type="checkbox"${f.aktif?' checked':''}> Aktif (vendor nonaktif tidak bisa dipilih untuk belanja hutang baru)</label>
 <div class="row" style="margin-top:10px"><button class="btn g" onclick="venSimpan()"${V.vens?' disabled':''}>Simpan</button><button class="btn o" onclick="venBatal()">Batal</button>${f.row&&!f.n?'<button class="btn r s" onclick="venHapus()">Hapus</button>':''}</div></div>`}
function aVen(){if(!V.ven&&!V.venq)venMuat();const r=V.ven;
 if(!r)return'<h2>Vendor</h2><div class="box">Memuat dari Google Sheet…</div>';
 if(r.err)return`<h2>Vendor</h2><div class="box bad">${esc(r.err)}</div><button class="btn o" onclick="V.ven=null;draw()">Coba lagi</button>`;
 if(V.venf)return`<h2>Vendor</h2>${venForm(V.venf)}`;
 const kar=(x,i)=>`<div class="box"><div class="row"><b>${esc(x.nama)}${x.aktif?'':' <span class="mut">(nonaktif)</span>'}</b><b class="${x.saldo>0?'bad':'ok'}">${x.saldo>0?venRp(x.saldo):'lunas'}</b></div>
  ${venInfo(x)||'<div class="mut">Telepon dan rekening belum diisi.</div>'}${x.cat?`<div class="mut">${esc(x.cat)}</div>`:''}${/^Otomatis dari/.test(x.cat||'')&&!x.tel&&!x.rek?'<div><b class="bad">Baru, belum lengkap</b>: isi telepon dan rekening lewat Ubah.</div>':''}${(m=>m?`<div class="row" style="margin-top:4px"><span class="bad">Mungkin kembar dengan <b>${esc(m[1].trim())}</b></span><button class="btn o s" onclick="venGabung(${i},'${esc(m[1].trim()).replace(/'/g,"\\'")}')">Gabung ke itu</button></div>`:'')(/MIRIP: ([^(]+)/.exec(x.cat||''))}
  ${x.lewat?`<div class="bad"><b>LEWAT jatuh tempo ${esc(venTgl(x.jt))}</b></div>`:(x.saldo>0&&x.jt?`<div class="mut">jatuh tempo ${esc(venTgl(x.jt))}</div>`:'')}
  <div class="row" style="margin-top:6px;flex-wrap:wrap"><button class="btn s" onclick="venWA(V.ven.v[${i}].nama,V.ven.v[${i}].tel,V.ven.v[${i}].saldo,V.ven.v[${i}].jt)">WhatsApp</button>${x.rek?`<button class="btn o s" onclick="venSalinRek(V.ven.v[${i}].nama,V.ven.v[${i}].bank,V.ven.v[${i}].rek,V.ven.v[${i}].an)">Salin rekening</button>`:''}<button class="btn o s" onclick="venBuka(${i})">Ubah</button><button class="btn o s" onclick="venGabungPilih(${i})">Gabung…</button><button class="btn o s" onclick="V.hv=V.ven.v[${i}].nama;V.hu=null;admGo('hut')">Kartu hutang</button></div></div>`;
 return`<h2>Vendor</h2><p class="mut">Daftar vendor (pemasok). Hanya Administrator dan Owner yang bisa melihat dan mengubahnya; Staf dan Akuntan tidak. Belanja hutang di Kartu Hutang memakai daftar ini.</p>
 <button class="btn g" onclick="venBaru()">+ Vendor baru</button>
 ${r.v.length?r.v.map(kar).join(''):'<div class="box">Belum ada vendor. Tekan <b>+ Vendor baru</b>, atau catat belanja hutang di Kartu Hutang (vendornya otomatis masuk daftar).</div>'}
 ${(r.belum||[]).length?`<div class="box"><b>Belum didaftarkan</b><p class="mut">Nama ini ada di catatan utang (mis. dari catatan lama atau dari Staf) tetapi belum punya data kontak. Daftarkan agar tombol WhatsApp dan rekening tersedia. Nama harus sama dengan yang tercatat.</p>${r.belum.map((b,i)=>`<div class="row" style="padding:4px 0;border-top:1px solid #0001"><span><b>${esc(b.nama)}</b><br><span class="mut">${b.n} catatan · sisa ${venRp(b.saldo)}</span></span><button class="btn o s" onclick="venDaftar(${i})">Daftarkan</button></div>`).join('')}</div>`:''}`}
function venGabung(i,ke){const d=V.ven.v[i];if(!d)return;konfirm('Gabungkan "'+d.nama+'" ke "'+ke+'"? Semua catatan utang "'+d.nama+'" pindah ke "'+ke+'", telepon dan rekening dilengkapi bila kosong, lalu "'+d.nama+'" dihapus dari daftar. Total utang tidak berubah.',()=>{post({act:'vn_gabung',dari:d.nama,ke}).then(r=>{toast(r&&r.ok?'Digabung ('+r.n+' catatan dipindah).':(r&&r.err)||'Gagal menggabung.');V.ven=null;V.hu=null;draw()}).catch(()=>toast('Tidak ada koneksi.'))})}
function venGabungPilih(i){const d=V.ven.v[i];if(!d)return;const ke=prompt('Ketik nama vendor TUJUAN (yang dipertahankan). "'+d.nama+'" akan digabung ke dalamnya.');if(!ke||!ke.trim())return;const t=V.ven.v.find(x=>x.nama.toLowerCase()==ke.trim().toLowerCase());if(!t)return toast('Vendor "'+ke.trim()+'" tidak ada di daftar.');venGabung(i,t.nama)}
(window.__muat=window.__muat||[]).push('js/admin/vendor.js');
