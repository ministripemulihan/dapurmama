/* js/toko/belanja.js */
/* v18: pembeli dengan 1 HP + kirim bukti bayar */
const satuHP=o=>`<details class="box" style="text-align:left;margin-top:12px" open><summary><b>Hanya punya 1 HP? Bayar begini</b></summary><ol style="margin:8px 0 0 18px;padding:0;line-height:1.6"><li>Tekan <b>Simpan gambar QRIS</b> di atas (gambar masuk ke galeri).</li><li>Buka aplikasi bayar Anda: m-BCA, GoPay, DANA, OVO, ShopeePay, dan sejenisnya.</li><li>Pilih <b>Scan</b>, lalu pilih <b>gambar dari galeri</b> (atau <b>Upload QRIS</b>).</li><li>Ketik nominal persis <b>${rp(o.tf)}</b>, lalu bayar.</li><li>Kembali ke halaman ini, tekan <b>Saya sudah bayar</b>.</li></ol></details>`;
const buktiBtn=inv=>S.wa?`<button class="btn o s" style="width:100%;margin-top:8px" onclick="buktiWA('${inv}')">📎 Kirim bukti bayar ke WhatsApp toko</button>`:'';
/* Pesan ulang */
/* v32: pembeli menekan "Pesanan diterima" (dikirim -> selesai). Server memeriksa pemilik pesanan (akun atau nomor WhatsApp). */
const terimaBtn=inv=>`<button class="btn g s" onclick="terimaPesanan('${esc(inv)}')">✅ Pesanan diterima</button>`;
function terimaPesanan(inv){konfirm('Tandai pesanan '+inv+' sudah Anda terima? Statusnya menjadi Selesai.',()=>{if(V.dtn)return;V.dtn=1;const o=S.o.find(x=>x.inv==inv);
 pubPost({act:'diterima',inv,wa:o?o.wa:'',tok:tk()}).then(r=>{
  if(r&&r.ok){if(o){o.status='selesai';try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}if(V.sy)V.sy.forEach(x=>{if(x.inv==inv)x.s='selesai'});toast('Terima kasih! Pesanan ditandai selesai.')}
  else toast((r&&r.err)||'Gagal. Coba lagi.')
 }).catch(()=>toast('Tidak ada koneksi. Coba lagi nanti.')).then(()=>{V.dtn=0;draw()})},'Ya, sudah diterima')}
const ulangBtn=inv=>`<button class="btn s" onclick="ulang('${esc(inv)}')">🔁 Pesan ulang</button>`;
function cart(){const L=lines();if(!L.length)return'<div class="box"><b>Keranjang kosong.</b><p class="mut">Pilih produk di beranda untuk mulai belanja.</p><button class="btn" onclick="go(\'/\')">Lihat produk</button></div>';
 const sub=L.reduce((a,l)=>a+price(l.p)*l.q,0),hem=L.reduce((a,l)=>a+(l.p.h-price(l.p))*l.q,0);
 return`${tutupBanner()}${ulNote()}${poCartNote(L)}<h2>Keranjang</h2>${L.map((l,i)=>`<div class="box row"><div><b>${l.p.e} ${l.p.n}</b><div class="mut">${l.p.t=='fashion'?l.key.replace('|',' / '):(l.po?'Makanan · Pre-order '+poFmt(l.po):'Makanan')} · ${rp(price(l.p))}</div></div><div class="row"><button class="btn o s" onclick="qty(${i},-1)">−</button><b>${l.q}</b><button class="btn o s" onclick="qty(${i},1)">+</button><button class="btn o s" onclick="S.cart.splice(${i},1);save();draw()">Hapus</button></div></div>`).join('')}<div class="box"><div class="row"><span>Subtotal</span><b>${rp(sub)}</b></div>${hem?`<div class="ok">Anda hemat ${rp(hem)}</div>`:''}<button class="btn" style="width:100%;margin-top:10px" ${tutupAktif()||!jamLines(L).ok?'disabled':''} onclick="go('/checkout')">Lanjut ke Checkout</button></div>`}
