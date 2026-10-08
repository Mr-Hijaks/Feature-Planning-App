
/* Haunted Zoo Studio: additive catalog and device-local artwork import.
   Published metadata lives in /data/drafts.json and the embedded sticker catalog.
   No credentials or private files are transmitted by the browser. */
(() => {
  'use strict';
  const nativeRender = render;
  const nativeFilter = filter;
  let draftsVisible = new URLSearchParams(location.search).get('drafts') === '1';
  const input = document.getElementById('art-import');
  const status = document.getElementById('import-status');
  const draftsButton = document.getElementById('drafts');
  const dbName = 'haunted-zoo-media-v1';

  const normalize = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mediaPath = x => x.sourceFilename || x.imageFile || '';
  const mediaId = x => x.id;

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('files');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function writeMedia(key, blob) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').put(blob, key);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }
  async function readMedia(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const request = tx.objectStore('files').get(key);
      request.onsuccess = () => { db.close(); resolve(request.result); };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  }
  function fallback(item) {
    const t = esc(item.title).slice(0, 65);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 350" width="700" height="350">' +
      '<rect width="700" height="350" fill="#fff"/><g stroke="#201823" fill="none" stroke-width="4">' +
      '<circle cx="350" cy="140" r="75"/><circle cx="350" cy="140" r="48"/>' +
      '<path d="M350 20v40m0 160v40M230 140h40m160 0h40M265 55l30 30m110 110 30 30m-170 0 30-30m110-110 30-30"/>' +
      '<path d="M325 135q25-34 50 0-25 34-50 0Z"/><circle cx="350" cy="135" r="7"/></g>' +
      '<text x="350" y="282" fill="#211723" font-family="Georgia,serif" font-size="24" text-anchor="middle">' + t + '</text>' +
      '<text x="350" y="317" fill="#59505e" font-family="Arial,sans-serif" letter-spacing="3" font-size="12" text-anchor="middle">ARTWORK AWAITING IMPORT</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function printImage(item) {
    if (!item._image) return;
    const doc = window.open('', '_blank');
    if (!doc) { alert('Please allow pop-ups to print artwork.'); return; }
    const format = item.kind === 'coloring' ? 'letter portrait' : '4in 2in';
    doc.document.write('<!doctype html><html><head><title>' + esc(item.title) + '</title><style>@page{size:' + format +
      ';margin:0}body{padding:0;margin:0;display:flex;align-items:center;justify-content:center;height:100vh}img{display:block;max-height:100%;max-width:100%;object-fit:contain}</style></head>' +
      '<body><img src="' + item._image + '" onload="setTimeout(()=>window.print(),150)"></body></html>');
    doc.document.close();
  }
  filter = function() { return nativeFilter().filter(x => draftsVisible ? Boolean(x.draft) : !x.draft); };
  render = function() {
    nativeRender();
    const list = filter(), gallery = document.getElementById('gallery');
    draftsButton.classList.toggle('active', draftsVisible);
    const url = new URL(location.href);
    if (draftsVisible) url.searchParams.set('drafts', '1');
    else url.searchParams.delete('drafts');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
    document.getElementById('count').textContent =
      list.length + ' ' + (draftsVisible ? 'draft record(s) — artwork unverified' : 'sticker / coloring record(s)') +
      ' • ' + DB.items.filter(x => x._image && Boolean(x.draft) === draftsVisible).length + ' image(s) imported locally';
    const visibleCategories = DB.categories;
    document.querySelectorAll('.collection').forEach((button, idx) => {
      const cat = visibleCategories[idx];
      if (!cat) return;
      const count = DB.items.filter(x => Boolean(x.draft) === draftsVisible && x.categories.includes(cat.id)).length;
      button.querySelector('span').textContent = count + ' record(s) • ' + cat.description;
    });
    list.forEach((item, i) => {
      const card = gallery.children[i]; if (!card) return;
      card.classList.toggle('coloring', item.kind === 'coloring');
      const img = card.querySelector('img.art');
      img.src = item._image || fallback(item);
      img.alt = item._image ? item.title + ' original artwork' : item.title + ' placeholder — artwork not imported';
      const body = card.querySelector('.body');
      const description = body.querySelector('.small');
      if (item.draft) description.textContent = 'Unverified draft • ' + (item.themes || []).slice(0,3).join(', ');
      if (!body.querySelector('.chips')) {
        const chips = document.createElement('div'); chips.className='chips';
        for (const tag of (item.tags || []).slice(0,3)) {
          const chip=document.createElement('span'); chip.className='chip'; chip.textContent=tag; chips.appendChild(chip);
        }
        body.insertBefore(chips,body.querySelector('.actions'));
      }
      const links = card.querySelectorAll('.actions a');
      if (links[0]) {
        links[0].removeAttribute('href');
        links[0].removeAttribute('target');
        links[0].onclick=null;
        if (item._pdf) {
          links[0].href = item._pdf;
          links[0].target = '_blank';
          links[0].rel = 'noopener noreferrer';
          links[0].textContent = item.kind === 'coloring' ? 'Print letter PDF' : 'Print 4×2 PDF';
        } else if (item._image) {
          links[0].textContent = 'Print';
          links[0].href = '#print-' + item.id;
          links[0].onclick = e => { e.preventDefault(); printImage(item); };
        } else {
          links[0].textContent = 'Print unavailable';
        }
      }
      if (links[1]) {
        links[1].removeAttribute('href');
        if (item._image) { links[1].href = item._image; links[1].download = (item.title || item.id) + '.png'; }
        links[1].textContent = item._image ? 'PNG' : 'Awaiting PNG';
      }
      if (!item._image) {
        const p = document.createElement('div');p.className='missing-art';p.textContent=item.draft?'UNVERIFIED DRAFT':'MEDIA NOT UPLOADED PUBLICLY';body.appendChild(p);
      }
    });
  };
  draftsButton.onclick = () => {
    draftsVisible = !draftsVisible;
    category = 'all'; kind = 'all'; onlyFavorites = false;
    query = ''; document.getElementById('search').value = '';
    render();
  };
  const originalPop = window.onpopstate;
  window.addEventListener('popstate', () => {
    draftsVisible = new URLSearchParams(location.search).get('drafts') === '1';
    render();
  });
  async function loadExisting() {
    let loaded=0;
    for (const item of DB.items) {
      if (item._image) continue;
      const imageKey = item.imageFile || item.sourceFilename;
      if (imageKey) {
        const blob = await readMedia(imageKey);
        if (blob && blob.type.startsWith('image/')) { item._image=URL.createObjectURL(blob); loaded++; }
      }
      if (item.pdfFile) {
        const pdf = await readMedia(item.pdfFile);
        if (pdf) item._pdf=URL.createObjectURL(pdf);
      }
    }
    status.textContent = loaded + ' original artwork image(s) loaded locally. All imports remain on this device, not on the shared site.';
    render();
  }
  async function unpackZip(file) {
    const bytes = new Uint8Array(await file.arrayBuffer()), view=new DataView(bytes.buffer);
    let end=-1;
    for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--) {
      if(view.getUint32(i,true)===0x06054b50){ end=i;break; }
    }
    if(end<0) throw Error('ZIP footer not found');
    const total=view.getUint16(end+10,true);
    let cursor=view.getUint32(end+16,true), found=0;
    for(let i=0;i<total;i++) {
      if(view.getUint32(cursor,true)!==0x02014b50) throw Error('Invalid ZIP directory');
      const method=view.getUint16(cursor+10,true),size=view.getUint32(cursor+20,true);
      const nameLength=view.getUint16(cursor+28,true),extra=view.getUint16(cursor+30,true),comment=view.getUint16(cursor+32,true),local=view.getUint32(cursor+42,true);
      const name=new TextDecoder().decode(bytes.subarray(cursor+46,cursor+46+nameLength));
      cursor+=46+nameLength+extra+comment;
      if(!/\.(png|jpe?g|webp|pdf)$/i.test(name)) continue;
      if(view.getUint32(local,true)!==0x04034b50) continue;
      const start=local+30+view.getUint16(local+26,true)+view.getUint16(local+28,true);
      const compressed=bytes.slice(start,start+size);
      let raw;
      if(method===0)raw=compressed;
      else if(method===8){
        if(typeof DecompressionStream === 'undefined') throw Error('ZIP extraction unsupported here; unpack ZIP first and select its image/PDF files.');
        const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        raw=await new Response(stream).arrayBuffer();
      }else continue;
      const type=name.endsWith('.pdf')?'application/pdf':'image/'+(name.split('.').pop().toLowerCase()==='jpg'?'jpeg':name.split('.').pop().toLowerCase());
      await writeMedia(name,new Blob([raw],{type}));
      found++;
    }
    return found;
  }
  input.addEventListener('change', async () => {
    const files=Array.from(input.files||[]); if(!files.length)return;
    status.textContent='Importing artwork locally…';
    try {
      let imported=0;
      for(const file of files) {
        if(/\.zip$/i.test(file.name)){ imported+=await unpackZip(file);continue; }
        const item=DB.items.find(x=>[x.imageFile,x.pdfFile,x.sourceFilename].some(p=>p&&normalize(p.split('/').pop())===normalize(file.name)));
        if(!item) continue;
        const path=file.type==='application/pdf'?(item.pdfFile||item.sourceFilename):(item.imageFile||item.sourceFilename);
        await writeMedia(path,file);
        imported++;
      }
      status.textContent='Imported ' + imported + ' artwork file(s) locally.';
      await loadExisting();
    }catch(error){status.textContent='Could not import: '+error.message}
    input.value='';
  });
  fetch('/data/drafts.json')
    .then(r=>{if(!r.ok)throw Error('draft catalog not found');return r.json()})
    .then(items=>{
      items.forEach(x => { if(!DB.items.some(y=>y.id===x.id)) DB.items.push(x) });
      render();
      return loadExisting();
    })
    .catch(()=>loadExisting().catch(e=>{status.textContent='Local artwork storage unavailable: '+e.message;render()}));
  render();
})();
