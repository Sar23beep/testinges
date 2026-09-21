/**
 * Escort Call in Nodia - Standalone Frontend App Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentSector = 'all';
  let currentCategory = 'All';
  let searchQuery = '';

  // DOM Elements
  const sectorPillsContainer = document.getElementById('sectorPills');
  const categorySelect = document.getElementById('categorySelect');
  const searchInput = document.getElementById('searchInput');
  const profilesGrid = document.getElementById('profilesGrid');
  const profileCountEl = document.getElementById('profileCount');
  const activeSectorTitleEl = document.getElementById('activeSectorTitle');

  // Modal Elements
  const modalOverlay = document.getElementById('profileModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalName = document.getElementById('modalName');
  const modalAge = document.getElementById('modalAge');
  const modalHeight = document.getElementById('modalHeight');
  const modalSector = document.getElementById('modalSector');
  const modalAvailability = document.getElementById('modalAvailability');
  const modalLanguages = document.getElementById('modalLanguages');
  const modalRateShort = document.getElementById('modalRateShort');
  const modalRateNight = document.getElementById('modalRateNight');
  const modalBio = document.getElementById('modalBio');
  const modalBadge = document.getElementById('modalBadge');
  const modalMainImg = document.getElementById('modalMainImg');
  const modalThumbs = document.getElementById('modalThumbs');
  const modalWaBtn = document.getElementById('modalWaBtn');
  const modalCallBtn = document.getElementById('modalCallBtn');

  // Direct Phone & WhatsApp
  const PHONE_NUMBER = "6351615378";
  const WA_NUMBER = "916351615378";

  function getWaUrl(profileName, sector) {
    const text = `Hello, I want to book verified companion ${profileName} in Noida ${sector}. Please share real photos and availability.`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  // 1. Render Sector Buttons
  function renderSectorPills() {
    if (!sectorPillsContainer) return;
    sectorPillsContainer.innerHTML = '';
    NOIDA_SECTORS.forEach(sec => {
      const btn = document.createElement('button');
      btn.className = `sector-btn ${sec.id === currentSector ? 'active' : ''}`;
      btn.dataset.sector = sec.id;
      btn.innerHTML = `
        <span>${sec.name}</span>
        <span class="sec-badge">${sec.count}</span>
      `;
      btn.addEventListener('click', () => {
        setSector(sec.id);
      });
      sectorPillsContainer.appendChild(btn);
    });
  }

  // 2. Render Category Select
  function renderCategories() {
    if (!categorySelect) return;
    categorySelect.innerHTML = '';
    NOIDA_CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat === 'All' ? '⭐ All Categories' : cat;
      categorySelect.appendChild(opt);
    });
  }

  // 3. Filter Logic
  function getFilteredProfiles() {
    return NOIDA_PROFILES.filter(p => {
      const matchSector = (currentSector === 'all') || (p.sectorSlug === currentSector);
      const matchCategory = (currentCategory === 'All') || (p.category === currentCategory);
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        p.name.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
      return matchSector && matchCategory && matchSearch;
    });
  }

  // 4. Render Profile Cards
  function renderProfiles() {
    if (!profilesGrid) return;
    const filtered = getFilteredProfiles();

    if (profileCountEl) {
      profileCountEl.textContent = `${filtered.length} Girls Available Now`;
    }

    const secObj = NOIDA_SECTORS.find(s => s.id === currentSector);
    if (activeSectorTitleEl) {
      if (secObj && secObj.id !== 'all') {
        activeSectorTitleEl.innerHTML = `Available Call Girls in <span>${secObj.name}</span>`;
      } else {
        activeSectorTitleEl.innerHTML = `🔥 Top Call Girls in <span>Noida All Sectors</span>`;
      }
    }

    if (filtered.length === 0) {
      profilesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: var(--bg-card); border: 1px dashed var(--border-gold); border-radius: var(--radius-md);">
          <h3 style="color: var(--accent-gold); font-size: 1.4rem; margin-bottom: 8px;">No Profiles in this filter</h3>
          <p style="color: var(--text-muted); margin-bottom: 16px;">Try selecting another sector or category.</p>
          <button class="btn-card-call" style="display:inline-block; padding: 10px 20px;" onclick="window.resetFilters()">Show All Profiles</button>
        </div>
      `;
      return;
    }

    profilesGrid.innerHTML = filtered.map(p => {
      const ribbonClass = p.badge === 'VVIP' ? 'ribbon-vvip' : (p.badge === 'VIP' ? 'ribbon-vip' : 'ribbon-hot');
      const waUrl = getWaUrl(p.name, p.sector);

      return `
        <article class="escort-card" data-id="${p.id}">
          <div class="card-img-wrapper" onclick="window.openProfileModal('${p.id}')">
            <img src="${p.mainImage}" alt="${p.name} in Noida ${p.sector}" class="card-photo" loading="lazy" />
            <span class="ribbon-badge ${ribbonClass}">${p.badge === 'VVIP' ? '👑 VVIP Model' : (p.badge === 'VIP' ? '⭐ VIP Escort' : '🔥 100% Real')}</span>
            <span class="ribbon-sector">📍 ${p.sector}</span>
            <span class="ribbon-available">● Available Now</span>
          </div>

          <div class="card-details">
            <div class="card-name-row">
              <h3 class="model-name" onclick="window.openProfileModal('${p.id}')" style="cursor:pointer">${p.name}</h3>
              <span class="model-age">${p.age} Yrs</span>
            </div>

            <div class="card-location">📍 ${p.locality}</div>

            <div class="card-features">
              <span class="feat-tag feat-cat">${p.category}</span>
              <span class="feat-tag">Incall / Outcall</span>
              <span class="feat-tag">Zero Advance</span>
            </div>

            <div class="price-strip">
              <div>
                <span class="price-unit">1 Hour (1 Shot)</span>
                <div class="price-val">${p.rateShort}</div>
              </div>
              <div style="text-align: right;">
                <span class="price-unit">Full Night</span>
                <div class="price-val" style="font-size: 0.95rem; color: #ff80b3;">${p.rateNight}</div>
              </div>
            </div>

            <div class="card-dual-actions">
              <a href="tel:${PHONE_NUMBER}" class="btn-card-call">
                <span>📞 Call Now</span>
              </a>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-wa">
                <span>💬 WhatsApp</span>
              </a>
            </div>

            <div style="text-align: center; margin-top: 10px;">
              <span onclick="window.openProfileModal('${p.id}')" style="color: var(--accent-gold); font-size: 0.78rem; font-weight: 700; cursor: pointer; text-decoration: underline;">
                👁️ View ${p.images.length} Photos & Details →
              </span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // 5. Open Profile Modal
  window.openProfileModal = function(profileId) {
    const p = NOIDA_PROFILES.find(item => item.id === profileId);
    if (!p || !modalOverlay) return;

    modalName.textContent = p.name;
    modalAge.textContent = `${p.age} Years`;
    modalHeight.textContent = p.height;
    modalSector.textContent = `📍 ${p.sector} (${p.locality})`;
    modalAvailability.textContent = p.availability;
    modalLanguages.textContent = p.languages.join(', ');
    modalRateShort.textContent = p.rateShort;
    modalRateNight.textContent = p.rateNight;
    modalBio.textContent = p.bio;

    modalBadge.className = `ribbon-badge ${p.badge === 'VVIP' ? 'ribbon-vvip' : (p.badge === 'VIP' ? 'ribbon-vip' : 'ribbon-hot')}`;
    modalBadge.textContent = p.badge;

    // Gallery
    modalMainImg.src = p.mainImage;
    modalMainImg.alt = `${p.name} Noida ${p.sector}`;

    modalThumbs.innerHTML = p.images.map((imgSrc, idx) => `
      <div class="modal-thumb-item ${idx === 0 ? 'active' : ''}" onclick="window.switchModalImage('${imgSrc}', this)">
        <img src="${imgSrc}" alt="${p.name} photo ${idx + 1}" />
      </div>
    `).join('');

    // Action Links
    const waUrl = getWaUrl(p.name, p.sector);
    modalWaBtn.href = waUrl;
    modalCallBtn.href = `tel:${PHONE_NUMBER}`;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.switchModalImage = function(imgSrc, thumbEl) {
    modalMainImg.src = imgSrc;
    document.querySelectorAll('.modal-thumb-item').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  };

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) closeModal();
  });

  // 6. Set Sector
  function setSector(sectorId) {
    currentSector = sectorId;
    document.querySelectorAll('.sector-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sector === sectorId);
    });
    renderProfiles();
    
    const el = document.getElementById('listingSection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  window.setSector = setSector;

  // 7. Inputs
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      renderProfiles();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProfiles();
    });
  }

  window.resetFilters = function() {
    currentSector = 'all';
    currentCategory = 'All';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'All';
    renderSectorPills();
    renderProfiles();
  };

  // 8. FAQ Accordion
  document.querySelectorAll('.faq-q-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.parentElement;
      const wasActive = card.classList.contains('active');
      document.querySelectorAll('.faq-card').forEach(c => c.classList.remove('active'));
      if (!wasActive) card.classList.add('active');
    });
  });

  // 9. Init
  renderSectorPills();
  renderCategories();
  renderProfiles();

  // Hash Navigation
  const hash = window.location.hash;
  if (hash.startsWith('#sector-')) {
    const sId = hash.replace('#', '');
    if (NOIDA_SECTORS.some(s => s.id === sId)) {
      setSector(sId);
    }
  }
});
