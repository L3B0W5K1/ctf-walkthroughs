// assets/app.js — updated
li.classList.add('active');
postMetaEl.textContent = `${post.date || ''}${(post.tags && post.tags.length) ? ' • ' + post.tags.join(', ') : ''}`;
postContentEl.innerHTML = 'Loading post...';
const md = await loadMarkdownForPost(post);
// render markdown to HTML (marked)
postContentEl.innerHTML = marked.parse(md || '*No content*');
// fix external links to open in new tab
postContentEl.querySelectorAll('a').forEach(a => {
try { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); } catch(e){}
});
});
return li;
}


function renderList(filter = '') {
postsListEl.innerHTML = '';
const q = filter.trim().toLowerCase();
const filtered = posts.filter(p => {
if (!q) return true;
return (
(p.title && p.title.toLowerCase().includes(q)) ||
(p.slug && p.slug.toLowerCase().includes(q)) ||
(p.file && p.file.toLowerCase().includes(q)) ||
(p.tags && p.tags.join(' ').toLowerCase().includes(q)) ||
(p.md && p.md.toLowerCase().includes(q))
);
});


if (filtered.length === 0) {
showSidebarMessage('No posts found.');
postContentEl.innerHTML = 'Select a walkthrough from the left.';
postMetaEl.textContent = '';
return;
}


filtered.forEach((p, i) => {
const li = createListItem(p);
postsListEl.appendChild(li);
if (i === 0) li.click();
});
}


searchInput.addEventListener('input', (e) => renderList(e.target.value));


(async function init() {
await loadPostsIndex();
if (!posts.length) return;
renderList();
})();
