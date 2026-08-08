document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const postId = params.get('id');

  if (!postId) {
    location.href = '/';
    return;
  }

  const post = await PostStore.getById(postId);

  if (!post) {
    document.getElementById('post-detail').innerHTML =
      '<p style="padding-top:2rem;opacity:0.6;font-size:1.2rem;">글을 찾을 수 없습니다. <a href="/" style="color:var(--color-primary);text-decoration:underline;">목록으로 돌아가기</a></p>';
    return;
  }

  document.title = post.title + ' - My Blog';
  document.getElementById('detail-title').textContent = post.title;

  const date = new Date(post.createdAt);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('detail-date').textContent =
    `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

  const coverEl = document.getElementById('detail-cover');
  if (post.coverUrl) {
    // Hide the cover entirely if the image is gone, rather than showing a broken icon.
    coverEl.addEventListener('error', () => { coverEl.style.display = 'none'; }, { once: true });
    coverEl.src = post.coverUrl;
    coverEl.alt = post.title;
    coverEl.style.display = 'block';
  }

  document.getElementById('detail-body').innerHTML = post.content;

  document.getElementById('btn-edit').addEventListener('click', () => {
    location.href = `write.html?edit=${post.id}`;
  });

  document.getElementById('btn-delete').addEventListener('click', async () => {
    if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
      await PostStore.remove(post.id);
      location.href = '/';
    }
  });
});