function qty(i,d){const c=S.cart[i],p=P(c.pid),n=c.q+d;if(n<1)return;if(n>(c.po?poSisa(p,c.po):avail(p,c.key)))return toast(c.po?'Kuota pre-order maksimal tercapai.':'Stok maksimal tercapai.');c.q=n;save();draw()}
function checkout(){const L=lines();if(!L.length)return cart();adrPrefill();wilPrep('co');
 return`${tutupBanner()}${poCartNote(L)}<h2>Checkout</h2>${adrCheckout()}<div class="box"><label>Nama penerima</label><input id="nm" value="${esc((me()||{}).nama||(V.pre||{}).nama||'')}"><label>Nomor WhatsApp</label><input id="wa" inputmode="tel" value="${esc((me()||{}).wa||(V.pre||{}).wa||'')}"><label>Alamat lengkap (jalan, nomor rumah, RT/RW)</label><textarea id="al" rows="2" maxlength="160">${esc((V.pre||{}).alamat||'')}</textarea><div id="wil_co">${wilHTML('co')}</div><small class="mut">Ongkir dihitung dari Surabaya.</small><label>Catatan</label><input id="ct" value="${esc((V.pre||{}).ct||'')}"></div>${adrSimpanBox()}<div class="box"><b>Kurir</b><div id="kur"></div></div>${vchBox()}<div class="box" id="sum"></div>`}
async function order(){if(tutupAktif())return toast(tutupPesan());const L=lines();{const jl=jamLines(L);if(!jl.ok)return toast(jl.pesan)}const poT=L.every(l=>l.po)?L[0].po:'';if(L.some(l=>l.po)&&(!poT||L.some(l=>l.po!=poT)||poT<=tglWIB()||!poCfg().on))return toast('Pre-order tidak valid atau tanggalnya sudah lewat. Kosongkan keranjang, lalu pesan lagi.');const v=i=>$('#'+i).value.trim(),nm=v('nm'),wa=v('wa'),al=v('al'),ps=v('ps');
 {const wc=wilCek('co');if(wc)return toast(wc)}wilSinkron();const wn=wilNama(V.w),alF=wilAlamat(al,V.w);if(alF.length>300)return toast('Alamat terlalu panjang. Persingkat bagian jalan/nomor.');
 if(!nm||!/^[0-9+]{9,15}$/.test(wa.replace(/[\s-]/g,''))||al.length<10||!/^\d{5}$/.test(ps)||!V.kota)return toast('Lengkapi nama, WhatsApp, alamat (min. 10 huruf), kota, dan kode pos 5 digit.');
 const k=kur(V.kota,L).find(x=>x.k==V.kur);if(!k)return toast('Pilih kurir dulu.');
 for(const l of L)if(l.po?l.q>poSisa(l.p,l.po):l.q>avail(l.p,l.key))return toast(l.po?l.p.n+': kuota pre-order tidak cukup lagi.':l.p.n+' stoknya tidak cukup lagi.');
 const sub=L.reduce((a,l)=>a+price(l.p)*l.q,0),vh=vchFinal(sub,k.fee),total=sub-vh.pot+k.fee-vh.ong,act=S.o.filter(o=>o.status=='menunggu'||o.status=='verifikasi').map(o=>o.tf);let kode,tf;if(vh.err)return toast(vh.err);
 do{kode=1+Math.floor(Math.random()*999);tf=total+kode}while(act.includes(tf));
 const food=L[0].p.t=='makanan',inv='INV'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+String(S.o.length+1).padStart(3,'0')+Math.random().toString(36).slice(2,5).toUpperCase();
 L.forEach(l=>{if(!l.po)l.p.v[l.key].r+=l.q});
 S.o.push({inv,t:Date.now(),exp:Date.now()+(food?15:60)*60000,nama:nm,wa,alamat:alF,jalan:al,kel:wn.kel,kec:wn.kec,prov:wn.prov,pid:V.w.pid||'',rid:V.w.rid||'',did:V.w.did||'',kota:V.kota,pos:ps,cat:v('ct'),kurir:k.k,ongkir:k.fee,sub,total,kode,tf,vk:vh.kode,pot:vh.pot,ong:vh.ong,food,status:'menunggu',resi:'',po:poT,items:L.map(l=>({pid:l.pid,key:l.key,n:l.p.n,q:l.q,hn:l.p.h,hd:price(l.p)}))});
 const bak=S.cart.slice();S.cart=[];save();const ob=S.o[S.o.length-1],u=S.api||API_URL;
 if(u){toast('Mengirim pesanan ke toko...');let r=null;
  try{const {status,resi,...full}=ob;r=await fetch(u,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({act:'order',o:full,tok:tk()})}).then(x=>x.json())}catch(e){}
  if(!r||!r.ok){rel(ob);S.o.pop();S.cart=bak;save();draw();return toast(r?'Pesanan ditolak: '+(r.err||'coba lagi'):'Tidak bisa terhubung ke toko. Cek internet lalu coba lagi.')}}
 try{adrSetelahOrder(ob)}catch(e){}V.vk=null;V.pre=null;V.ulNote=null;V.adrAuto=null;go('/bayar/'+inv)}
