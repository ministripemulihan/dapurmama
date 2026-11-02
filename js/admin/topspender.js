/* js/admin/topspender.js : v64 laporan TOP SPENDER (pelanggan dengan belanja terbesar). Menggabungkan pesanan online yang sudah dibayar dan pesanan offline
   (kasir/Pesanan Offline, tanpa yang dibatalkan). Pelanggan yang sama digabung lewat nomor WhatsApp, bila tidak ada lewat nama. Periode: bulan ini, tahun ini,
   semua, satu bulan, atau satu tahun. Hanya membaca data di aplikasi penjual (Administrator dan Owner); tidak ada pengiriman ke server. */
function tsData(){const A=[];
 (S.o||[]).filter(o=>PAID.includes(o.status)).forEach(o=>{const t=ds(new Date(o.paid||o.t)),w=waNum(o.wa);A.push({d:t,nama:String(o.nama||'').trim()||'(tanpa nama)',wa:w,j:+o.total||+o.tf||+o.sub||0,on:1})});
 OF().filter(o=>o.st!='batal').forEach(o=>{const p=plOf(o.pel);A.push({d:String(o.tgl||'').slice(0,10),nama:String(p.nama||o.nama||'').trim()||'(tanpa nama)',wa:waNum(p.wa||o.wa),j:oT(o),on:0})});
 return A.filter(a=>/^\d{4}-\d{2}-\d{2}$/.test(a.d)&&a.j>0)}
function tsPer(){return V.tsp||'tahun'}
function tsRange(p){const h=hari();if(p=='bulan')return[h.slice(0,7)];if(p=='tahun')return[h.slice(0,4)];if(p=='semua')return[''];return[p]}
function tsNama(p){const h=hari();if(p=='bulan')return'Bulan ini ('+keuBulanNama(h.slice(0,7))+')';if(p=='tahun')return'Tahun ini ('+h.slice(0,4)+')';if(p=='semua')return'Semua waktu';return/^\d{4}$/.test(p)?'Tahun '+p:keuBulanNama(p)}
function tsHitung(){const p=tsPer(),pre=tsRange(p)[0],G={};
 tsData().filter(a=>!pre||a.d.slice(0,pre.length)==pre).forEach(a=>{const k=a.wa||('n:'+a.nama.toLowerCase()),g=G[k]||(G[k]={nama:a.nama,wa:a.wa,j:0,n:0,on:0,off:0,last:'',max:0});
  g.j+=a.j;g.n++;if(a.on)g.on+=a.j;else g.off+=a.j;if(a.d>g.last)g.last=a.d;if(a.j>g.max)g.max=a.j;if(a.nama.length>g.nama.length&&g.nama=='(tanpa nama)')g.nama=a.nama});
 const L=Object.keys(G).map(k=>G[k]).sort((a,b)=>b.j-a.j||b.n-a.n),tot=L.reduce((a,x)=>a+x.j,0);return{p,L,tot,N:L.length}}
function tsOpsi(){const T={},B={};tsData().forEach(a=>{T[a.d.slice(0,4)]=1;B[a.d.slice(0,7)]=1});T[hari().slice(0,4)]=1;
 const th=Object.keys(T).sort().reverse(),bl=Object.keys(B).sort().reverse(),p=tsPer(),o=(v,t)=>`<option value="${v}"${v==p?' selected':''}>${t}</option>`;
 return o('bulan','Bulan ini')+o('tahun','Tahun ini')+o('semua','Semua waktu')+`<optgroup label="Per tahun">${th.map(y=>o(y,'Tahun '+y)).join('')}</optgroup><optgroup label="Per bulan">${bl.map(b=>o(b,keuBulanNama(b))).join('')}</optgroup>`}
