const OWNER = 'irochi1184';
const REPO = 'irochi-portfolio';
const BRANCH = 'main';
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}`;
const PUBLIC_ROOT = `https://${OWNER}.github.io/${REPO}/`;

const categoryLabels = {
  girl: '女の子',
  stream: '配信系',
  event: '記念・お祝い'
};

const tokenInput = document.querySelector('#token-input');
const rememberSession = document.querySelector('#remember-session');
const loadButton = document.querySelector('#load-button');
const fileInput = document.querySelector('#file-input');
const publishButton = document.querySelector('#publish-button');
const connectionStatus = document.querySelector('#connection-status');
const editorPanel = document.querySelector('#editor-panel');
const publishPanel = document.querySelector('#publish-panel');
const publishStatus = document.querySelector('#publish-status');
const worksList = document.querySelector('#works-list');
const emptyState = document.querySelector('#empty-state');
const workTemplate = document.querySelector('#work-template');

let token = sessionStorage.getItem('irochi_github_token') || '';
let sourceSha = '';
let works = [];
let removedWorks = [];

if (token) tokenInput.value = token;

function setBusy(value) {
  document.body.classList.toggle('busy', value);
}

function showStatus(message, type = '') {
  publishPanel.classList.remove('hidden');
  publishStatus.className = `publish-status ${type}`.trim();
  publishStatus.innerHTML = message;
  publishPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function api(path, options = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_ROOT}${path}`, { ...options, headers });
  if (!response.ok) {
    let detail = '';
    try {
      const data = await response.json();
      detail = data.message || '';
    } catch (_) {}
    throw new Error(`${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function decodeBase64Unicode(base64) {
  const bytes = Uint8Array.from(atob(base64.replace(/\n/g, '')), c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64Unicode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function normalizeSize(className) {
  if (className.includes('large')) return 'large';
  if (className.includes('tall')) return 'tall';
  if (className.includes('wide')) return 'wide';
  return 'normal';
}

function parseWorksFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const heroSrc = doc.querySelector('.main-card img')?.getAttribute('src') || '';
  return [...doc.querySelectorAll('.gallery .work-card')].map((card, index) => {
    const img = card.querySelector('img');
    return {
      id: `existing-${index}-${img?.getAttribute('src') || ''}`,
      src: img?.getAttribute('src') || '',
      alt: img?.getAttribute('alt') || '',
      title: card.querySelector('h3')?.textContent.trim() || '無題',
      category: card.dataset.category || 'girl',
      size: normalizeSize(card.className),
      hero: img?.getAttribute('src') === heroSrc,
      isNew: false,
      removed: false
    };
  });
}

async function loadPortfolio() {
  token = tokenInput.value.trim();
  if (!token) {
    showStatus('<p>GitHubトークンを入力してください。</p>', 'error');
    return;
  }

  if (rememberSession.checked) sessionStorage.setItem('irochi_github_token', token);
  else sessionStorage.removeItem('irochi_github_token');

  setBusy(true);
  try {
    const file = await api(`/contents/index.html?ref=${encodeURIComponent(BRANCH)}`);
    const html = decodeBase64Unicode(file.content);
    sourceSha = file.sha;
    works = parseWorksFromHtml(html);
    removedWorks = [];
    connectionStatus.textContent = '接続済み';
    connectionStatus.classList.add('connected');
    editorPanel.classList.remove('hidden');
    publishPanel.classList.add('hidden');
    renderWorks();
  } catch (error) {
    connectionStatus.textContent = '接続失敗';
    connectionStatus.classList.remove('connected');
    showStatus(`<p>読み込みに失敗しました。</p><p>${escapeHtml(error.message)}</p>`, 'error');
  } finally {
    setBusy(false);
  }
}

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function renderWorks() {
  worksList.innerHTML = '';
  emptyState.classList.toggle('hidden', works.length > 0);

  works.forEach((work, index) => {
    const node = workTemplate.content.cloneNode(true);
    const card = node.querySelector('.work-editor-card');
    const preview = node.querySelector('.work-preview');
    const titleInput = node.querySelector('.title-input');
    const categorySelect = node.querySelector('.category-select');
    const sizeSelect = node.querySelector('.size-select');
    const heroRadio = node.querySelector('.hero-radio');
    const newBadge = node.querySelector('.new-badge');

    preview.src = work.previewUrl || work.src;
    preview.alt = work.alt || work.title;
    titleInput.value = work.title;
    categorySelect.value = work.category;
    sizeSelect.value = work.size;
    heroRadio.checked = Boolean(work.hero);
    newBadge.classList.toggle('hidden', !work.isNew);

    titleInput.addEventListener('input', e => {
      work.title = e.target.value;
      work.alt = e.target.value ? `${e.target.value}のイラスト` : 'イラスト作品';
    });
    categorySelect.addEventListener('change', e => work.category = e.target.value);
    sizeSelect.addEventListener('change', e => work.size = e.target.value);
    heroRadio.addEventListener('change', () => {
      works.forEach(item => item.hero = item.id === work.id);
      renderWorks();
    });

    node.querySelector('.move-up').disabled = index === 0;
    node.querySelector('.move-down').disabled = index === works.length - 1;
    node.querySelector('.move-up').addEventListener('click', () => moveWork(index, index - 1));
    node.querySelector('.move-down').addEventListener('click', () => moveWork(index, index + 1));
    node.querySelector('.remove-button').addEventListener('click', () => {
      if (!confirm(`「${work.title || '無題'}」を作品一覧から外しますか？\n画像ファイル自体はGitHubに残すので、あとで戻せます。`)) return;
      removedWorks.push(work);
      works.splice(index, 1);
      if (work.hero && works[0]) works[0].hero = true;
      renderWorks();
    });

    card.dataset.id = work.id;
    worksList.appendChild(node);
  });
}

function moveWork(from, to) {
  if (to < 0 || to >= works.length) return;
  const [item] = works.splice(from, 1);
  works.splice(to, 0, item);
  renderWorks();
}

async function imageToWebp(file) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 2200;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const webpBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.88));
  if (webpBlob && webpBlob.size > 0) return { blob: webpBlob, ext: 'webp' };

  const jpegBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  return { blob: jpegBlob, ext: 'jpg' };
}

