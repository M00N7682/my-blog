const PostStore = {
  getAll() {
    const local = JSON.parse(localStorage.getItem('blog_posts') || '[]');
    const staticIds = new Set(STATIC_POSTS.map(p => p.id));
    const localOnly = local.filter(p => !staticIds.has(p.id));
    const merged = [...localOnly, ...STATIC_POSTS];
    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return merged;
  },

  getById(id) {
    const local = JSON.parse(localStorage.getItem('blog_posts') || '[]');
    return local.find(p => p.id === id) || STATIC_POSTS.find(p => p.id === id) || null;
  },

  save(post) {
    const local = JSON.parse(localStorage.getItem('blog_posts') || '[]');
    const idx = local.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      local[idx] = post;
    } else {
      local.unshift(post);
    }
    localStorage.setItem('blog_posts', JSON.stringify(local));
  },

  remove(id) {
    const local = JSON.parse(localStorage.getItem('blog_posts') || '[]');
    const updated = local.filter(p => p.id !== id);
    localStorage.setItem('blog_posts', JSON.stringify(updated));
  }
};