function tsTop(){return+V.tsn||10}
function tsTeks(){const d=tsHitung(),T=d.L.slice(0,tsTop());
 return'TOP SPENDER '+NM()+'\nPeriode: '+tsNama(d.p)+'\nTotal belanja semua pelanggan: '+rp(d.tot)+' ('+d.N+' pelanggan)\n\n'+T.map((x,i)=>(i+1)+'. '+x.nama+': '+rp(x.j)+' ('+x.n+' pesanan)').join('\n')}
function tsCsv(){const d=tsHitung(),L=[['TOP SPENDER',NM()],['Periode',tsNama(d.p)],['Total belanja semua pelanggan',d.tot],['Jumlah pelanggan',d.N],[],['Peringkat','Nama','WhatsApp','Pesanan','Total belanja','Online','Offline','Pesanan terbesar','Terakhir belanja']].concat(d.L.slice(0,tsTop()).map((x,i)=>[i+1,x.nama,x.wa,x.n,x.j,x.on,x.off,x.max,x.last]));
 if(typeof dalUnduh!='function'||typeof dalCsvSel!='function')return toast('Fitur unduh belum siap.');
 dalUnduh(new Blob(['\ufeff'+L.map(l=>l.map(dalCsvSel).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'top-spender_'+(d.p=='semua'?'semua':d.p)+'.csv')}
function tsWA(w){if(!w)return;window.open('https://wa.me/'+w+'?text='+encodeURIComponent('Halo, terima kasih sudah menjadi pelanggan setia '+NM()+'!'),'_blank')}
function aTops(){const d=tsHitung(),T=d.L.slice(0,tsTop()),mx=T.length?T[0].j:1,N=[10,20,50];
 return`<div class="box"><div class="row"><b>Top Spender</b><span><button class="btn o s" onclick="salinTeks(tsTeks(),'Daftar disalin.')">Salin</button> <button class="btn o s" onclick="tsCsv()">Unduh CSV</button></span></div>
<p class="mut">Pelanggan dengan belanja terbesar (pesanan online yang sudah dibayar + pesanan offline, tanpa yang dibatalkan).</p>
<select onchange="V.tsp=this.value;draw()" style="width:100%;font-size:17px;padding:10px 12px;border-radius:10px">${tsOpsi()}</select>
<div class="chips" style="margin-top:8px">${N.map(n=>`<div class="chip ${tsTop()==n?'on':''}" onclick="V.tsn=${n};draw()">Top ${n}</div>`).join('')}</div>
<div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><div style="flex:1;min-width:120px;padding:8px;border-radius:10px;background:#1a8fe322;text-align:center"><div class="mut" style="font-size:12px">Total belanja</div><b>${rp(d.tot)}</b></div><div style="flex:1;min-width:120px;padding:8px;border-radius:10px;background:#1a8fe311;text-align:center"><div class="mut" style="font-size:12px">${tsNama(d.p)}</div><b>${d.N} pelanggan</b></div></div></div>`+
 (T.length?T.map((x,i)=>`<div class="box"><div class="row"><span><b>${i+1}. ${esc(x.nama)}</b>${i<3?' '+['🥇','🥈','🥉'][i]:''}<br><small class="mut">${x.n} pesanan · terakhir ${esc(x.last)}${x.on&&x.off?' · online '+rp(x.on)+' + offline '+rp(x.off):x.on?' · online':' · offline'}</small></span><b>${rp(x.j)}</b></div>
<div style="height:6px;border-radius:4px;background:var(--line,#8883);margin:6px 0"><div style="height:6px;border-radius:4px;background:var(--acc,#1a8fe3);width:${Math.max(3,Math.round(x.j/mx*100))}%"></div></div>${x.wa?`<button class="btn o s" onclick="tsWA('${x.wa}')">Ucapkan terima kasih (WhatsApp)</button>`:'<small class="mut">Nomor WhatsApp belum ada</small>'}</div>`).join(''):'<div class="box"><p class="mut">Belum ada belanja pada periode ini.</p></div>')}
(window.__muat=window.__muat||[]).push('js/admin/topspender.js');
