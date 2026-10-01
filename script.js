const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const yearNode = document.getElementById('year');
const filterButtons = document.querySelectorAll('.filter-btn');
const menuItems = document.querySelectorAll('.menu-item');
const orderForm = document.querySelector('.order-form');
const testimonialGrid = document.getElementById('testimonialGrid');
const commentForm = document.getElementById('commentForm');
const receiptOverlay = document.getElementById('receiptOverlay');
const receiptClose = document.querySelector('.receipt-close');
const receiptConfirm = document.querySelector('.receipt-confirm');
const receiptHome = document.querySelector('.receipt-home');
const receiptComplete = document.getElementById('receiptComplete');
const receiptBarcode = document.getElementById('receiptBarcode');
const receiptOrderCode = document.getElementById('receiptOrderCode');
const orderItemsContainer = document.getElementById('orderItems');
const addItemButton = document.querySelector('.add-item-btn');
const commentStorageKey = 'mieAyamComments';

const defaultComments = [
  {
    name: 'Rina S.',
    rating: 5,
    message: 'Kaldu mie ayamnya gurih banget, porsinya pas, dan harganya ramah di kantong. Rekomended banget buat makan siang.'
  },
  {
    name: 'Andi P.',
    rating: 5,
    message: 'Pelayanan cepat, tempat bersih, dan rasa ayamnya enak banget. Pasti bakal datang lagi besok.'
  },
  {
    name: 'Siti A.',
    rating: 5,
    message: 'Cocok buat nongkrong santai keluarga. Minuman dan baksonya juga enak, terutama sambal dan pangsitnya.'
  }
];

const getComments = () => {
  try {
    const saved = localStorage.getItem(commentStorageKey);
    if (!saved) {
      localStorage.setItem(commentStorageKey, JSON.stringify(defaultComments));
      return [...defaultComments];
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultComments];
  } catch (error) {
    return [...defaultComments];
  }
};

const saveComments = (comments) => {
  localStorage.setItem(commentStorageKey, JSON.stringify(comments));
};

const renderStars = (rating) => '★'.repeat(Math.max(1, Number(rating) || 0)) + '☆'.repeat(Math.max(0, 5 - Math.max(1, Number(rating) || 0)));

const renderTestimonials = () => {
  if (!testimonialGrid) return;

  const comments = getComments();
  testimonialGrid.innerHTML = comments
    .map((comment) => {
      const stars = renderStars(comment.rating || 5);
      return `
        <article class="testimonial-card">
          <div class="stars">${stars}</div>
          <p>“${comment.message}”</p>
          <h4>${comment.name}</h4>
        </article>
      `;
    })
    .join('');
};

if (commentForm) {
  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(commentForm);
    const name = String(formData.get('commentName') || '').trim();
    const rating = Number(formData.get('commentRating') || 5);
    const message = String(formData.get('commentMessage') || '').trim();

    if (!name || !message) {
      alert('Nama dan komentar tidak boleh kosong.');
      return;
    }

    const comments = getComments();
    comments.unshift({
      name,
      rating: Math.min(5, Math.max(1, rating)),
      message,
    });

    saveComments(comments);
    renderTestimonials();
    commentForm.reset();
  });
}

renderTestimonials();

const menuPrices = {
  'Mie Ayam Spesial': 18000,
  'Mie Ayam Jamur': 20000,
  'Mie Ayam Pangsit': 21000,
  'Bakso Urat': 22000,
  'Bakso Mercon': 24000,
  'Bakso Keju': 23000,
  'Es Teh Manis': 5000,
  'Es Jeruk Segar': 7000,
  'Es Lemon Tea': 8000,
};

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));

    menuItems.forEach((item) => {
      const matches = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('hidden', !matches);
    });
  });
});

const formatRupiah = (value) => `Rp ${Number(value).toLocaleString('id-ID')}`;

const code39Patterns = {
  '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn', '9': 'nnwwnnwnn', A: 'wnnnnwnnw', B: 'nnwnnwnnw',
  C: 'wnwnnwnnn', D: 'nnnnwwnnw', E: 'wnnnwwnnn', F: 'nnwnwwnnn',
  G: 'nnnnnwwnw', H: 'wnnnnwwnn', I: 'nnwnnwwnn', J: 'nnnnwwwnn',
  K: 'wnnnnnnww', L: 'nnwnnnnww', M: 'wnwnnnnwn', N: 'nnnnwnnww',
  O: 'wnnnwnnwn', P: 'nnwnwnnwn', Q: 'nnnnnnnww', R: 'wnnnnnwnw',
  S: 'nnwnnnwnw', T: 'nnnnwnwnw', U: 'wwnnnnnnw', V: 'nwwnnnnnw',
  W: 'www nnnnnn'.replace(' ', ''), X: 'nwnnwnnnw', Y: 'wwnnwnnnn',
  Z: 'nwwnwnnnn', '-': 'nwnnnnwnw', '*': 'nwnnwnwnn',
};

const renderCode39 = (value) => {
  if (!receiptBarcode) return;

  const encoded = `*${value}*`;
  let x = 0;
  const bars = [];

  [...encoded].forEach((character, characterIndex) => {
    const pattern = code39Patterns[character];
    if (!pattern) return;

    [...pattern].forEach((width, index) => {
      const barWidth = width === 'w' ? 5 : 2;
      if (index % 2 === 0) {
        bars.push(`<rect x="${x}" y="0" width="${barWidth}" height="56"/>`);
      }
      x += barWidth;
    });

    if (characterIndex < encoded.length - 1) x += 2;
  });

  receiptBarcode.setAttribute('viewBox', `0 0 ${x} 56`);
  receiptBarcode.innerHTML = bars.join('');
};

