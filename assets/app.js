// assets/app.js — robust loader + helpful fallback
const postsListEl = document.getElementById('posts-list');
const postContentEl = document.getElementById('post-content');
const postMetaEl = document.getElementById('post-meta');
const searchInput = document.getElementById('search');

let posts = [];

// compute basePath (keeps trailing slash)
function computeBasePath() {
  let p = location.pathname || '/';
  if (p.endsWith('/')) return p;
  return p.substring(0, p.lastIndexOf('/') + 1) || '/';
}
const basePath = computeBasePath();
const origin = location.origin; // e.g. https://username.github.io
const originBase = origin + basePath;

// Build an absolute URL for fetch that works on GH Pages and project pages
function url(path) {
  if (!path) return originBase;
  if (/^https?:\/\//.test(path)) return path;
  // absolute path from root (starts with '/')
  if (path.startsWith('/')) return origin + path;
  // relative path (strip leading './')
  if (path.startsWith('./')) path = path.slice(2);
  // join to base (origin + basePath)
  return originBase + path;
}

function showSidebarMessage(html) {
  postsListEl.innerHTML = `<li style="color:#6b7280; padding:8px;">${html}</li>`;
}

if (location.protocol === 'file:') {
  console.warn('Opened with file:// — use a local static server to test (e.g. python -m http.server).');
  showSidebarMessage('Open via a local server (e.g. <code>python -m http.server</code>) or view on GitHub Pages.');
}

// fetch helpers
async function fetchJsonFull(urlStr) {
  try {
    const res = await fetch(urlStr, {cache: 'no-store'});
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}
async function fetchTextFull(urlStr) {
  try {
    const res = await fetch(urlStr, {cache: 'no-store'});
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } catch (err) {
    throw err;
  }
}

function filenameToId(filename) {
  if (!filename) return null;
  return filename.split('/').pop().replace(/\.[^/.]+$/, '');
}

async function loadPostsIndex() {
  // candidate locations (try relative, posts/, root, and absolute-from-root)
  const candidatePaths = [
    'posts/post.json',
    './posts/post.json',
    'post.json',
    './post.json',
    '/posts/post.json',
    '/post.json'
  ];

  let lastError = null;
  for (const p of candidatePaths) {
    const u = url(p);
    try {
      const data = await fetchJsonFull(u);
      if (!Array.isArray(data)) {
        console.error(`Index ${u} did not return an array`, data);
        lastError = `Index ${u} did not return an array`;
        continue;
      }

      posts = data.map((pObj, i) => {
        const file = pObj.file || (pObj.slug ? `posts/${pObj.slug}.md` : `posts/post-${i}.md`);
        const id = filenameToId(file) || (pObj.slug || `post-${i}`);
        return {
          id,
          title: pObj.title || (pObj.slug || id),
          slug: pObj.slug || id,
          tags: pObj.tags || [],
          date: pObj.date || '',
          file,
          md: pObj.md || null
        };
      });

      console.info(`Loaded ${posts.length} posts from ${u}`);
      return;
    } catch (err) {
      console.info(`Could not load index ${u}:`, err.message || err);
      lastError = err;
      // try next
    }
  }

  // If we get here, no index was loaded. Show a clear message and provide a dev fallback.
  console.error('Failed to load any posts index. Last error:', lastError);
  showSidebarMessage('Could not load posts index. Check console (Network/Console) and ensure <code>posts/post.json</code> is present and reachable.');
  // developer fallback so the UI is visible while debugging
  const fallback = [
    { title: '⚠️ No index found — fallback post', slug: 'fallback', date: '', tags: ['fallback'], file: null, id: 'fallback', md: '# Fallback post\\n\\nNo `posts/post.json` found. Put `posts/post.json` in the repository with a `file` field pointing to your markdown files.' }
  ];
  posts = fallback;
}

// load markdown for a given post using the canonical file when available
async function loadMarkdownForPost(post) {
  if (post.md) return post.md;
  const candidates = [];
  if (post.file) candidates.push(post.file);
  // some sensible fallbacks
  candidates.push(`posts/${post.id}.md`);
  candidates.push(`${post.id}.md`);
  candidates.push(`./posts/${post.id}.md`);
  candidates.push(url(`posts/${post.id}.md`)); // already contains originBase
  for (const c of candidates) {
    try {
      // if c already looks like an absolute URL, use it as-is; else build a url
      const u = /^https?:\/\//.test(c) ? c : url(c);
      const text = await fetchTextFull(u);
      if (text && text.trim().length) {
        post.md = text;
        console.info(`Loaded markdown for ${post.id} from ${u}`);
        return text;
      }
    } catch (err) {
      console.info(`Could not fetch markdown ${c}:`, err.message || err);
    }
  }
  const fallback = `# Error\nCould not load markdown for ${post.id}. Tried: ${candidates.join(', ')}`;
  post.md = fallback;
  console.error(fallback);
  return fallback;
}

function clearActive() {
  document.querySelectorAll('.posts-list li').forEach(n => n.classList.remove('active'));
}

function createListItem(post) {
  const li = document.createElement('li');
  li.textContent = post.title + (post.file ? ` — ${post.file}` : '');
  li.dataset.id = post.id;
  li.dataset.file = post.file || '';
  li.addEventListener('click', async () => {
    clearActive();
    li.classList.add('active');
    postMetaEl.textContent = `${post.date || ''}${(post.tags && post.tags.length) ? ' • ' + post.tags.join(', ') : ''}`;
    postContentEl.innerHTML = 'Loading post...';
    const md = await loadMarkdownForPost(post);
    postContentEl.innerHTML = marked.parse(md || '*No content*');
    postContentEl.querySelectorAll('a').forEach(a => {
      try { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); } catch(e) {}
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

searchInput && searchInput.addEventListener('input', (e) => renderList(e.target.value));

(async function init() {
  await loadPostsIndex();
  // if posts loaded (or fallback), render them
  if (!posts.length) {
    showSidebarMessage('No posts available.');
    return;
  }
  renderList();
})();
