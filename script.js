/* T-Conecta — comportamiento del sitio */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Menú móvil ─────────────────────────────────────────── */
  function initMenu() {
    var menu = document.getElementById('mobile-menu');
    var open = document.getElementById('menu-open');
    if (!menu || !open) return;

    function setOpen(state) {
      menu.hidden = !state;
      document.body.style.overflow = state ? 'hidden' : '';
    }

    open.addEventListener('click', function () { setOpen(true); });

    document.querySelectorAll('[data-menu-close]').forEach(function (el) {
      el.addEventListener('click', function () { setOpen(false); });
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) setOpen(false);
    });
  }

  /* ── Header: compacta el padding al hacer scroll ─────────── */
  function initHeaderScroll() {
    var header = document.querySelector('header');
    if (!header) return;
    header.style.transition = 'padding .3s ease';
    var ticking = false;

    function apply() {
      var compact = window.scrollY > 120;
      header.style.paddingTop = compact ? '10px' : '16px';
      header.style.paddingBottom = compact ? '10px' : '16px';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
  }

  /* ── Fade in de secciones al entrar en viewport ──────────── */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var hero = document.getElementById('top');
    if (!hero || !hero.parentElement) return;

    var targets = Array.prototype.filter.call(hero.parentElement.children, function (el) {
      return el.tagName === 'SECTION' && el.id !== 'top';
    });

    targets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity .7s cubic-bezier(.22,.9,.28,1), transform .7s cubic-bezier(.22,.9,.28,1)';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ── Entrada de la imagen del hero ───────────────────────── */
  function initHeroImage() {
    var img = document.getElementById('hero-img');
    if (!img) return;

    function reveal() {
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    }

    if (img.complete) requestAnimationFrame(reveal);
    else img.addEventListener('load', reveal);
    img.addEventListener('error', reveal);
  }

  /* ── Fondo animado de partículas (hero) ──────────────────── */
  function initParticles() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var host = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0, height = 0;

    function sync() {
      width = host.offsetWidth || 1;
      height = host.offsetHeight || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sync();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(sync).observe(host);
    else window.addEventListener('resize', sync);

    var mouse = { x: null, y: null, radius: 150 };
    window.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        mouse.x = null; mouse.y = null; return;
      }
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }, { passive: true });

    var palette = [
      { r: 0,   g: 240, b: 255 },
      { r: 89,  g: 217, b: 220 },
      { r: 139, g: 92,  b: 246 },
      { r: 168, g: 85,  b: 247 },
      { r: 201, g: 191, b: 255 }
    ];

    function Particle() { this.reset(true); }

    Particle.prototype.reset = function (init) {
      this.x = init ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
      this.y = init ? Math.random() * height : Math.random() * height;
      var angle = Math.random() * Math.PI * 2;
      var speed = 1.0 + Math.random() * 2.4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.radius = 1.0 + Math.random() * 2.5;
      this.color = palette[Math.floor(Math.random() * palette.length)];
      this.alpha = 0.35 + Math.random() * 0.6;
      this.currentAlpha = this.alpha;
      this.waveOffset = Math.random() * Math.PI * 2;
      this.waveSpeed = 0.04 + Math.random() * 0.04;
      this.depth = 0.6 + Math.random() * 0.9;
    };

    Particle.prototype.update = function () {
      this.waveOffset += this.waveSpeed;
      this.x += this.vx * this.depth + Math.sin(this.waveOffset) * 0.8;
      this.y += this.vy * this.depth + Math.cos(this.waveOffset) * 0.8;

      if (mouse.x !== null && mouse.y !== null) {
        var dx = this.x - mouse.x, dy = this.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          var force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 5.0;
          this.y += (dy / dist) * force * 5.0;
        }
      }

      this.currentAlpha = Math.max(0.15, Math.min(1, this.alpha + Math.sin(this.waveOffset * 1.5) * 0.25));

      if (this.x < -30) this.x = width + 30;
      else if (this.x > width + 30) this.x = -30;
      if (this.y < -30) this.y = height + 30;
      else if (this.y > height + 30) this.y = -30;
    };

    Particle.prototype.draw = function () {
      var c = this.color;
      ctx.save();
      ctx.shadowBlur = this.radius * 7;
      ctx.shadowColor = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.9)';
      ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + this.currentAlpha + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    var count = Math.min(130, Math.max(40, Math.floor((width * height) / 8000)));
    var list = [];
    for (var i = 0; i < count; i++) list.push(new Particle());

    function drawLines() {
      var maxDist = 125;
      for (var i = 0; i < list.length; i++) {
        for (var j = i + 1; j < list.length; j++) {
          var a = list[i], b = list[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= maxDist) continue;
          var factor = 1 - dist / maxDist;
          var alpha = factor * 0.22;
          var grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, 'rgba(' + a.color.r + ',' + a.color.g + ',' + a.color.b + ',' + alpha + ')');
          grad.addColorStop(1, 'rgba(' + b.color.r + ',' + b.color.g + ',' + b.color.b + ',' + alpha + ')');
          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = factor * 1.2;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    (function animate() {
      ctx.clearRect(0, 0, width, height);
      drawLines();
      for (var i = 0; i < list.length; i++) { list[i].update(); list[i].draw(); }
      requestAnimationFrame(animate);
    })();
  }

  /* ── Formulario de contacto ──────────────────────────────── */
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var btn = document.getElementById('submit-btn');
    var status = document.getElementById('form-status');
    var required = ['nombre', 'apellidos', 'email', 'celular', 'asunto', 'mensaje'];

    var enabledStyle = 'background:#59D9DC;color:#003738;cursor:pointer;box-shadow:0 0 24px 0 rgba(89,217,220,0.2);';
    var disabledStyle = 'background:#5A5C5C;color:#858A8C;cursor:not-allowed;box-shadow:none;';
    var baseStyle = "min-height:48px;border-radius:0;border:0;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;transition:background .25s ease,color .25s ease,box-shadow .25s ease;";

    function isReady() {
      var filled = required.every(function (n) {
        var el = form.elements[n];
        return el && String(el.value).trim() !== '';
      });
      var emailOk = form.elements.email ? form.elements.email.checkValidity() : false;
      var auth = form.elements.autorizacion ? form.elements.autorizacion.checked : false;
      return filled && emailOk && auth;
    }

    function refresh() {
      var ready = isReady();
      btn.disabled = !ready;
      btn.setAttribute('style', baseStyle + (ready ? enabledStyle : disabledStyle));
    }

    function say(msg) {
      if (!status) return;
      status.textContent = msg;
      status.hidden = !msg;
    }

    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
    refresh();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!isReady()) return;

      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });
      data.autorizacion = form.elements.autorizacion.checked;

      say('Enviando…');
      btn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('http');
          form.reset();
          refresh();
          say('¡Mensaje enviado! Te respondemos en menos de 24 horas hábiles.');
        })
        .catch(function () {
          refresh();
          say('No pudimos enviar el mensaje. Escríbenos a tconectasiempre@gmail.com.');
        });
    });
  }

  function init() {
    initMenu();
    initHeaderScroll();
    initReveal();
    initHeroImage();
    initParticles();
    initForm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
