const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const filterButtons = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.work-card');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    cards.forEach(card => {
      card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
    });
  });
});

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const closeButton = lightbox?.querySelector('.lightbox-close');

document.querySelectorAll('.work-card img').forEach(image => {
  image.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
}

closeButton?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

const DEFAULT_SETTINGS = {
  heroCatchphrase: 'かわいいを、ひとつのイラストに。',
  profileText: 'かわいい女の子イラストを中心に制作。やわらかな塗りと、配信やSNSで印象に残る表情づくりを大切にしています。',
  xUrl: 'https://x.com/_irochi_?s=11',
  xLabel: 'X @_irochi_',
  paymentMethods: 'PayPay / 銀行振込',
  openingEnabled: true,
  recommendedPriceIndex: 1,
  prices: [
    { title: 'SNSアイコン', price: '¥4,000〜', items: ['顔まわり〜バストアップ', '簡易背景', '個人利用向け'] },
    { title: '一枚絵', price: '¥7,000〜', items: ['人物1名', '背景なし〜簡易背景', '配信・サムネイル向け'] },
    { title: '立ち絵', price: '¥10,000〜', items: ['全身', '背景透過', '配信用・紹介用におすすめ'] },
    { title: '背景あり記念イラスト', price: '¥12,000〜', items: ['誕生日・周年向け', '背景あり', '華やかな仕上がり'] }
  ]
};

async function loadSiteSettings() {
  try {
    const response = await fetch(`site-settings.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('settings');
    const data = await response.json();
    return {
      ...DEFAULT_SETTINGS,
      ...data,
      prices: Array.isArray(data.prices) ? data.prices : DEFAULT_SETTINGS.prices
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function applySettings(settings) {
  const tagline = document.querySelector('.hero-tagline');
  if (tagline) tagline.textContent = settings.heroCatchphrase || DEFAULT_SETTINGS.heroCatchphrase;

  const profileText = document.querySelector('.irochi-profile-copy p');
  if (profileText) profileText.textContent = settings.profileText || DEFAULT_SETTINGS.profileText;

  const priceCards = [...document.querySelectorAll('.price-card')].slice(0, 4);
  priceCards.forEach((card, index) => {
    const source = settings.prices[index] || DEFAULT_SETTINGS.prices[index];
    card.classList.toggle('featured', index === Number(settings.recommendedPriceIndex));
    card.querySelector('.card-badge')?.remove();
    if (index === Number(settings.recommendedPriceIndex)) {
      const badge = document.createElement('span');
      badge.className = 'card-badge';
      badge.textContent = 'おすすめ';
      card.prepend(badge);
    }
    const title = card.querySelector('h3');
    const price = card.querySelector('.price');
    const list = card.querySelector('ul');
    if (title) title.textContent = source.title || '';
    if (price) price.textContent = source.price || '';
    if (list) {
      list.replaceChildren(...(source.items || []).map(item => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
      }));
    }
  });

  const xLinks = document.querySelectorAll('a[href*="x.com/_irochi_"]');
  xLinks.forEach(link => {
    link.href = settings.xUrl || DEFAULT_SETTINGS.xUrl;
    if (link.closest('.extra-list')) link.textContent = settings.xLabel || DEFAULT_SETTINGS.xLabel;
  });

  const payment = document.querySelector('.payment-value');
  if (payment) payment.textContent = settings.paymentMethods || DEFAULT_SETTINGS.paymentMethods;
  const contactNote = document.querySelector('.contact-note');
  if (contactNote) contactNote.textContent = `支払い方法：${settings.paymentMethods || DEFAULT_SETTINGS.paymentMethods}`;
}

loadSiteSettings().then(settings => {
  window.IROCHI_SITE_SETTINGS = settings;
  applySettings(settings);
});
