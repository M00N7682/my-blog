const API_BASE = 'https://my-blog-api-production-69ce.up.railway.app';

const AUTH = {
  isLoggedIn() {
    return !!sessionStorage.getItem('blog_token');
  },

  isAdmin() {
    return sessionStorage.getItem('blog_role') === 'admin';
  },

  getUsername() {
    return sessionStorage.getItem('blog_user') || '';
  },

  getToken() {
    return sessionStorage.getItem('blog_token') || '';
  },

  async login(username, password) {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '로그인 실패');
    }
    const data = await res.json();
    sessionStorage.setItem('blog_token', data.token);
    sessionStorage.setItem('blog_role', data.role);
    sessionStorage.setItem('blog_user', data.username);
    return data;
  },

  logout() {
    sessionStorage.removeItem('blog_token');
    sessionStorage.removeItem('blog_role');
    sessionStorage.removeItem('blog_user');
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      location.href = 'login.html?redirect=' + encodeURIComponent(location.href);
      return false;
    }
    return true;
  },

  updateUI() {
    const fabWrite = document.querySelector('.fab-write');
    if (fabWrite) {
      fabWrite.style.display = this.isLoggedIn() ? 'flex' : 'none';
    }

    document.querySelectorAll('.auth-only').forEach(el => {
      el.style.display = this.isLoggedIn() ? '' : 'none';
    });

    document.querySelectorAll('.guest-only').forEach(el => {
      el.style.display = this.isLoggedIn() ? 'none' : '';
    });

    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = this.isAdmin() ? '' : 'none';
    });
  }
};

document.addEventListener('DOMContentLoaded', () => AUTH.updateUI());
