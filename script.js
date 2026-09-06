const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
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
      card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
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
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

const editorialStyle = document.createElement('link');
editorialStyle.rel = 'stylesheet';
editorialStyle.href = 'hero-v2.css';
document.head.appendChild(editorialStyle);

const hero = document.querySelector('.hero');
if (hero) {
  const mainImage = hero.querySelector('.main-card img');
  const topImage = hero.querySelector('.card-top img');
  const bottomImage = hero.querySelector('.card-bottom img');
  const mainSrc = mainImage?.getAttribute('src') || 'assets/work-20260907-054924-replace-1788727764575.webp';
  const mainAlt = mainImage?.getAttribute('alt') || 'メインイラスト';
  const mainPosition = mainImage?.style.objectPosition || '50% 35%';
  const topSrc = topImage?.getAttribute('src') || mainSrc;
  const topAlt = topImage?.getAttribute('alt') || '作品イラスト';
  const bottomSrc = bottomImage?.getAttribute('src') || mainSrc;
  const bottomAlt = bottomImage?.getAttribute('alt') || '作品イラスト';
  hero.className = 'hero hero-editorial section-shell';
  hero.innerHTML = `
    <div class="hero-editorial-copy reveal">
      <p class="hero-kicker">IROCHI — ILLUSTRATOR</p>
      <h1 class="hero-brand">irochi<i>.</i></h1>
      <p class="hero-tagline">かわいいを、ひとつの絵に。</p>
      <div class="hero-editorial-actions">
        <a class="hero-editorial-link" href="#works">WORKS</a>
        <a class="hero-editorial-link" href="#commission">COMMISSION</a>
      </div>
    </div>
    <div class="hero-editorial-visual reveal" aria-label="selected works">
      <figure class="hero-art-main"><img src="${mainSrc}" alt="${mainAlt}" fetchpriority="high" decoding="async" style="object-position:${mainPosition}"></figure>
      <figure class="hero-art-mini one"><img src="${topSrc}" alt="${topAlt}" decoding="async"></figure>
      <figure class="hero-art-mini two"><img src="${bottomSrc}" alt="${bottomAlt}" decoding="async"></figure>
      <span class="hero-edition">illustration portfolio / 2026</span>
    </div>`;
}

const aboutGrid = document.querySelector('.about-grid');
const profileCard = document.querySelector('.profile-card');
const strengthCard = document.querySelector('.strength-card, .boy-profile-card');
const profileImagePath = document.querySelector('meta[name="irochi-profile-image"]')?.getAttribute('content') || 'assets/irochi-profile.webp';
if (aboutGrid && profileCard) {
  aboutGrid.classList.add('irochi-profile-layout');
  profileCard.classList.add('irochi-profile-card');
  profileCard.innerHTML = `
    <div class="irochi-profile-copy">
      <span class="card-label">creator</span>
      <h3>irochi</h3>
      <p>かわいい女の子イラストを中心に制作。やわらかな塗りと、配信やSNSで印象に残る表情づくりを大切にしています。</p>
      <ul><li>一枚絵 / 立ち絵 / アイコン / サムネイル</li><li>配信向け / 記念イラスト</li></ul>
    </div>
    <div class="irochi-profile-media">
      <img src="${profileImagePath}" alt="irochi の活動イメージイラスト" loading="lazy" decoding="async">
    </div>`;
  strengthCard?.remove();
}

const priceCards = [...document.querySelectorAll('.price-card')];
const priceSettings = [
  { title: 'SNSアイコン', price: '¥4,000〜', items: ['顔まわり〜バストアップ', '簡易背景', '個人利用向け'] },
  { title: '一枚絵', price: '¥7,000〜', items: ['人物1名', '背景なし〜簡易背景', '配信・サムネイル向け'] },
  { title: '立ち絵', price: '¥10,000〜', items: ['全身', '背景透過', '配信用・紹介用におすすめ'] },
  { title: '背景あり記念イラスト', price: '¥12,000〜', items: ['誕生日・周年向け', '背景あり', '華やかな仕上がり'] }
];
priceCards.slice(0, 4).forEach((card, index) => {
  const setting = priceSettings[index];
  if (!setting) return;
  const title = card.querySelector('h3');
  const price = card.querySelector('.price');
  const list = card.querySelector('ul');
  if (title) title.textContent = setting.title;
  if (price) price.textContent = setting.price;
  if (list) list.innerHTML = setting.items.map(item => `<li>${item}</li>`).join('');
});

const commissionHeadingText = document.querySelector('.commission-section .section-heading > p');
if (commissionHeadingText) commissionHeadingText.textContent = '料金は用途や描き込み量に応じて調整できます。下記は目安です。ご依頼はXから受け付けています。';
const extraCard = document.querySelector('.commission-grid .extra-card');
if (extraCard) extraCard.innerHTML = `<h3>ご依頼先・お支払い方法</h3><div class="extra-list"><div><span>ご依頼先</span><strong><a href="https://x.com/_irochi_?s=11" target="_blank" rel="noopener">X @_irochi_</a></strong></div><div><span>支払い方法</span><strong>PayPay / 銀行振込</strong></div><div><span>ご相談内容</span><strong>用途・サイズ・納期など</strong></div></div>`;
const contactCard = document.querySelector('.contact-card');
if (contactCard) {
  const heading = contactCard.querySelector('h2');
  const text = contactCard.querySelector('p:not(.eyebrow)');
  const buttons = contactCard.querySelector('.contact-buttons');
  const note = contactCard.querySelector('.contact-note');
  if (heading) heading.textContent = 'ご依頼・ご相談はこちら';
  if (text) text.textContent = '見積りだけ知りたい場合も、Xからお気軽にご相談ください。';
  if (buttons) buttons.innerHTML = '<a class="button primary" href="https://x.com/_irochi_?s=11" target="_blank" rel="noopener">Xで依頼する</a>';
  if (note) note.textContent = '支払い方法：PayPay / 銀行振込';
}

// Rich motion layer: loaded after the dynamic hero/profile markup is built.
const motionStyle = document.createElement('link');
motionStyle.rel = 'stylesheet';
motionStyle.href = 'motion.css';
document.head.appendChild(motionStyle);

const motionScript = document.createElement('script');
motionScript.src = 'motion.js';
motionScript.defer = true;
document.body.appendChild(motionScript);
