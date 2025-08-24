// assets/app.js (robust version)
// - Tries several likely post.json paths
// - Detects file:// and suggests running a local server
// - Shows helpful UI messages and logs verbose errors

const postsListEl = document.getElementById('posts-list');
const postContentEl = document.getElementById('post-content');
const postMetaEl = document.getElementById('post-meta');
const searchInput = document.getElementById('search');

let posts = [];

// Helpful UI message
function showSidebarMessage(html) {
  postsListEl.innerHTML = `<li style="color:#6b7280; padding:8px;">${html}</li>`;
}

// If opened directly with file://, warn user (fetching files commonly fails)
if (location.protocol === 'file:') {
  console.warn('Page is opened via file:// — fetching local files may fail. Run a local server (e.g. python -m http.server) and reload.');
  showSidebarMessage('You opened this page with <code>file://</code>. Please run a local static server (e.g. <code>python -m http.server</code>) and reload — otherwise posts may not load.');
}

// try fetching a list of candidate index paths
async function fetchFirstSuccessful(paths) {
  for (const p of paths) {
    try {
      const res = await fetch(p);
      if (!res.ok) {
        console.info(`fetch ${p} -> ${res.status}`);
        continue;
      }
      // try parse JSON if endpoint looks like JSON
      const text = await res.text();
      // quick sanity: if it's empty skip
      if (!text || text.trim().length === 0) {
        console.info(`${p} returned empty content`);
        continue;
      }
      // attempt to parse as JSON for post index
      try {
        const json = JSON.parse(text);
        console.info(`Loaded index from ${p}`);
        return { path: p, data: json };
      } catch (err) {
        // if caller expects raw text, return text
        console.info(`Loaded raw text from ${p}`);
        return { path: p, data: text };
      }
    } catch (err) {
      console.info(`fetch ${p} failed:`, err);
      // try next
    }
  }
  throw new Error('All fetch attempts failed');
}

async function loadPostsIndex() {
  // candidate locations to try (relative before absolute)
  const candidates = [
    'posts/post.json',
    './posts/post.json',
    '/posts/post.json',     // sometimes user used leading slash
    'post.json',
    './post.json'
  ];

  try {
    const result = await fetchFirstSuccessful(candidates);
    if (!Array.isArray(result.data)) {
      console.error('posts/post.json did not return an array. Received:', result.data);
      showSidebarMessage('Error: posts/post.json must be a JSON array. Check console.');
      return;
    }
    posts = result.data.map((p, i) => ({
      id: p.id || `post-${i}`,
      title: p.title || `Untitled ${i+1}`,
      tags: p.tags || [],
      date: p.date || '',
      file: p.file || null,
      md: p.md || null
    }));
    console.log(`Loaded ${posts.length} posts (from ${result.path}).`);
  } catch (err) {
    console.error('Could not load posts index:', err);
    showSidebarMessage('Could not load posts/post.json — check the console for details.');
    return;
  }
}

async function loadMarkdownForPost(post) {
  if (post.md) return post.md;

  // candidate markdown paths to try
  const candidates = [];
  if (post.file) candidates.push(post.file);
  // typical fallback patterns
  candidates.push(`posts/${post.id}.md`);
  candidates.push(`./posts/${post.id}.md`);
  candidates.push(`/posts/${post.id}.md`);
  candidates.push(`${post.id}.md`);
  candidates.push(`./${post.id}.md`);

  for (const path of candidates) {
    try {
      const res = await fetch(path);
      if (!res.ok) {
        console.info(`Markdown fetch ${path} -> ${res.status}`);
        continue;
      }
      const text = await res.text();
      if (text && text.trim().length > 0) {
        post.md = text;
        console.info(`Loaded markdown for ${post.id} from ${path}`);
        return text;
      }
    } catch (err) {
      console.info(`Markdown fetch ${path} failed:`, err);
      continue;
    }
  }
  // final fallback content
  const fallback = `# Error\nCould not load markdown for ${post.id}. Tried ${candidates.join(', ')}.`;
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
    if (i === 0) {
      // auto-open first post
      setTimeout(() => li.click(), 0);
    }
  });
}

searchInput.addEventListener('input', (e) => {
  renderList(e.target.value);
});

// start
(async function init() {
  await loadPostsIndex();
  if (!posts.length) {
    // message already shown by loadPostsIndex
    return;
  }
  renderList();
})();
