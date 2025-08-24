// Simple client-side app to list and render markdown walkthroughs.
const frag = document.createDocumentFragment();
tags.forEach(tag=>{
const b = document.createElement('button');
b.className='tag';
b.textContent = tag;
b.onclick = ()=> filterByTag(tag);
frag.appendChild(b);
})
filtersEl.appendChild(frag);
}


function renderList(list){
postsListEl.innerHTML='';
if(list.length===0){ postsListEl.innerHTML='<li>No walkthroughs found.</li>'; return }
list.forEach(p=>{
const li = document.createElement('li');
li.innerHTML = `<div class="post-title">${escapeHtml(p.title)}</div><div class="post-meta">${p.date} • ${ (p.tags||[]).map(t=>`<span class=\"tag\">${escapeHtml(t)}</span>`).join(' ') }</div>`;
li.onclick = ()=> showPost(p.slug);
postsListEl.appendChild(li);
})
}


function escapeHtml(s){ return s ? s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c])) : '' }


async function showPost(slug){
const p = posts.find(x=> x.slug===slug);
if(!p){ postContentEl.innerHTML = '<p>Walkthrough not found.</p>'; return }
history.pushState({post:slug}, '', `?post=${encodeURIComponent(slug)}`);
postMetaEl.innerHTML = `<h2>${escapeHtml(p.title)}</h2><div class="post-meta">${p.date} • ${ (p.tags||[]).map(t=>`<span class=\"tag\">${escapeHtml(t)}</span>`).join(' ') }</div>`;
try{
const r = await fetch('/posts/' + p.file);
const md = await r.text();
postContentEl.innerHTML = marked.parse(md);
// make external links open in new tab
postContentEl.querySelectorAll('a').forEach(a=>{ if(a.hostname!==location.hostname) a.target='_blank'; });
}catch(e){ postContentEl.innerHTML = '<p>Unable to load post file.</p>'; console.error(e); }
}


function filterByTag(tag){
const filtered = posts.filter(p=> (p.tags||[]).includes(tag));
renderList(filtered);
}


searchInput.addEventListener('input', ()=>{
const q = searchInput.value.trim().toLowerCase();
if(!q) return renderList(posts);
const filtered = posts.filter(p=> (p.title + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(q));
renderList(filtered);
});


window.addEventListener('popstate', ()=> handleRouting());


function handleRouting(){
const params = new URLSearchParams(location.search);
const slug = params.get('post');
if(slug){ showPost(slug); }
}


// init
loadManifest();