const createOrderRow = () => {
  const row = document.createElement('div');
  row.className = 'order-item-row';
  row.innerHTML = `
    <div class="order-field">
      <label>
        Pilih menu
        <select class="menu-select" required>
          <option value="">-- Pilih menu --</option>
          <option value="Mie Ayam Spesial">Mie Ayam Spesial</option>
          <option value="Mie Ayam Jamur">Mie Ayam Jamur</option>
          <option value="Mie Ayam Pangsit">Mie Ayam Pangsit</option>
          <option value="Bakso Urat">Bakso Urat</option>
          <option value="Bakso Mercon">Bakso Mercon</option>
          <option value="Bakso Keju">Bakso Keju</option>
          <option value="Es Teh Manis">Es Teh Manis</option>
          <option value="Es Jeruk Segar">Es Jeruk Segar</option>
          <option value="Es Lemon Tea">Es Lemon Tea</option>
        </select>
      </label>
    </div>
    <div class="order-field qty-field">
      <label>
        Qty
        <input class="qty-input" type="number" min="1" value="1" required />
      </label>
    </div>
    <button class="remove-item" type="button" aria-label="Hapus menu">Hapus</button>
  `;

  row.querySelector('.remove-item').addEventListener('click', () => {
    if (orderItemsContainer && orderItemsContainer.querySelectorAll('.order-item-row').length > 1) {
      row.remove();
    }
  });

  return row;
};

if (addItemButton && orderItemsContainer) {
  addItemButton.addEventListener('click', () => {
    orderItemsContainer.appendChild(createOrderRow());
  });
}

if (orderItemsContainer) {
  orderItemsContainer.querySelectorAll('.remove-item').forEach((button) => {
    button.addEventListener('click', () => {
      const rows = orderItemsContainer.querySelectorAll('.order-item-row');
      if (rows.length > 1) {
        button.closest('.order-item-row')?.remove();
      }
    });
  });
}

const openReceipt = ({ name, phone, items, note }) => {
  if (!receiptOverlay) return;

  const orderCode = `MA${Date.now().toString(36).toUpperCase()}`;
  if (receiptComplete) receiptComplete.classList.add('hidden');
  if (receiptConfirm) receiptConfirm.classList.remove('hidden');
  if (receiptOrderCode) receiptOrderCode.textContent = orderCode;
  renderCode39(orderCode);

  const safeName = name || 'Pelanggan';
  const safePhone = phone || '-';
  const safeNote = note && note.trim() ? note.trim() : '-';
  const total = items.reduce((sum, item) => sum + (menuPrices[item.menu] || 0) * item.qty, 0);

  document.getElementById('receiptName').textContent = safeName;
  document.getElementById('receiptPhone').textContent = safePhone;
  document.getElementById('receiptNote').textContent = safeNote;
  document.getElementById('receiptTotal').textContent = formatRupiah(total);

  const receiptItems = document.getElementById('receiptItems');
  if (receiptItems) {
    receiptItems.innerHTML = items
      .map((item) => {
        const subtotal = (menuPrices[item.menu] || 0) * item.qty;
        return `
          <div class="receipt-item">
            <div>
              <strong>${item.menu}</strong><br />
              <span>${item.qty}x @ ${formatRupiah(menuPrices[item.menu] || 0)}</span>
            </div>
            <strong>${formatRupiah(subtotal)}</strong>
          </div>
        `;
      })
      .join('');
  }

  receiptOverlay.classList.remove('hidden');
  receiptOverlay.setAttribute('aria-hidden', 'false');
};

const closeReceipt = () => {
  if (!receiptOverlay) return;
  receiptOverlay.classList.add('hidden');
  receiptOverlay.setAttribute('aria-hidden', 'true');
};

if (receiptClose) {
  receiptClose.addEventListener('click', closeReceipt);
}

if (receiptOverlay) {
  receiptOverlay.addEventListener('click', (event) => {
    if (event.target === receiptOverlay) {
      closeReceipt();
    }
  });
}

if (receiptConfirm) {
  receiptConfirm.addEventListener('click', () => {
    receiptComplete?.classList.remove('hidden');
    receiptConfirm.classList.add('hidden');
  });
}

if (receiptHome) {
  receiptHome.addEventListener('click', () => {
    closeReceipt();
    if (window.location.hash) {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (orderForm) {
      orderForm.reset();
      const firstRow = orderItemsContainer?.querySelector('.order-item-row');
      if (firstRow) {
        const select = firstRow.querySelector('.menu-select');
        const qty = firstRow.querySelector('.qty-input');
        if (select) select.value = '';
        if (qty) qty.value = 1;
      }
    }
  });
}

if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(orderForm);
    const name = formData.get('name') || 'Pelanggan';
    const phone = formData.get('phone') || '-';
    const note = formData.get('note') || '';

    const menuRows = Array.from(orderItemsContainer?.querySelectorAll('.order-item-row') || []);
    const items = menuRows
      .map((row) => {
        const select = row.querySelector('.menu-select');
        const qtyInput = row.querySelector('.qty-input');
        const menu = select?.value || '';
        const qty = Number(qtyInput?.value || 0);

        if (!menu || qty <= 0) return null;
        return { menu, qty };
      })
      .filter(Boolean);

    if (!items.length) {
      alert('Pilih minimal satu menu sebelum melanjutkan pembayaran.');
      return;
    }

    openReceipt({ name, phone, items, note });
  });
}
