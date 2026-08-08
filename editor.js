document.addEventListener('DOMContentLoaded', async () => {
  const titleInput = document.getElementById('post-title');
  const descInput = document.getElementById('post-description');
  const coverInput = document.getElementById('cover-url');
  const coverPreview = document.getElementById('cover-preview');
  const coverUploadArea = document.getElementById('cover-upload-area');
  const coverFileInput = document.getElementById('cover-file');
  const coverPlaceholder = document.getElementById('cover-placeholder');
  const editorContent = document.getElementById('editor-content');
  const publishBtn = document.getElementById('btn-publish');
  const draftBtn = document.getElementById('btn-draft');
  const pageTitle = document.getElementById('editor-page-title');

  const params = new URLSearchParams(location.search);
  const editId = params.get('edit');
  let currentDraftId = params.get('draft');

  async function uploadImage(file) {
    const token = AUTH.getToken();
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('이미지 업로드 실패');
    const data = await res.json();
    return data.url;
  }

  if (editId) {
    pageTitle.textContent = '글 수정';
    publishBtn.textContent = '저장';
    const post = await PostStore.getById(editId);
    if (post) {
      titleInput.value = post.title;
      descInput.value = post.description || '';
      coverInput.value = post.coverUrl || '';
      editorContent.innerHTML = post.content;
      if (post.coverUrl) {
        coverPreview.innerHTML = `<img src="${post.coverUrl}" alt="Cover preview">`;
        coverPreview.style.display = 'block';
        coverPlaceholder.style.display = 'none';
      }
    }
  } else if (currentDraftId) {
    pageTitle.textContent = '임시저장 글 편집';
    const post = await PostStore.getById(currentDraftId);
    if (post) {
      titleInput.value = post.title || '';
      descInput.value = post.description || '';
      coverInput.value = post.coverUrl || '';
      editorContent.innerHTML = post.content || '';
      if (post.coverUrl) {
        coverPreview.innerHTML = `<img src="${post.coverUrl}" alt="Cover preview">`;
        coverPreview.style.display = 'block';
        coverPlaceholder.style.display = 'none';
      }
    }
  }

  // Load drafts list
  await loadDrafts();

  async function loadDrafts() {
    const section = document.getElementById('drafts-section');
    const list = document.getElementById('drafts-list');
    if (!section || !list) return;

    try {
      const drafts = await PostStore.getDrafts();
      if (drafts.length === 0) {
        section.style.display = 'none';
        return;
      }
      section.style.display = 'block';
      list.innerHTML = '';
      drafts.forEach(d => {
        const date = new Date(d.updatedAt);
        const dateStr = `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`;
        const li = document.createElement('li');
        li.className = 'draft-item';
        li.innerHTML = `
          <a href="write.html?draft=${d.id}" class="draft-link">
            <span class="draft-title">${d.title || '제목 없음'}</span>
            <span class="draft-date">${dateStr}</span>
          </a>`;
        list.appendChild(li);
      });
    } catch {
      section.style.display = 'none';
    }
  }

  function setCoverPreview(url) {
    coverInput.value = url;
    coverPreview.innerHTML = `<img src="${url}" alt="Cover preview" style="max-width:100%;border-radius:8px;">`;
    coverPlaceholder.style.display = 'none';
    coverPreview.style.display = 'block';
  }

  coverUploadArea.addEventListener('click', () => coverFileInput.click());
  coverFileInput.addEventListener('change', async () => {
    const file = coverFileInput.files[0];
    if (!file) return;
    try {
      coverPlaceholder.innerHTML = '<span>업로드 중...</span>';
      const url = await uploadImage(file);
      setCoverPreview(url);
    } catch (err) {
      coverPlaceholder.innerHTML = '<span style="color:#e53e3e;">업로드 실패</span>';
    }
  });

  coverUploadArea.addEventListener('paste', async (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        try {
          coverPlaceholder.innerHTML = '<span>업로드 중...</span>';
          const url = await uploadImage(file);
          setCoverPreview(url);
        } catch (err) {
          coverPlaceholder.innerHTML = '<span style="color:#e53e3e;">업로드 실패</span>';
        }
        break;
      }
    }
  });

  coverUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    coverUploadArea.classList.add('drag-over');
  });
  coverUploadArea.addEventListener('dragleave', () => {
    coverUploadArea.classList.remove('drag-over');
  });
  coverUploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    coverUploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        coverPlaceholder.innerHTML = '<span>업로드 중...</span>';
        const url = await uploadImage(file);
        setCoverPreview(url);
      } catch (err) {
        coverPlaceholder.innerHTML = '<span style="color:#e53e3e;">업로드 실패</span>';
      }
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

  // Draft save
  draftBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const coverUrl = coverInput.value.trim();
    const content = editorContent.innerHTML.trim();

    draftBtn.disabled = true;
    draftBtn.textContent = '저장 중...';

    try {
      const postData = {
        title: title || '제목 없음',
        description, coverUrl, content,
        status: 'draft',
      };

      if (currentDraftId) {
        postData.id = currentDraftId;
      } else if (editId) {
        postData.id = editId;
      }

      const savedId = await PostStore.save(postData);
      currentDraftId = savedId;

      draftBtn.textContent = '저장 완료!';
      setTimeout(() => {
        draftBtn.disabled = false;
        draftBtn.textContent = '임시저장';
      }, 1500);

      if (!params.get('draft') && !editId) {
        history.replaceState(null, '', `write.html?draft=${savedId}`);
      }
      await loadDrafts();
    } catch (e) {
      alert('임시저장에 실패했습니다: ' + e.message);
      draftBtn.disabled = false;
      draftBtn.textContent = '임시저장';
    }
  });

  // Publish
  publishBtn.addEventListener('click', async () => {
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

    publishBtn.disabled = true;
    publishBtn.textContent = '발행 중...';

    try {
      const postData = {
        title, description, coverUrl, content,
        status: 'published',
      };

      if (editId) {
        postData.id = editId;
      } else if (currentDraftId) {
        postData.id = currentDraftId;
      }

      await PostStore.save(postData);
      location.href = '/';
    } catch (e) {
      alert('발행에 실패했습니다: ' + e.message);
      publishBtn.disabled = false;
      publishBtn.textContent = editId ? '저장' : '발행';
    }
  });

  editorContent.addEventListener('paste', async (e) => {
    const items = e.clipboardData.items;
    let hasImage = false;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        hasImage = true;
        e.preventDefault();
        const file = item.getAsFile();
        const placeholder = document.createElement('span');
        placeholder.textContent = '이미지 업로드 중...';
        placeholder.style.color = '#888';

        const sel = window.getSelection();
        if (sel.rangeCount) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(placeholder);
        }

        try {
          const url = await uploadImage(file);
          const img = document.createElement('img');
          img.src = url;
          img.style.maxWidth = '100%';
          placeholder.replaceWith(img);
        } catch (err) {
          placeholder.textContent = '업로드 실패: ' + err.message;
          placeholder.style.color = '#e53e3e';
        }
        break;
      }
    }

    if (!hasImage) {
      e.preventDefault();
      const html = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, html);
    }
  });

  editorContent.addEventListener('drop', async (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      e.preventDefault();
      try {
        const url = await uploadImage(files[0]);
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        document.execCommand('insertHTML', false, img.outerHTML);
      } catch (err) {
        alert('이미지 업로드 실패: ' + err.message);
      }
    }
  });
});