function pay(inv){const o=S.o.find(x=>x.inv==inv);if(!o)return'<div class="box">Pesanan tidak ditemukan.</div>';
 const head=`<h2>${o.inv}</h2><span class="st">${ST[o.status]}</span>${poTag(o)}${o.vk?`<div class="ok">Kode promo ${esc(o.vk)}: hemat ${rp((o.pot||0)+(o.ong||0))}</div>`:''}`;
 if(o.status=='menunggu')return`${head}<div class="box" style="text-align:center">${qrimg()}<div class="mut">Transfer tepat sejumlah</div><div class="big">${rp(o.tf)}</div><button class="btn o s" onclick="navigator.clipboard&&navigator.clipboard.writeText('${o.tf}').then(()=>toast('Nominal disalin'))">Salin nominal</button><p class="mut">Scan QRIS BCA, ketik nominal persis ${rp(o.tf)} (termasuk kode unik ${o.kode}). Bayar sebelum ${hm(o.exp)}.</p>${qrShare(o.inv)}${satuHP(o)}<button class="btn" style="width:100%;margin-top:12px" onclick="verif('${o.inv}')">Saya sudah bayar</button>${buktiBtn(o.inv)}</div>`;
 if(o.status=='verifikasi')return`${head}<div class="box">Terima kasih. Penjual sedang mengecek pembayaran Anda. Halaman ini diperbarui otomatis.${buktiBtn(o.inv)}</div>`;
 if(PAID.includes(o.status))return`${head}<div class="box"><b class="ok">Pembayaran berhasil.</b> ${o.status=='dikirim'?'Pesanan Anda sedang dalam perjalanan.':o.status=='selesai'?'Pesanan selesai. Terima kasih sudah berbelanja!':'Pesanan Anda sedang diproses oleh penjual.'}${langkahBar(o.status)}<p><button class="btn o s" onclick="printInv('${o.inv}')">Cetak invoice</button> <button class="btn o s" onclick="printStruk('${o.inv}')">Struk 4 cm</button> ${o.status=='dikirim'&&o.src!='kasir'?terimaBtn(o.inv)+' ':''}${ulangBtn(o.inv)}</p></div>${lacakBox(o)}`;
 return`${head}<div class="box">Pesanan ini ${ST[o.status].toLowerCase()}. Silakan buat pesanan baru.<p>${ulangBtn(o.inv)}</p></div>`}
function verif(inv){const o=S.o.find(x=>x.inv==inv);if(o&&o.status=='menunggu'){o.status='verifikasi';save();const u=S.api||API_URL;if(u)fetch(u,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({act:'bayar',inv})}).then(r=>r.json()).then(r=>{if(!r.ok)toast('Konfirmasi belum sampai ke toko. Hubungi penjual via WhatsApp.')}).catch(()=>toast('Konfirmasi belum sampai ke toko. Cek internet.'))}draw()}
function cek(){return`<h2>Cek pesanan</h2><div class="box"><label>Nomor invoice</label><input id="ci"><button class="btn" style="margin-top:10px" onclick="go('/bayar/'+$('#ci').value.trim())">Cek status</button></div>`}
function items(o){return o.items.map(i=>`${i.n}${i.key=='porsi'?'':' ('+i.key.replace('|','/')+')'} ×${i.q}`).join(', ')}
function buktiWA(inv){const o=S.o.find(x=>x.inv==inv),n=waNo(S.wa||'');if(n.length<9)return toast('Nomor WhatsApp toko belum diisi.');open('https://wa.me/'+n+'?text='+encodeURIComponent('Halo '+NM()+', saya sudah bayar.\nInvoice: '+inv+'\nNominal: '+rp(o?o.tf:0)+'\nNama: '+(o?o.nama:'')+'\n(Foto bukti bayar saya lampirkan di chat ini.)'))}
function ulangSrc(inv){
 const lo=S.o.find(x=>x.inv==inv);
 if(lo&&lo.items&&lo.items.length)return{items:lo.items.map(i=>({pid:i.pid,key:i.key,q:i.q,n:i.n,hd:i.hd})),pre:{nama:lo.nama,wa:lo.wa,alamat:lo.jalan||lo.alamat,kota:lo.kota,pos:lo.pos,pid:lo.pid,rid:lo.rid,did:lo.did,kel:lo.kel}};
 const so=(V.sy||[]).find(x=>x.inv==inv);
 if(so&&so.it&&so.it.length)return{items:so.it,pre:{alamat:so.a,kota:so.kt,pos:so.ps}};
 return null}
