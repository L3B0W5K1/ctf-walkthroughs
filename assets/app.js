// assets/app.js
// Loads posts metadata from posts/post.json and markdown from posts/*.md
// Renders with marked.js. Shows console errors on failure.

const postsListEl = document.getElementById('posts-list');
const postContentEl = document.getElementById('post-content');
const postMetaEl = document.getElementById('post-meta');
const searchInput = document.getElementById('search');

let posts = []; // will be populated from posts/post.json

// Helper: fetch JSON file that lists posts
async function loadPostsIndex() {
  const indexPath = 'posts/post.json'; // relative path -> works on GH Pages
  try {
    const res = await fetch(indexPath);
    if (!res.ok) throw new Error(`Failed to fetch ${indexPath}: ${res.status} ${res.statusText}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error(`posts/post.json must be an array`);
    // Normalize items: ensure each item has id, title and file (or md inline)
    posts = data.map((p, i) => ({
      id: p.id || (`post-${i}`),
      title: p.title || (`Untitled ${i+1}`),
      tags: p.tags || [],
      date: p.date || '',
      file: p.file ? p.file : (p.md ? null : null), // file path relative to project root or posts/
      md: p.md || null
    }));
    console.log(`Loaded ${posts.length} posts from ${indexPath}`);
  } catch (err) {
    console.error(err);
    posts = [];
    // provide a helpful message in the UI
    postsListEl.innerHTML = `<li style="color:#6b7280; padding:8px;">Couldn't load posts/post.json — check console</li>`;
  }
}

// Helper: fetch markdown content for a post if not present inline
async function loadPostContentIfNeeded(post) {
  if (post.md) return post.md;
  // try to construct a path: if post.file is given use that, else fallback to posts/{id}.md
  const filePath = post.file || `posts/${post.id}.md`;
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`Failed to fetch ${filePath}: ${res.status}`);
    const text = await res.text();
    post.md = text;
    return text;
  } catch (err) {
    console.error(`Error loading markdown for ${post.id}:`, err);
    post.md = `# Error\nCould not load markdown file (${filePath}). Check console for details.`;
    return post.md;
  }
}

function clearActive() {
  document.querySelectorAll('.posts-list li').forEach(n => n.classList.remove('active'));
}

function createListItem(post) {
  const li = document.createElement('li');
  li.textContent = post.title;
  li.dataset.id = post.id;
  li.addEventListener('click', async () => {
    // mark active
    clearActive();
    li.classList.add('active');
    // load content then render
    postMetaEl.textContent = `${post.date || ''} ${post.tags && post.tags.length ? ' • ' + post.tags.join(', ') : ''}`;
    postContentEl.innerHTML = 'Loading...';
    const md = await loadPostContentIfNeeded(post);
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
    postsListEl.innerHTML = '<li style="color:#6b7280; padding:8px;">No posts found</li>';
    postContentEl.innerHTML = 'Select a walkthrough from the left.';
    postMetaEl.textContent = '';
    return;
  }

  filtered.forEach((p, i) => {
    const li = createListItem(p);
    postsListEl.appendChild(li);
    // auto-select first visible post
    if (i === 0) {
      li.click();
    }
  });
}

searchInput.addEventListener('input', (e) => {
  renderList(e.target.value);
});

// Boot sequence
(async function init() {
  await loadPostsIndex();
  if (!posts.length) return; // error already shown
  renderList();
})();
