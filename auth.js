const AUTH = {
  accounts: [
    { username: 'admin', password: 'admin1234', role: 'admin' },
    { username: 'user',  password: 'user1234',  role: 'user' },
  ],

  isLoggedIn() {
    return sessionStorage.getItem('blog_auth') === 'true';
  },

  isAdmin() {
    return sessionStorage.getItem('blog_role') === 'admin';
  },

  getUsername() {
    return sessionStorage.getItem('blog_user') || '';
  },

  login(username, password) {
    const account = this.accounts.find(a => a.username === username && a.password === password);
    if (account) {
      sessionStorage.setItem('blog_auth', 'true');
      sessionStorage.setItem('blog_role', account.role);
      sessionStorage.setItem('blog_user', account.username);
      return true;
    }
    return false;
  },

  logout() {
    sessionStorage.removeItem('blog_auth');
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
