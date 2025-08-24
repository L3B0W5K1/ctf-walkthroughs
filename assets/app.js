// assets/app.js - GitHub Pages friendly version
// Computes a correct basePath for both username.github.io (root) and project pages (username.github.io/repo/)

const postsListEl = document.getElementById('posts-list');
const postContentEl = document.getElementById('post-content');
const postMetaEl = document.getElementById('post-meta');
const searchInput = document.getElementById('search');

let posts = [];

// compute basePath: keep trailing slash. Examples:
//  - user site:    location.pathname = '/'        -> basePath = '/'
//  - project site: location.pathname = '/repo/'   -> basePath = '/repo/'
//  - index.html served at '/repo/index.html' -> basePath '/repo/'
function computeBasePath() {
  let p = location.pathname || '/';
  // if pathname ends with '/', use it as-is
  if (p.endsWith('/')) return p;
  // otherwise strip last segment (like '/repo/index.html' -> '/repo/')
  return p.substring(0, p.lastIndexOf('/') + 1) || '/';
}
const basePath = computeBasePath();

// helper to build absolute-ish URL for fetch (safe on GH Pages)
function url(path) {
  // if path already starts with http(s) return as-is
  if (/^https?:\/\//.test(path)) return path;
  // avoid double slashes when joining
  if (basePath.endsWith('/') && path.startsWith('/')) return basePath + path.slice(1);
  if (!basePath.endsWith('/') && !path.startsWith('/')) return basePath + path;
  return basePath + path.replace(/^\.\//, '');
}

// friendly UI messages
function showSidebarMessage(html) {
  postsListEl.innerHTML = `<li style="color:#6b7280; padding:8px;">${html}</li>`;
}

// warn when opened via file://
if (location.protocol === 'file:') {
  console.warn('Opened with file:// — use a local static server to test (e.g. python -m http.server).');
  showSidebarMessage('Open via a local server (e.g. <code>python -m http.server</code>) or view on GitHub Pages.');
}

async function fetchJson(path) {
  try {
    const res = await fetch(url(path));
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

async function fetchText(path) {
  try {
    const res = await fetch(url(path));
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } catch (err) {
    throw err;
  }
}

async function loadPostsIndex() {
  // try common index filenames (relative to basePath)
  const candidates = ['posts/post.json', './posts/post.json', 'post.json', './post.json'];
  for (const c of candidates) {
    try {
      const data = await fetchJson(c);
      if (!Array.isArray(data)) {
        console.error(`Index ${c} did not return an array`, data);
        continue;
      }
      posts = data.map((p, i) => ({
        id: p.id || `post-${i}`,
        title: p.title || `Untitled ${i+1}`,
        tags: p.tags || [],
        date: p.date || '',
        file: p.file || null,
        md: p.md || null
      }));
      console.info(`Loaded ${posts.length} posts from ${url(c)}`);
      return;
    } catch (err) {
      console.info(`Could not load index ${url(c)}:`, err.message || err);
      // try next
    }
  }
  showSidebarMessage('Could not load posts index. Make sure <code>posts/post.json</code> exists and is valid JSON.');
}

async function loadMarkdownForPost(post) {
  if (post.md) return post.md;
  const candidates = [];
  if (post.file) candidates.push(post.file);
  candidates.push(`posts/${post.id}.md`);
  candidates.push(`${post.id}.md`);
  candidates.push(`./posts/${post.id}.md`);
  for (const c of candidates) {
    try {
      const text = await fetchText(c);
      if (text && text.trim().length) {
        post.md = text;
        console.info(`Loaded markdown for ${post.id} from ${url(c)}`);
        return text;
      }
    } catch (err) {
      console.info(`Could not fetch markdown ${url(c)}:`, err.message || err);
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
  li.textContent = post.title;
  li.dataset.id = post.id;
  li.addEventListener('click', async () => {
    clearActive();
    li.classList.add('active');
    postMetaEl.textContent = `${post.date || ''}${(post.tags && post.tags.length) ? ' • ' + post.tags.join(', ') : ''}`;
    postContentEl.innerHTML = 'Loading post...';
    const md = await loadMarkdownForPost(post);
    postContentEl.innerHTML = marked.parse(md || '*No content*');
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
