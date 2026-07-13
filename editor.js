document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('post-title');
  const descInput = document.getElementById('post-description');
  const coverInput = document.getElementById('cover-url');
  const coverPreview = document.getElementById('cover-preview');
  const editorContent = document.getElementById('editor-content');
  const publishBtn = document.getElementById('btn-publish');
  const pageTitle = document.getElementById('editor-page-title');

  const params = new URLSearchParams(location.search);
  const editId = params.get('edit');

  if (editId) {
    pageTitle.textContent = '글 수정';
    publishBtn.textContent = '저장';
    const post = PostStore.getById(editId);
    if (post) {
      titleInput.value = post.title;
      descInput.value = post.description || '';
      coverInput.value = post.coverUrl || '';
      editorContent.innerHTML = post.content;
      if (post.coverUrl) {
        coverPreview.innerHTML = `<img src="${post.coverUrl}" alt="Cover preview">`;
      }
    }
  }

  document.getElementById('btn-preview-cover').addEventListener('click', () => {
    const url = coverInput.value.trim();
    if (url) {
      coverPreview.innerHTML = `<img src="${url}" alt="Cover preview" onerror="this.parentElement.innerHTML='<p style=\\'color:#e53e3e;font-size:0.875rem\\'>이미지를 불러올 수 없습니다</p>'">`;
    } else {
      coverPreview.innerHTML = '';
    }
  });

  const toolbar = document.getElementById('toolbar');
  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    e.preventDefault();

    const cmd = btn.dataset.cmd;
    const value = btn.dataset.value;

    if (cmd) {
      if (cmd === 'formatBlock') {
        document.execCommand(cmd, false, value);
      } else {
        document.execCommand(cmd, false, null);
      }
      editorContent.focus();
    }
  });

  document.getElementById('btn-link').addEventListener('click', (e) => {
    e.preventDefault();
    const url = prompt('URL을 입력하세요:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
    editorContent.focus();
  });

  document.getElementById('btn-code').addEventListener('click', (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    const text = selection.toString() || '코드를 입력하세요';
    document.execCommand('insertHTML', false, `<pre><code>${text}</code></pre>`);
    editorContent.focus();
  });

  publishBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const coverUrl = coverInput.value.trim();
    const content = editorContent.innerHTML.trim();

    if (!title) {
      alert('제목을 입력하세요.');
      titleInput.focus();
      return;
    }
    if (!content || content === '<br>') {
      alert('내용을 입력하세요.');
      editorContent.focus();
      return;
    }

    if (editId) {
      const existing = PostStore.getById(editId);
      if (existing) {
        existing.title = title;
        existing.description = description;
        existing.coverUrl = coverUrl;
        existing.content = content;
        existing.updatedAt = new Date().toISOString();
        PostStore.save(existing);
      }
    } else {
      PostStore.save({
        id: 'post_' + Date.now(),
        title,
        description,
        coverUrl,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    location.href = '/';
  });

  editorContent.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
  });
});
