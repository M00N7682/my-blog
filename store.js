const PostStore = {
  async getAll() {
    const res = await fetch(`${API_BASE}/api/posts`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    const rows = await res.json();
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      coverUrl: r.cover_url,
      content: r.content,
      author: r.author,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async getDrafts() {
    const token = AUTH.getToken();
    const res = await fetch(`${API_BASE}/api/drafts`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch drafts');
    const rows = await res.json();
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      coverUrl: r.cover_url,
      content: r.content,
      author: r.author,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async getById(id) {
    const res = await fetch(`${API_BASE}/api/posts/${id}`);
    if (!res.ok) return null;
    const r = await res.json();
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      coverUrl: r.cover_url,
      content: r.content,
      author: r.author,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  async save(post) {
    const token = AUTH.getToken();
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    const existing = post.id ? await this.getById(post.id) : null;
    if (existing) {
      const res = await fetch(`${API_BASE}/api/posts/${post.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify(post),
      });
      if (!res.ok) throw new Error('Failed to update post');
      return post.id;
    } else {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST', headers,
        body: JSON.stringify(post),
      });
      if (!res.ok) throw new Error('Failed to create post');
      const data = await res.json();
      return data.id;
    }
  },

  async remove(id) {
    const token = AUTH.getToken();
    const res = await fetch(`${API_BASE}/api/posts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete post');
  }
};