function ulang(inv){
 if(tutupAktif())return toast(tutupPesan());
 const src=ulangSrc(inv);if(!src)return toast('Isi pesanan ini belum bisa dibaca. Muat ulang riwayat, atau hubungi toko lewat WhatsApp.');
 const ok=[],habis=[],kurang=[];let harga=0;
 src.items.forEach(i=>{const p=P(i.pid),lbl=(p?p.n:(i.n||'Barang'))+(i.key&&i.key!='porsi'?' ('+String(i.key).replace('|','/')+')':'');
  if(!p||!p.v||!p.v[i.key])return habis.push(lbl+' (sudah tidak dijual)');
  if(p.t!='fashion'&&!jamStatus(true).ok&&!poOk(p))return habis.push(lbl+' (di luar jam pesan makanan)');
  if(poOk(p)){const d=poTgl(),sp=poSisa(p,d)-((S.cart.find(c=>c.pid==i.pid&&c.key==i.key&&c.po==d)||{q:0}).q);if(sp<=0)return habis.push(lbl+' (kuota pre-order '+poFmt(d)+' penuh)');const q=Math.min(i.q,sp);if(q<i.q)kurang.push(lbl+' (pre-order): minta '+i.q+', kuota tersisa '+sp);if(i.hd&&i.hd!=price(p))harga=1;return ok.push({pid:i.pid,key:i.key,q,po:d})}
  const have=(S.cart.find(c=>c.pid==i.pid&&c.key==i.key)||{q:0}).q,sisa=avail(p,i.key)-have;
  if(sisa<=0)return habis.push(lbl+(p.t=='makanan'?' (habis hari ini)':' (stok habis)'));
  const q=Math.min(i.q,sisa);if(q<i.q)kurang.push(lbl+': minta '+i.q+', tersedia '+sisa);
  if(i.hd&&i.hd!=price(p))harga=1;ok.push({pid:i.pid,key:i.key,q})});
 if(ok.some(i=>i.po)&&ok.some(i=>!i.po)){for(let k=ok.length-1;k>=0;k--)if(ok[k].po){habis.push((P(ok[k].pid).n)+' (pre-order dipesan terpisah, karena keranjang tidak boleh campur pesanan hari ini dan pre-order)');ok.splice(k,1)}}
 if(!ok.length)return toast('Semua barang di pesanan ini sedang habis atau sudah tidak dijual.');
 const t=P(ok[0].pid).t,isi=()=>{ok.forEach(i=>{const ex=S.cart.find(c=>c.pid==i.pid&&c.key==i.key&&(c.po||'')==(i.po||''));if(ex)ex.q+=i.q;else S.cart.push(i.po?{pid:i.pid,key:i.key,q:i.q,po:i.po}:{pid:i.pid,key:i.key,q:i.q})});
  const pr=src.pre||null;V.pre=pr&&pr.alamat?pr:null;if(V.pre)wilDariPre(V.pre);
  V.ulNote={n:ok.length,habis,kurang,harga,alamat:!!(V.pre&&V.pre.alamat)};V.open=null;save();go('/keranjang');draw()};
 if(S.cart.length&&(P(S.cart[0].pid).t!=t||(S.cart[0].po||'')!=(ok[0].po||'')))konfirm('Keranjang Anda berisi '+(P(S.cart[0].pid).t!=t?(t=='fashion'?'makanan':'fashion'):(ok[0].po?'pesanan untuk hari ini':'pre-order'))+'. Kosongkan keranjang lalu masukkan pesanan lama ini?',()=>{S.cart=[];isi()},'Ya, ganti isi keranjang');
 else isi()}
function ulNote(){const n=V.ulNote;if(!n)return'';const L=[];
 if(n.habis.length)L.push('<b>Tidak bisa dimasukkan:</b> '+n.habis.map(esc).join('; '));
 if(n.kurang.length)L.push('<b>Jumlah dikurangi mengikuti stok:</b> '+n.kurang.map(esc).join('; '));
 if(n.harga)L.push('Harga mengikuti harga hari ini (ada yang berubah sejak pesanan lama).');
 return`<div class="box" style="border-color:var(--ok)"><div class="row"><b>🔁 ${n.n} barang dari pesanan lama masuk keranjang</b><button class="btn o s" onclick="V.ulNote=null;draw()">Tutup</button></div>${L.map(x=>`<div class="mut">${x}</div>`).join('')}<div class="mut">Periksa jumlahnya, lalu lanjut ke Checkout.${n.alamat?' Alamat pesanan lama akan terisi otomatis.':''}</div></div>`}
(window.__muat=window.__muat||[]).push('js/toko/belanja.js');
