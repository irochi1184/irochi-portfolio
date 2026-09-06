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
lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ----- Portfolio presentation customizations -----
const customStyle = document.createElement('style');
customStyle.textContent = `
  .hero-title-custom {
    display: flex;
    flex-direction: column;
    gap: 10px;
    letter-spacing: .01em;
  }
  .hero-title-custom .line-one {
    display: inline-block;
    width: fit-content;
    font-size: clamp(34px, 4.5vw, 52px);
    line-height: 1.06;
    font-weight: 800;
    background: linear-gradient(135deg, #177f78 0%, #35b9ac 48%, #78ddd2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 10px 18px rgba(53,185,172,.16));
  }
  .hero-title-custom .line-two {
    display: inline-block;
    width: fit-content;
    padding: .18em .38em .16em;
    border-radius: 20px 26px 20px 26px;
    font-size: clamp(38px, 5.2vw, 62px);
    line-height: 1.06;
    color: #274e50;
    background: linear-gradient(135deg, rgba(255,185,216,.45), rgba(255,229,156,.48));
    box-shadow: 0 14px 32px rgba(80,170,160,.13);
    transform: rotate(-.6deg);
  }
  .hero-stats { display: none !important; }
  .boy-profile-card .boy-image-wrap {
    margin: 16px 0 16px;
    overflow: hidden;
    border-radius: 24px;
    border: 1px solid var(--line);
    background: #f7fffd;
    box-shadow: 0 14px 28px rgba(80,170,160,.10);
  }
  .boy-profile-card .boy-image-wrap img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }
  .boy-profile-card h3 { margin-bottom: 12px; }
  .commission-grid .extra-card a {
    color: var(--main-dark);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .payment-note {
    margin-top: 14px;
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(255,255,255,.18);
    font-size: 13px;
    color: rgba(255,255,255,.92);
  }
  @media (max-width: 720px) {
    .hero-title-custom .line-one { font-size: 34px; }
    .hero-title-custom .line-two { font-size: 40px; border-radius: 16px 20px 16px 20px; }
  }
`;
document.head.appendChild(customStyle);

const heroTitle = document.querySelector('.hero h1');
if (heroTitle) {
  heroTitle.classList.add('hero-title-custom');
  heroTitle.innerHTML = '<span class="line-one">ポップでかわいい</span><span class="line-two">目を引く女の子イラストを。</span>';
}

const profileCard = document.querySelector('.profile-card');
if (profileCard) {
  const profileText = profileCard.querySelector('p');
  if (profileText) {
    profileText.textContent = 'かわいい女の子イラストを中心に、男の子イラストも制作しています。やわらかな塗りと親しみやすい表情、配信映えする見た目づくりを大切にしています。';
  }
}

const strengthCard = document.querySelector('.strength-card');
if (strengthCard) {
  strengthCard.classList.add('boy-profile-card');
  strengthCard.innerHTML = `
    <span class="card-label">sample</span>
    <h3>男の子イラストも対応できます</h3>
    <div class="boy-image-wrap"><img src="assets/profile-boy.webp" alt="男の子イラストの見本" loading="lazy" decoding="async"></div>
    <p>女の子だけでなく、やわらかく親しみやすい雰囲気の男の子イラストにも対応できます。</p>
  `;
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
if (commissionHeadingText) {
  commissionHeadingText.textContent = '料金は用途や描き込み量に応じて調整できます。下記は目安です。ご依頼はXアカウントから受け付けています。';
}

const extraCard = document.querySelector('.commission-grid .extra-card');
if (extraCard) {
  extraCard.innerHTML = `
    <h3>ご依頼先・お支払い方法</h3>
    <div class="extra-list">
      <div><span>ご依頼先</span><strong><a href="https://x.com/_irochi_?s=11" target="_blank" rel="noopener">X @_irochi_</a></strong></div>
      <div><span>支払い方法</span><strong>PayPay / 銀行振込</strong></div>
      <div><span>ご相談内容</span><strong>用途・サイズ・納期など</strong></div>
    </div>
  `;
}

const contactCard = document.querySelector('.contact-card');
if (contactCard) {
  const heading = contactCard.querySelector('h2');
  const text = contactCard.querySelector('p:not(.eyebrow)');
  const buttons = contactCard.querySelector('.contact-buttons');
  const note = contactCard.querySelector('.contact-note');
  if (heading) heading.textContent = 'ご依頼・ご相談はこちら';
  if (text) text.textContent = '見積りだけ知りたい場合や、内容がまだ固まっていない段階でもお気軽にXからご相談ください。';
  if (buttons) buttons.innerHTML = '<a class="button primary" href="https://x.com/_irochi_?s=11" target="_blank" rel="noopener">Xで依頼する</a>';
  if (note) note.textContent = '支払い方法：PayPay / 銀行振込';
  else {
    const payment = document.createElement('p');
    payment.className = 'payment-note';
    payment.textContent = '支払い方法：PayPay / 銀行振込';
    contactCard.appendChild(payment);
  }
}
