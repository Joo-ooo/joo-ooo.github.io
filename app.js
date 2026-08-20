(function () {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  const SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 1.8v2.2M12 20v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M1.8 12H4M20 12h2.2M4.4 19.6 6 18M18 6l1.6-1.6"/></svg>';
  const MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
  const toggle = document.querySelector('[data-theme-toggle]');
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  function applyTheme() {
    root.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.innerHTML = theme === 'dark' ? SUN : MOON;
      toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    }
    drawGrid();
  }
  applyTheme();
  toggle && toggle.addEventListener('click', function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  });

  /* ---------- Year ---------- */
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Header scroll state + progress ---------- */
  const hdr = document.getElementById('hdr');
  const bar = document.getElementById('bar');
  function onScroll() {
    const y = window.scrollY;
    hdr.classList.toggle('is-scrolled', y > 8);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
  }
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Active nav link ---------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  const sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    const navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a, i) { a.classList.toggle('is-active', sections[i] === e.target); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { s && navObs.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealables = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    const ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        const el = e.target;
        setTimeout(function () { el.classList.add('is-in'); }, i * 70);
        ro.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- Count-up metrics ---------- */
  const nums = document.querySelectorAll('.num');
  function countUp(el) {
    const to = parseFloat(el.dataset.to);
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = to + suffix; return; }
    const dur = 1100;
    const start = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  if ('IntersectionObserver' in window) {
    const no = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(e.target);
        no.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { no.observe(n); });
  } else {
    nums.forEach(countUp);
  }

  /* ---------- Hero word rotator ---------- */
  const rot = document.getElementById('rot');
  if (rot) {
    const words = ['backends', 'agentic RAG', 'data pipelines', 'clean APIs'];
    let wi = 0, ci = words[0].length, deleting = true;
    if (reduce) {
      setInterval(function () { wi = (wi + 1) % words.length; rot.textContent = words[wi]; }, 2600);
    } else {
      (function tick() {
        const w = words[wi];
        if (deleting) {
          ci--;
          if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
        } else {
          ci++;
          if (ci >= w.length) { deleting = true; rot.textContent = w; return setTimeout(tick, 1900); }
        }
        rot.textContent = words[wi].slice(0, ci);
        setTimeout(tick, deleting ? 42 : 78);
      })();
    }
  }

  /* ---------- Hero canvas grid ---------- */
  var cv = document.getElementById('grid');
  var ctx = cv && cv.getContext('2d');
  var mouse = { x: -999, y: -999 };
  function drawGrid() {
    if (!ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const line = getComputedStyle(root).getPropertyValue('--grid-line').trim() || 'rgba(0,0,0,.05)';
    const accent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#10574f';
    const gap = 34;
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    for (let x = gap; x < w; x += gap) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke(); }
    for (let y = gap; y < h; y += gap) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }
    // glow dots near cursor
    if (mouse.x > -100) {
      for (let x = gap; x < w; x += gap) {
        for (let y = gap; y < h; y += gap) {
          const d = Math.hypot(x - mouse.x, y - mouse.y);
          if (d < 130) {
            const a = (1 - d / 130) * 0.55;
            ctx.beginPath();
            ctx.fillStyle = accent;
            ctx.globalAlpha = a;
            ctx.arc(x, y, 1.9, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }
    }
    // fade the grid out toward the bottom so it doesn't fight the next section
    ctx.globalCompositeOperation = 'destination-out';
    const fade = ctx.createLinearGradient(0, h * 0.45, 0, h);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, h * 0.45, w, h * 0.55);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (ctx) {
    drawGrid();
    addEventListener('resize', drawGrid);
    if (!reduce) {
      let raf = null;
      cv.parentElement.addEventListener('pointermove', function (e) {
        const r = cv.getBoundingClientRect();
        mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
        if (!raf) raf = requestAnimationFrame(function () { raf = null; drawGrid(); });
      });
      cv.parentElement.addEventListener('pointerleave', function () { mouse = { x: -999, y: -999 }; drawGrid(); });
    }
  }

  /* ---------- Timeline accordion ---------- */
  document.querySelectorAll('.tl__btn').forEach(function (btn) {
    const item = btn.closest('.tl__item');
    if (btn.getAttribute('aria-expanded') === 'true') item.classList.add('is-open');
    btn.addEventListener('click', function () {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
    });
  });

  /* ---------- Project filters ---------- */
  const chips = document.querySelectorAll('.chip');
  const cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  const empty = document.getElementById('empty');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.toggle('is-on', c === chip); });
      const f = chip.dataset.filter;
      let shown = 0;
      cards.forEach(function (card) {
        const match = f === 'all' || (card.dataset.tags || '').split(' ').indexOf(f) > -1;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  });

  /* ---------- Toast ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2000);
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const val = btn.dataset.copy;
      const done = function () {
        toast('Email copied — ' + val);
        const label = btn.querySelector('.copy-label');
        if (label) { const old = label.textContent; label.textContent = 'Copied'; setTimeout(function () { label.textContent = old; }, 1800); }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(done).catch(function () { toast(val); });
      } else {
        const ta = document.createElement('textarea');
        ta.value = val; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast(val); }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- Command palette ---------- */
  const ITEMS = [
    { label: 'Experience', hint: 'section', href: '#work' },
    { label: 'Projects', hint: 'section', href: '#projects' },
    { label: 'Capstone — AMS-RAG', hint: 'case study', href: '#capstone' },
    { label: 'Stack', hint: 'section', href: '#stack' },
    { label: 'About', hint: 'section', href: '#about' },
    { label: 'Contact', hint: 'section', href: '#contact' },
    { label: 'GitHub profile', hint: 'external', href: 'https://github.com/Joo-ooo', ext: true },
    { label: 'AMS-RAG repository', hint: 'external', href: 'https://github.com/Joo-ooo/AMS-RAG', ext: true },
    { label: 'Email Heng Joo', hint: 'mailto', href: 'mailto:hengjoo7267@gmail.com', ext: true },
    { label: 'Toggle theme', hint: 'action', action: function () { theme = theme === 'dark' ? 'light' : 'dark'; applyTheme(); } }
  ];
  const pal = document.getElementById('pal');
  const palq = document.getElementById('palq');
  const pallist = document.getElementById('pallist');
  let sel = 0, filtered = ITEMS.slice();

  function render() {
    pallist.innerHTML = '';
    filtered.forEach(function (it, i) {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.className = i === sel ? 'is-sel' : '';
      li.innerHTML = '<span>' + it.label + '</span><span>' + it.hint + '</span>';
      li.addEventListener('mouseenter', function () { sel = i; render(); });
      li.addEventListener('click', function () { run(it); });
      pallist.appendChild(li);
    });
  }
  function openPal() {
    pal.hidden = false; palq.value = ''; filtered = ITEMS.slice(); sel = 0; render();
    setTimeout(function () { palq.focus(); }, 20);
  }
  function closePal() { pal.hidden = true; }
  function run(it) {
    closePal();
    if (it.action) return it.action();
    if (it.ext) return window.open(it.href, '_blank', 'noopener');
    const t = document.querySelector(it.href);
    t && t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  document.querySelectorAll('[data-open-palette]').forEach(function (b) { b.addEventListener('click', openPal); });
  document.querySelectorAll('[data-close-palette]').forEach(function (b) { b.addEventListener('click', closePal); });
  palq && palq.addEventListener('input', function () {
    const q = palq.value.toLowerCase();
    filtered = ITEMS.filter(function (it) { return it.label.toLowerCase().indexOf(q) > -1; });
    sel = 0; render();
  });
  /* ---------- Pipeline tabs ---------- */
  const ptabs = Array.prototype.slice.call(document.querySelectorAll('.ptab'));
  ptabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      ptabs.forEach(function (t) {
        const on = t === tab;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        if (panel) { panel.hidden = !on; panel.classList.toggle('is-on', on); }
      });
    });
    tab.addEventListener('keydown', function (e) {
      const i = ptabs.indexOf(tab);
      let n = -1;
      if (e.key === 'ArrowRight') n = (i + 1) % ptabs.length;
      if (e.key === 'ArrowLeft') n = (i - 1 + ptabs.length) % ptabs.length;
      if (n > -1) { e.preventDefault(); ptabs[n].click(); ptabs[n].focus(); }
    });
  });

  /* ---------- One video at a time ---------- */
  const vids = Array.prototype.slice.call(document.querySelectorAll('.demo video'));
  vids.forEach(function (v) {
    v.addEventListener('play', function () {
      vids.forEach(function (o) { if (o !== v && !o.paused) o.pause(); });
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lb');
  const lbimg = document.getElementById('lbimg');
  const lbhint = lb && lb.querySelector('.lb__hint');
  let lbOpener = null;

  function openLb(src, alt, opener) {
    if (!lb || !lbimg) return;
    lbimg.src = src;
    lbimg.alt = alt || '';
    const wide = !!(opener && opener.hasAttribute('data-zoom-wide'));
    lb.classList.toggle('lb--wide', wide);
    if (lbhint) {
      lbhint.textContent = wide ? 'Scroll sideways to read the full diagram · Esc to close' : 'Esc to close';
    }
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lbOpener = opener || null;
    const close = lb.querySelector('.lb__close');
    close && close.focus();
  }
  function closeLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = '';
    lbimg.src = '';
    if (lbOpener) { lbOpener.focus(); lbOpener = null; }
  }
  document.querySelectorAll('[data-zoom]').forEach(function (b) {
    b.addEventListener('click', function () {
      openLb(b.getAttribute('data-zoom'), b.getAttribute('data-zoom-alt'), b);
    });
  });
  document.querySelectorAll('[data-close-lb]').forEach(function (b) { b.addEventListener('click', closeLb); });

  addEventListener('keydown', function (e) {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (lb && !lb.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
      return;
    }
    if (!pal.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); return closePal(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(filtered.length - 1, sel + 1); return render(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); return render(); }
      if (e.key === 'Enter') { e.preventDefault(); return filtered[sel] && run(filtered[sel]); }
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'k' || e.key === 'K') { e.preventDefault(); openPal(); }
  });
})();