function timestampName(index, ext) {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `work-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-${index}.${ext}`;
}

fileInput.addEventListener('change', async () => {
  const files = [...fileInput.files];
  if (!files.length) return;
  setBusy(true);
  try {
    for (let i = 0; i < files.length; i++) {
      const converted = await imageToWebp(files[i]);
      const filename = timestampName(i + 1, converted.ext);
      const previewUrl = URL.createObjectURL(converted.blob);
      works.push({
        id: `new-${crypto.randomUUID?.() || `${Date.now()}-${i}`}`,
        src: `assets/${filename}`,
        previewUrl,
        blob: converted.blob,
        title: files[i].name.replace(/\.[^.]+$/, '') || '新しい作品',
        alt: 'イラスト作品',
        category: 'girl',
        size: 'normal',
        hero: works.length === 0,
        isNew: true
      });
    }
    renderWorks();
    editorPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showStatus(`<p>画像の読み込みに失敗しました。</p><p>${escapeHtml(error.message)}</p>`, 'error');
  } finally {
    fileInput.value = '';
    setBusy(false);
  }
});

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function createCardHtml(work) {
  const sizeClass = work.size && work.size !== 'normal' ? ` ${work.size}` : '';
  const label = categoryLabels[work.category] || '女の子';
  const title = escapeHtml(work.title.trim() || '無題');
  const alt = escapeHtml(work.alt || `${work.title || '作品'}のイラスト`);
  const src = escapeHtml(work.src);
  return `        <article class="work-card${sizeClass}" data-category="${work.category}">\n          <img src="${src}" loading="lazy" decoding="async" alt="${alt}">\n          <div class="work-info"><span>${label}</span><h3>${title}</h3></div>\n        </article>`;
}

function updateHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const gallery = doc.querySelector('.gallery');
  if (!gallery) throw new Error('作品一覧(.gallery)が見つかりません。');

  gallery.innerHTML = `\n${works.map(createCardHtml).join('\n\n')}\n      `;

  const count = doc.querySelector('.hero-stats strong');
  if (count) count.textContent = String(works.length);

  const hero = works.find(work => work.hero) || works[0];
  if (hero) {
    const heroImg = doc.querySelector('.main-card img');
    if (heroImg) {
      heroImg.setAttribute('src', hero.src);
      heroImg.setAttribute('alt', hero.alt || `${hero.title}のイラスト`);
    }
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', `${PUBLIC_ROOT}${hero.src}`);
  }

  const minis = works.filter(work => !hero || work.id !== hero.id).slice(0, 2);
  const topMini = doc.querySelector('.card-top img');
  const bottomMini = doc.querySelector('.card-bottom img');
  if (topMini && minis[0]) {
    topMini.setAttribute('src', minis[0].src);
    topMini.setAttribute('alt', minis[0].alt || `${minis[0].title}のイラスト`);
  }
  if (bottomMini && minis[1]) {
    bottomMini.setAttribute('src', minis[1].src);
    bottomMini.setAttribute('alt', minis[1].alt || `${minis[1].title}のイラスト`);
  }

  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

async function publish() {
  if (!token) {
    showStatus('<p>先にGitHubへ接続してください。</p>', 'error');
    return;
  }
  if (!works.length) {
    if (!confirm('作品一覧を0件で公開しますか？')) return;
  }
  if (!works.some(work => work.hero) && works[0]) works[0].hero = true;

  setBusy(true);
  publishButton.disabled = true;
  try {
    showStatus('<p>1/3 新しい画像をアップロードしています…</p>');

    const newWorks = works.filter(work => work.isNew && work.blob);
    for (let i = 0; i < newWorks.length; i++) {
      const work = newWorks[i];
      const content = await blobToBase64(work.blob);
      await api(`/contents/${work.src}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `作品画像を追加: ${work.title || work.src}`,
          content,
          branch: BRANCH
        })
      });
    }

    showStatus('<p>2/3 最新のサイトデータを確認しています…</p>');
    const latest = await api(`/contents/index.html?ref=${encodeURIComponent(BRANCH)}`);
    const latestHtml = decodeBase64Unicode(latest.content);
    const nextHtml = updateHtml(latestHtml);

    showStatus('<p>3/3 作品一覧・並び順・タイトルを公開しています…</p>');
    await api('/contents/index.html', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '作品管理画面からポートフォリオを更新',
        content: encodeBase64Unicode(nextHtml),
        sha: latest.sha,
        branch: BRANCH
      })
    });

    newWorks.forEach(work => {
      work.isNew = false;
      work.blob = null;
      if (work.previewUrl) URL.revokeObjectURL(work.previewUrl);
      work.previewUrl = '';
    });
    removedWorks = [];

    showStatus(`<p><strong>公開処理が完了しました。</strong></p><p>GitHub Pagesへの反映には通常数十秒〜数分かかります。</p><p><a href="${PUBLIC_ROOT}" target="_blank" rel="noopener">公開サイトを確認する</a></p>`, 'success');
    renderWorks();
  } catch (error) {
    showStatus(`<p><strong>公開に失敗しました。</strong></p><p>${escapeHtml(error.message)}</p><p>途中まで画像が追加されている場合がありますが、作品一覧は壊れません。もう一度「作品を読み込む」からやり直してください。</p>`, 'error');
  } finally {
    publishButton.disabled = false;
    setBusy(false);
  }
}

loadButton.addEventListener('click', loadPortfolio);
publishButton.addEventListener('click', publish);
tokenInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') loadPortfolio();
});
