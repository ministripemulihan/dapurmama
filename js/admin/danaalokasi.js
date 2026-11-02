/* js/admin/danaalokasi.js : v63 Dana Alokasi = buku sendiri (tab Uang Masuk dan Uang Keluar; tanpa enkripsi; di luar Laba Rugi). Tampilan donut cashflow per dana alokasi (pemasukan, pengeluaran, saldo), catat uang masuk DAN keluar.
   v61 Dana Alokasi. Laporan total pemasukan, total pengeluaran, dan per dana alokasi (semua bulan atau satu bulan),
   unduh CSV / Excel, catat uang masuk, tambah dana alokasi. Hanya Administrator dan Owner. Server: Code.gs bagian v61 (da_lap, da_daftar, da_tambah, um_add, um_list, um_hapus). */
function dalTahunList(bl,ym){const T={};bl.forEach(b=>T[b.slice(0,4)]=1);T[hari().slice(0,4)]=1;if(/^\d{4}$/.test(ym))T[ym]=1;return Object.keys(T).sort().reverse()}
function dalYm(){return V.dly||'semua'}
function dalNama(ym){return ym=='semua'?'Semua bulan':/^\d{4}$/.test(ym)?'Tahun '+ym:keuBulanNama(ym)}
function dalMuat(force){const ym=dalYm();V.dlr=V.dlr||{};if(V.dlq||(V.dlr[ym]&&!force))return;V.dlq=1;
 post({act:'da_lap',ym}).then(r=>{V.dlr[ym]=(r&&r.ok)?r:{err:(r&&r.err)||'Gagal memuat laporan.',kunci:!!(r&&r.terkunci)}}).catch(()=>{V.dlr[ym]={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V.dlq=0;if(V.tab=='dal')draw()})}
function dalMuatUM(){dalMuatCatat('M')}
function dalMuatCatat(jn){const kel=jn=='K',q=kel?'dlkq':'dluq';if(V[q])return;V[q]=1;
 Promise.all([post({act:kel?'uk_list':'um_list'}),post({act:'da_daftar'})]).then(a=>{V[kel?'dlk':'dlu']=(a[0]&&a[0].ok)?a[0]:{err:(a[0]&&a[0].err)||'Gagal memuat catatan.'};V.dld=(a[1]&&a[1].ok)?a[1]:null}).catch(()=>{V[kel?'dlk':'dlu']={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V[q]=0;if(V.tab=='dal')draw()})}
function dalPilih(ym){V.dly=ym||'semua';draw();dalMuat()}
function dalSegar(){V.dlr={};V.dlh={};V.dlu=null;V.dlk=null;V.dld=null;draw()}
function dalRef(){return(V.dlr||{})[dalYm()]}
function dalCsvSel(v){v=String(v==null?'':v);if(/^[=+\-@\t]/.test(v)&&isNaN(v))v="'"+v;return'"'+v.replace(/"/g,'""')+'"'}
function dalBaris(r){const J={M:'Masuk',K:'Keluar'};return[['Tanggal','Jenis','Dana alokasi','Jumlah (Rp)','Keterangan','Cara','Sumber']].concat(r.rows.map(x=>[x.t,J[x.jn],x.a,x.j,x.ket,x.c,x.s]))}
function dalTeks(){const r=dalRef();if(!r||!r.ok)return'';
 return'LAPORAN DANA ALOKASI '+NM()+'\nPeriode: '+dalNama(r.ym)+'\nTotal pemasukan: '+rp(r.masuk.total)+'\nTotal pengeluaran: '+rp(r.keluar.total)+'\nSelisih: '+rp(r.selisih)+'\n\nPer dana alokasi (masuk / keluar / saldo)\n'+r.alok.map(x=>'- '+x.k+': '+rp(x.m)+' / '+rp(x.x)+' / '+rp(x.sal)).join('\n')}
function dalUnduh(blob,nama){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nama;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800)}
function dalCsv(){const r=dalRef();if(!r||!r.ok)return toast('Tidak ada laporan untuk diunduh.');
 const ring=[['LAPORAN DANA ALOKASI',NM()],['Periode',dalNama(r.ym)],['Total pemasukan',r.masuk.total],['Total pengeluaran',r.keluar.total],['Selisih',r.selisih],[],['Dana alokasi','Masuk','Keluar','Saldo']].concat(r.alok.map(x=>[x.k,x.m,x.x,x.sal])).concat([[],['PER BULAN'],['Bulan','Pemasukan','Pengeluaran','Selisih']],r.bln.map(x=>[x.ym,x.m,x.x,x.sel]),[[],['RINCIAN']],dalBaris(r));
 dalUnduh(new Blob(['\ufeff'+ring.map(l=>l.map(dalCsvSel).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'dana-alokasi_'+r.ym+'.csv');
 if(r.lebih)toast('Rincian memuat '+r.rows.length+' catatan; '+r.lebih+' lainnya tidak ikut.')}
function dalXlsx(){const r=dalRef();if(!r||!r.ok)return toast('Tidak ada laporan untuk diunduh.');if(typeof xlsxBuild!='function')return toast('Penulis Excel belum dimuat. Muat ulang aplikasi.');
 const h=c=>({v:c,s:1}),m=v=>({v,s:2}),J={M:'Masuk',K:'Keluar'};
 const R1=[[{v:'Laporan Dana Alokasi: '+NM(),s:4}],['Periode',dalNama(r.ym)],['Dibuat',new Date().toLocaleString('id-ID')],[],[h('Keterangan'),h('Jumlah')],['Total pemasukan',m(r.masuk.total)],['Total pengeluaran',m(r.keluar.total)],[{v:'Selisih',s:4},{v:r.selisih,s:5}],[],[h('Sumber pemasukan'),h('Jumlah')]].concat(r.masuk.kat.map(x=>[x.k,m(x.j)]));
 const R2=[[h('Dana alokasi'),h('Masuk'),h('Keluar'),h('Saldo')]].concat(r.alok.map(x=>[x.k,m(x.m),m(x.x),m(x.sal)]));
 const R3=[[h('Bulan'),h('Pemasukan'),h('Pengeluaran'),h('Selisih')]].concat(r.bln.map(x=>[x.ym,m(x.m),m(x.x),m(x.sel)]));
 const R4=[['Tanggal','Jenis','Dana alokasi','Jumlah','Keterangan','Cara','Sumber'].map(h)].concat(r.rows.map(x=>[{v:xdate(x.t),s:3},J[x.jn],x.a,m(x.j),x.ket,x.c,x.s]));
 const bl=xlsxBuild([{n:'Ringkasan',r:R1,w:[34,18]},{n:'Per Dana Alokasi',r:R2,w:[30,16,16,16],f:1},{n:'Per Bulan',r:R3,w:[12,16,16,16],f:1},{n:'Rincian',r:R4,w:[12,10,28,16,44,12,34],f:1}]);
 dalUnduh(new Blob(bl,{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'dana-alokasi_'+r.ym+'.xlsx');
 if(r.lebih)toast('Rincian memuat '+r.rows.length+' catatan; '+r.lebih+' lainnya tidak ikut.')}
function dalSimpanUM(){return dalSimpan('M')}
function dalSimpan(jn){if(V.dlb)return;const kel=jn=='K',j=Math.round(+$('#dj').value||0),ket=$('#dk').value.trim(),dal=$('#dd').value;
 if(!(j>0))return toast('Isi jumlah uang (angka lebih dari 0).');if(!ket)return toast(kel?'Isi keterangan, mis. Belanja ayam 10 kg.':'Isi keterangan, mis. Modal awal.');
 V.dlb=1;post({act:kel?'uk_add':'um_add',tgl:$('#dt').value,dal,ket,jml:j,cara:$('#dc').value}).then(r=>{if(r&&r.ok){toast((kel?'Uang keluar ':'Uang masuk ')+rp(j)+' tercatat.');V.dlcara=$('#dc').value;V[kel?'dldalk':'dldal']=dal;dalSegar()}else toast((r&&r.err)||'Gagal mencatat.')}).catch(()=>toast('Tidak ada koneksi. Belum tercatat, coba lagi.')).then(()=>{V.dlb=0;draw()})}
function dalHapusUM(i){return dalHapus('M',i)}
function dalHapus(jn,i){const kel=jn=='K',x=((V[kel?'dlk':'dlu']||{}).l||[])[i];if(!x||!confirm('Hapus catatan uang '+(kel?'keluar':'masuk')+' ini?\n'+x.dal+' '+rp(x.j)+'\n'+x.ket))return;
 post({act:kel?'uk_hapus':'um_hapus',row:x.row,t:x.t,ket:x.ket,j:x.j}).then(r=>{if(r&&r.ok){toast('Dihapus.');dalSegar()}else toast((r&&r.err)||'Gagal menghapus.')}).catch(()=>toast('Tidak ada koneksi.'))}
function dalTambah(){const n=(prompt('Nama dana alokasi baru (mis. Hadiah pelanggan)')||'').trim();if(!n)return;
 const u=(prompt('Untuk apa? Ketik: Masuk, Keluar, atau Keduanya','Keduanya')||'').trim();
 post({act:'da_tambah',nama:n,untuk:/^masuk$/i.test(u)?'Masuk':/^keluar$/i.test(u)?'Keluar':'Keduanya'}).then(r=>{if(r&&r.ok){toast('Dana alokasi "'+n+'" ditambahkan.');V.dld=null;V.dlu=null;V.dlk=null;V.bia=null;draw()}else toast((r&&r.err)||'Gagal menambah.')}).catch(()=>toast('Tidak ada koneksi.'))}
function dalKotak(j,l,w){return`<div style="flex:1;min-width:96px;padding:8px;border-radius:10px;background:${w}22;text-align:center"><div class="mut" style="font-size:12px">${l}</div><b style="font-size:15px">${rp(j)}</b></div>`}
function dalLapHTML(r){
 if(!r)return'<p class="mut">Memuat…</p>';
 if(r.err)return`<p class="bad">${esc(r.err)}</p>${r.kunci?'<p class="mut">Buka kunci di Admin > Keamanan (master password), lalu muat ulang.</p>':''}<button class="btn o s" onclick="dalSegar();dalMuat(1)">Coba lagi</button>`;
 const tm=r.masuk.total,tk=r.keluar.total;
 const tb=r.alok.length?`<div class="sc"><table><tr><th>Dana alokasi</th><th>Masuk</th><th>Keluar</th><th>Saldo</th></tr>${r.alok.map(x=>`<tr><td>${esc(x.k)}${x.dar?'':' <small class="mut">(di luar daftar)</small>'}</td><td>${rp(x.m)}</td><td>${rp(x.x)}</td><td><b class="${x.sal<0?'bad':''}">${rp(x.sal)}</b></td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>${rp(tm)}</b></td><td><b>${rp(tk)}</b></td><td><b>${rp(r.selisih)}</b></td></tr></table></div>`:'<p class="mut">Belum ada pemasukan atau pengeluaran pada periode ini.</p>';
 return`<div class="row" style="gap:8px;flex-wrap:wrap">${dalKotak(tm,'Total pemasukan','#188038')}${dalKotak(tk,'Total pengeluaran','#d93025')}${dalKotak(r.selisih,'Selisih','#1a73e8')}</div>
<p class="mut" style="margin:8px 0">Hanya dari catatan Uang Masuk dan Uang Keluar dana alokasi. Penjualan dan Biaya usaha tidak ikut. Bagian CALK: tidak masuk Laba Rugi, Neraca, atau Arus Kas, dan angkanya tidak dienkripsi. Biaya dan beban ada di Laba Rugi.</p>${r.lama?`<p class="mut" style="margin:8px 0">${r.lama} biaya lama bertanda dana alokasi belum masuk CALK. Buka menu Biaya, lalu ketuk Masukkan ke CALK (atau pilih dana alokasi baru) pada biaya itu. Biayanya sendiri tetap di Laba Rugi.</p>`:''}
<b>Per dana alokasi</b>${tb}
${(r.ym=='semua'||/^\d{4}$/.test(r.ym))&&r.bln.length?`<details style="margin-top:8px"${/^\d{4}$/.test(r.ym)?' open':''}><summary><b>Per bulan (${r.bln.length} bulan)</b></summary><div class="sc"><table><tr><th>Bulan</th><th>Masuk</th><th>Keluar</th><th>Selisih</th></tr>${r.bln.map(x=>`<tr onclick="dalPilih('${x.ym}')" style="cursor:pointer"><td>${keuBulanNama(x.ym)}</td><td>${rp(x.m)}</td><td>${rp(x.x)}</td><td>${rp(x.sel)}</td></tr>`).join('')}</table></div><p class="mut">Ketuk satu bulan untuk membukanya.</p></details>`:''}`}
function dalUMHTML(){return dalCatatHTML('M')}
function dalCatatHTML(jn){const kel=jn=='K',K=kel?'dlk':'dlu';
 if(!V[K]&&!V[kel?'dlkq':'dluq'])dalMuatCatat(jn);const u=V[K],d=V.dld;
 if(!u)return'<p class="mut">Memuat…</p>';if(u.err)return`<p class="bad">${esc(u.err)}</p>`;
 const L=(d&&(kel?d.keluar:d.masuk))||(kel?u.keluar:u.masuk)||[kel?'Bahan baku':'Modal'],opt=(A,v)=>A.map(x=>`<option${x==v?' selected':''}>${esc(x)}</option>`).join('');
 return`<p class="mut">${kel?'Uang yang dipakai dari dana alokasi (belanja bahan baku, gaji, entertainment, dst.). Tidak terenkripsi dan TIDAK masuk Laba Rugi. Biaya usaha yang harus masuk pembukuan dicatat di menu Biaya.':'MODAL (pilih dana Modal), pinjaman, atau dana yang dialokasikan (bahan baku, gaji, entertainment, dst.). Penjualan TIDAK dicatat di sini: masuk otomatis dari pesanan.'}</p>
<label>Tanggal</label><input id="dt" type="date" value="${tglWIB()}" max="${tglWIB()}">
<label>Dana alokasi</label><select id="dd">${opt(L,V[kel?'dldalk':'dldal'])}</select>
<label>Keterangan</label><input id="dk" maxlength="120" placeholder="${kel?'mis. Belanja ayam dan udang 10 kg':'mis. Modal awal dari Bu Ani'}">
<label>Jumlah (Rp)</label><input id="dj" type="number" inputmode="numeric" min="1" placeholder="mis. 650000">
<label>${kel?'Dibayar lewat':'Diterima lewat'}</label><select id="dc">${opt(['Tunai','Transfer','QRIS','Lainnya'],V.dlcara)}</select>
<button class="btn" style="margin-top:10px" onclick="dalSimpan('${jn}')" ${V.dlb?'disabled':''}>${kel?'Simpan uang keluar':'Simpan uang masuk'}</button> <button class="btn o s" onclick="dalTambah()">+ Dana alokasi baru</button>
<p style="margin-top:10px"><b>Bulan ini:</b> ${rp(u.tot||0)} <span class="mut">(${u.n||0} catatan)</span></p>
${u.l.length?u.l.map((x,i)=>`<div class="row" style="padding:5px 0;border-top:1px solid #8883"><span><small class="mut">${esc(x.t)}</small> <b>${esc(x.dal)}</b><br>${esc(x.ket)}</span><span style="text-align:right"><b>${rp(x.j)}</b><br>${x.dr?'<small class="mut">dari Biaya</small>':`<button class="btn o s" onclick="dalHapus('${jn}',${i})">Hapus</button>`}</span></div>`).join(''):`<p class="mut">Belum ada uang ${kel?'keluar':'masuk'} yang dicatat.</p>`}`}

/* v62: Rekap HARIAN per dana alokasi: uang masuk dan keluar per tanggal, total bulan itu, saldo awal dan akhir. Server: da_harian. */
function dalHYm(){return V.dlhm||tglWIB().slice(0,7)}
function dalHMuat(force){const ym=dalHYm(),dal=V.dlhd||'',k=ym+'|'+dal;V.dlh=V.dlh||{};if(V.dlhq||(V.dlh[k]&&!force))return;V.dlhq=1;
 post({act:'da_harian',ym,dal}).then(r=>{V.dlh[k]=(r&&r.ok)?r:{err:(r&&r.err)||'Gagal memuat rekap harian.',kunci:!!(r&&r.terkunci)}}).catch(()=>{V.dlh[k]={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V.dlhq=0;if(V.tab=='dal')draw()})}
function dalHRef(){return(V.dlh||{})[dalHYm()+'|'+(V.dlhd||'')]}
function dalHBulan(v){V.dlhm=v;draw();dalHMuat()}
function dalHDana(v){V.dlhd=v;draw();dalHMuat()}
function dalHBaris(r){const L=[['Tanggal','Dana alokasi','Masuk (Rp)','Keluar (Rp)']];r.alok.forEach(q=>q.h.forEach(h=>L.push([h.d,q.k,h.m,h.x])));return L}
function dalHCsv(){const r=dalHRef();if(!r||!r.ok)return toast('Tidak ada rekap untuk diunduh.');
 const L=[['REKAP HARIAN DANA ALOKASI',NM()],['Bulan',keuBulanNama(r.ym)],['Dana alokasi',r.dal||'Semua'],['Total masuk',r.masuk],['Total keluar',r.keluar],['Selisih',r.selisih],[],['Dana alokasi','Saldo awal','Masuk','Keluar','Saldo akhir']].concat(r.alok.map(q=>[q.k,q.awal,q.m,q.x,q.akhir]),[[],['RINCIAN HARIAN']],dalHBaris(r));
 dalUnduh(new Blob(['\ufeff'+L.map(l=>l.map(dalCsvSel).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'dana-alokasi-harian_'+r.ym+'.csv')}
function dalHXlsx(){const r=dalHRef();if(!r||!r.ok)return toast('Tidak ada rekap untuk diunduh.');if(typeof xlsxBuild!='function')return toast('Penulis Excel belum dimuat. Muat ulang aplikasi.');
 const h=c=>({v:c,s:1}),m=v=>({v,s:2});
 const R1=[[h('Dana alokasi'),h('Saldo awal'),h('Masuk'),h('Keluar'),h('Saldo akhir')]].concat(r.alok.map(q=>[q.k,m(q.awal),m(q.m),m(q.x),m(q.akhir)])).concat([[{v:'Total',s:4},'',{v:r.masuk,s:5},{v:r.keluar,s:5},{v:r.selisih,s:5}]]);
 const R2=[[h('Tanggal'),h('Dana alokasi'),h('Masuk'),h('Keluar')]].concat(dalHBaris(r).slice(1).map(x=>[{v:xdate(x[0]),s:3},x[1],m(x[2]),m(x[3])]));
 const R3=[[h('Tanggal'),h('Masuk (semua dana)'),h('Keluar (semua dana)')]].concat(r.tgl.map(x=>[{v:xdate(x.d),s:3},m(x.m),m(x.x)]));
 dalUnduh(new Blob(xlsxBuild([{n:'Per Dana Alokasi',r:R1,w:[30,16,16,16,16]},{n:'Rincian Harian',r:R2,w:[12,30,16,16],f:1},{n:'Total Harian',r:R3,w:[12,20,20],f:1}]),{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'dana-alokasi-harian_'+r.ym+'.xlsx')}
function dalHariHTML(){
 const ym=dalHYm(),r=dalHRef();if(!r&&!V.dlhq)dalHMuat();
 const bl=keuBulan24().slice(0,36);if(bl.indexOf(ym)<0)bl.unshift(ym);
 const dn=(r&&r.ok&&r.daftar)||[],dsel=V.dlhd||'';
 const sel=`<select onchange="dalHBulan(this.value)">${bl.map(b=>`<option value="${b}"${b==ym?' selected':''}>${keuBulanNama(b)}</option>`).join('')}</select> <select onchange="dalHDana(this.value)"><option value="">Semua dana alokasi</option>${dn.map(x=>`<option${x==dsel?' selected':''}>${esc(x)}</option>`).join('')}</select>`;
 let isi;
 if(!r)isi='<p class="mut">Memuat…</p>';
 else if(r.err)isi=`<p class="bad">${esc(r.err)}</p><button class="btn o s" onclick="dalHMuat(1)">Coba lagi</button>`;
 else if(!r.alok.length)isi='<p class="mut">Belum ada uang masuk atau keluar pada bulan ini.</p>';
 else isi=`<div class="row" style="gap:8px;flex-wrap:wrap">${dalKotak(r.masuk,'Masuk bulan ini','#188038')}${dalKotak(r.keluar,'Keluar bulan ini','#d93025')}${dalKotak(r.selisih,'Selisih','#1a73e8')}</div>`+
  r.alok.map(q=>`<details style="margin-top:8px"><summary><b>${esc(q.k)}</b> <span class="mut">masuk ${rp(q.m)} · keluar ${rp(q.x)} · saldo akhir <b class="${q.akhir<0?'bad':''}">${rp(q.akhir)}</b></span></summary>
<div class="sc"><table><tr><th>Tanggal</th><th>Masuk</th><th>Keluar</th></tr>${q.awal?`<tr><td><small class="mut">Saldo awal bulan</small></td><td colspan="2">${rp(q.awal)}</td></tr>`:''}${q.h.map(h=>`<tr><td>${esc(h.d)}</td><td>${h.m?rp(h.m):'-'}</td><td>${h.x?rp(h.x):'-'}</td></tr>`).join('')}<tr><td><b>Total bulan ini</b></td><td><b>${rp(q.m)}</b></td><td><b>${rp(q.x)}</b></td></tr></table></div></details>`).join('')+
  (r.alok.length>1&&r.tgl.length?`<details style="margin-top:8px"><summary><b>Total semua dana per tanggal</b></summary><div class="sc"><table><tr><th>Tanggal</th><th>Masuk</th><th>Keluar</th></tr>${r.tgl.map(x=>`<tr><td>${esc(x.d)}</td><td>${x.m?rp(x.m):'-'}</td><td>${x.x?rp(x.x):'-'}</td></tr>`).join('')}</table></div></details>`:'');
 const ok=r&&r.ok;
 return`<div class="row"><b>Rekap harian per dana alokasi</b></div><div style="margin:6px 0">${sel}</div><div style="margin:6px 0"><button class="btn o s" ${ok?'':'disabled'} onclick="dalHCsv()">Unduh CSV</button> <button class="btn o s" ${ok?'':'disabled'} onclick="dalHXlsx()">Unduh Excel</button> <button class="btn o s" onclick="dalHMuat(1)">Segarkan</button></div>${isi}`}
/* v63: tampilan cashflow ala aplikasi bank: pilih bulan, donut per dana alokasi, geser/ketuk panah untuk Pemasukan, Pengeluaran, Saldo, tombol mata untuk menyembunyikan angka. */
const DAL_WARNA=['#2bb98c','#f5a30b','#1a73e8','#d93025','#7b1fa2','#00acc1','#e8710a','#5f6368','#d81b60','#7cb342','#3949ab','#8d6e63'];
const DAL_SLIDE=[{k:'m',t:'Pemasukan',j:'Total Pemasukan'},{k:'x',t:'Pengeluaran',j:'Total Pengeluaran'},{k:'s',t:'Saldo',j:'Total Saldo'}];
function dalMata(v){return'IDR '+Math.round(+v||0).toLocaleString('id-ID')}
function dalIkonMata(tampil){const g=tampil?'<path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/>':'<path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>';return`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;margin:0 auto">${g}</svg>`}
function dalEyeOn(){try{return localStorage.getItem('dm_dal_eye')=='1'}catch(e){return!!V.dleye}}
function dalEye(){const n=!dalEyeOn();try{localStorage.setItem('dm_dal_eye',n?'1':'0')}catch(e){V.dleye=n}draw()}
function dalSlide(n){V.dls=((+V.dls||0)+n+3)%3;draw()}
function dalTs(e){try{V.dlx=e.changedTouches[0].clientX}catch(x){V.dlx=null}}
function dalTe(e){if(V.dlx==null)return;let d=0;try{d=e.changedTouches[0].clientX-V.dlx}catch(x){}V.dlx=null;if(Math.abs(d)>50)dalSlide(d<0?1:-1)}
function dalDet(){V.dldet=!V.dldet;draw()}
function dalForm(jn){V.dlform=jn;draw()}
function dalWarnaMap(r){const m={};(r.alok||[]).forEach((x,i)=>m[x.k]=DAL_WARNA[i%DAL_WARNA.length]);return m}
function dalItem(r,k){return(r.alok||[]).map(x=>({k:x.k,v:k=='m'?x.m:k=='x'?x.x:x.sal})).filter(x=>x.v!==0)}
function dalDonut(its,warna){
 const R=80,C=2*Math.PI*R,pos=its.filter(x=>x.v>0),tot=pos.reduce((a,x)=>a+x.v,0);let seg='',off=0;
 if(tot>0)pos.forEach(x=>{const len=x.v/tot*C,gap=pos.length>1?Math.min(3,len*.4):0;
  seg+=`<circle class="dseg" cx="110" cy="110" r="${R}" fill="none" stroke="${warna[x.k]}" stroke-width="26" stroke-dasharray="${Math.max(len-gap,.5).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 110 110)"><title>${esc(x.k)}</title></circle>`;off+=len});
 return`<svg viewBox="0 0 220 220" width="100%" role="img" aria-label="Diagram per dana alokasi"><circle cx="110" cy="110" r="${R}" fill="none" style="stroke:var(--line)" stroke-width="26"${tot>0?' opacity="0"':''}/>${seg}</svg>`}
function dalBaris2(r,sl,warna,tampil){
 const its=dalItem(r,sl.k).sort((a,b)=>b.v-a.v),tot=its.filter(x=>x.v>0).reduce((a,x)=>a+x.v,0);
 return its.length?its.map(x=>`<div class="row" style="padding:7px 0;border-top:1px solid #8883"><span><i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${warna[x.k]};margin-right:8px"></i>${esc(x.k)}</span><span style="text-align:right"><b class="${x.v<0?'bad':''}">${tampil?rp(x.v):'••••••'}</b>${x.v>0&&tot?` <small class="mut">${(x.v/tot*100).toFixed(1).replace('.',',')}%</small>`:''}</span></div>`).join(''):'<p class="mut">Belum ada catatan pada periode ini.</p>'}
function dalKartu(r){
 const sl=DAL_SLIDE[(+V.dls||0)%3],warna=dalWarnaMap(r),its=dalItem(r,sl.k),tampil=dalEyeOn(),
  tot=sl.k=='m'?r.masuk.total:sl.k=='x'?r.keluar.total:r.selisih,neg=its.some(x=>x.v<0);
 const dots=DAL_SLIDE.map((z,i)=>`<i class="dot" style="display:inline-block;width:${i==(+V.dls||0)%3?12:9}px;height:${i==(+V.dls||0)%3?12:9}px;border-radius:50%;background:${i==(+V.dls||0)%3?'var(--acc)':'var(--line)'};margin:0 4px" title="${z.t}"></i>`).join('');
 const pan=(a,t)=>`<button onclick="dalSlide(${a})" aria-label="${t}" style="width:52px;height:52px;border-radius:50%;border:1px solid var(--line);background:var(--soft);color:var(--acc);font-size:26px;line-height:1;cursor:pointer">${a<0?'‹':'›'}</button>`;
 return`<div ontouchstart="dalTs(event)" ontouchend="dalTe(event)" style="touch-action:pan-y">
<div class="mut" style="text-align:center;font-size:12px;margin-top:6px">CALK · Catatan atas Laporan Keuangan: arus kas alokasi dana</div>
<div style="text-align:center;font-weight:700;margin:4px 0 2px">${sl.t}</div>
<div style="position:relative;width:min(62vw,250px);margin:6px auto">${dalDonut(its,warna)}
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24%"><div class="mut" style="font-size:15px;line-height:1.25">${sl.j.replace(' ','<br>')}</div><b style="font-size:clamp(12px,4vw,16px);margin:6px 0 8px;white-space:nowrap">${tampil?dalMata(tot):'IDR ******'}</b><button class="btn o s" onclick="dalEye()" aria-label="${tampil?'Sembunyikan jumlah':'Tampilkan jumlah'}" style="padding:4px 12px;min-width:46px">${dalIkonMata(tampil)}</button></div></div>
<div style="display:flex;justify-content:center;align-items:center;gap:6px;margin:8px 0">${pan(-1,'Sebelumnya')}<span>${dots}</span>${pan(1,'Berikutnya')}</div>
${its.length?`<div style="display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;margin:6px 0">${its.map(x=>`<span style="font-size:13px"><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${warna[x.k]};margin-right:5px"></i>${esc(x.k)}</span>`).join('')}</div>`:'<p class="mut" style="text-align:center">Belum ada catatan uang masuk atau keluar pada periode ini.</p>'}
${neg?'<p class="mut" style="text-align:center;margin:4px 0">Dana yang saldonya minus tidak digambar di diagram; lihat Detail.</p>':''}</div>
<p style="text-align:center;margin:10px 0 2px"><a onclick="dalDet()" style="color:var(--acc);font-weight:600;cursor:pointer;font-size:17px">${V.dldet?'Tutup Detail Cashflow':'Lihat Detail Cashflow'}</a></p>`}
function aDal(){
 if(!gk())return'<div class="box">Belum tersambung ke Google Sheet. Buka tab Pengaturan, tempel Kunci sinkron, lalu kembali ke sini.</div>';
 const ym=dalYm(),r=dalRef();if(!r&&!V.dlq)dalMuat();
 const bl=(r&&r.bulan&&r.bulan.length?r.bulan:keuBulan24()).slice(0,36);if(/^\d{4}-\d{2}$/.test(ym)&&bl.indexOf(ym)<0)bl.unshift(ym);
 const sel=`<select id="dlbln" onchange="dalPilih(this.value)" style="width:100%;font-size:18px;padding:12px 14px;border-radius:10px"><option value="semua"${ym=='semua'?' selected':''}>Semua bulan</option>${dalTahunList(bl,ym).map(y=>`<option value="${y}"${y==ym?' selected':''}>Tahun ${y}</option>`).join('')}${bl.map(b=>`<option value="${b}"${b==ym?' selected':''}>${keuBulanNama(b)}</option>`).join('')}</select>`;
 const ok=r&&r.ok,warna=ok?dalWarnaMap(r):{},sl=DAL_SLIDE[(+V.dls||0)%3],tampil=dalEyeOn();
 const kartu=!r?'<p class="mut">Memuat…</p>':r.err?`<p class="bad">${esc(r.err)}</p><button class="btn o s" onclick="dalSegar();dalMuat(1)">Coba lagi</button>`:dalKartu(r);
 const detail=(V.dldet&&ok)?`<div class="box"><b>Detail Cashflow · ${sl.t}</b><div style="margin:6px 0">${dalBaris2(r,sl,warna,tampil)}</div></div>
<div class="box"><div class="row"><b>Laporan Dana Alokasi</b></div>
<div style="margin:8px 0"><button class="btn o s" onclick="salinTeks(dalTeks(),'Laporan disalin.')">Salin</button> <button class="btn o s" onclick="dalCsv()">Unduh CSV</button> <button class="btn o s" onclick="dalXlsx()">Unduh Excel</button> <button class="btn o s" onclick="dalSegar();dalMuat(1)">Segarkan</button></div>
${dalLapHTML(r)}</div>
<div class="box">${dalHariHTML()}</div>`:'';
 const jn=V.dlform=='K'?'K':'M';
 return`<div class="box">${sel}${kartu}</div>${detail}
<div class="box"><b>Catat arus kas masuk / keluar (CALK)</b><div style="display:flex;gap:8px;margin:8px 0"><div class="chip ${jn=='M'?'on':''}" onclick="dalForm('M')">Uang masuk</div><div class="chip ${jn=='K'?'on':''}" onclick="dalForm('K')">Uang keluar</div></div>${dalCatatHTML(jn)}</div>
<div class="box"><p class="mut">Halaman ini adalah CALK (Catatan atas Laporan Keuangan): arus kas alokasi dana, termasuk modal. Angkanya tidak dienkripsi dan tidak masuk Laba Rugi, Neraca, atau Arus Kas. Biaya dan beban tetap dicatat di menu Biaya dan masuk Laba Rugi; biaya (lama atau baru) boleh diberi dana alokasi dari menu Biaya, lalu salinannya muncul di sini. Daftar dana alokasi juga ada di tab Dana Alokasi di Google Sheet (bisa ditambah di sana); catatannya ada di tab Uang Masuk dan Uang Keluar. Staf bisa diberi hak khusus uang masuk atau khusus uang keluar di Admin > Pengguna. Biaya usaha yang harus masuk pembukuan tetap dicatat di menu Biaya. Laporan yang sama ada di tab Laporan Dana Alokasi di Sheet (menu Perbarui Laporan Dana Alokasi).</p></div>`}
(window.__muat=window.__muat||[]).push('js/admin/danaalokasi.js');
