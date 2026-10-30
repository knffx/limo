// 客户端交互：扭蛋 + 配色器。无依赖。

(function () {
  'use strict';

  var reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------- 扭蛋（只在 /lab/gacha/ 上启用） ----------------

  var dataEl = document.getElementById('gacha-data');
  var section = document.getElementById('gacha');

  if (dataEl && section) {
    var data = JSON.parse(dataEl.textContent);
    var lineEl = document.getElementById('gachaLine');
    var labelEl = document.getElementById('gachaLabel');
    var spinBtn = document.getElementById('gachaSpin');
    var againBtn = document.getElementById('gachaAgain');
    var defaultLabel = labelEl ? labelEl.textContent : '';
    var busy = false;

    function pick() {
      var rare = Math.random() < (data.rareChance || 0);
      var pool = rare ? data.rare : data.common;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function spin() {
      if (busy) return;
      busy = true;

      section.classList.remove('is-revealed');
      section.removeAttribute('data-mood');
      lineEl.textContent = '';
      if (againBtn) againBtn.hidden = true;
      if (spinBtn) spinBtn.hidden = true;
      if (labelEl) labelEl.textContent = defaultLabel;

      var result = pick();
      var delay = reduced ? 0 : 620;

      window.setTimeout(function () {
        lineEl.textContent = result.text;
        section.setAttribute('data-mood', result.mood);
        if (result.mood === 'rare' && labelEl) labelEl.textContent = data.rareLabel;
        section.classList.add('is-revealed');
        if (againBtn) againBtn.hidden = false;
        busy = false;
      }, delay);
    }

    if (spinBtn) spinBtn.addEventListener('click', spin);
    if (againBtn) againBtn.addEventListener('click', spin);

    // ?spin=1 直接抽一次，方便截图和分享
    try {
      if (new URLSearchParams(window.location.search).has('spin')) spin();
    } catch (err) {}
  }

  // ---------------- 转场：色块 wipe（只挂在大跨越的链接上） ----------------

  var wipe = document.getElementById('wipe');
  if (wipe && !reduced) {
    var wipeLabel = document.getElementById('wipeLabel');

    var inkFor = function (hex) {
      var n = parseInt(hex.replace('#', ''), 16);
      var r = (n >> 16) & 255;
      var g = (n >> 8) & 255;
      var b = n & 255;
      var lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return lum > 0.62 ? '#0E0D0C' : '#F2EFE9';
    };

    // 新页面加载时，色块已经盖住屏幕，滑出去
    if (document.documentElement.classList.contains('wipe-in')) {
      wipe.style.transform = 'translateX(0)';
      document.documentElement.classList.remove('wipe-in');
      wipe.classList.add('is-out');
      window.setTimeout(function () {
        wipe.classList.remove('is-out');
        wipe.style.transform = '';
      }, 340);
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-wipe]');
      if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target && a.target !== '_self') return;

      var color = a.getAttribute('data-wipe-color') || '#C63A32';
      var label = a.getAttribute('data-wipe') || '';

      e.preventDefault();

      wipe.style.background = color;
      wipe.style.setProperty('--wipe-ink', inkFor(color));
      if (wipeLabel) wipeLabel.textContent = label;

      try {
        sessionStorage.setItem('limo-wipe', '1');
      } catch (err) {}

      wipe.classList.add('is-in');

      window.setTimeout(function () {
        window.location.href = a.href;
      }, 300);
    });

    // 从 bfcache 回来时，别让色块留在屏幕上
    window.addEventListener('pageshow', function (ev) {
      if (!ev.persisted) return;
      document.documentElement.classList.remove('wipe-in');
      wipe.classList.remove('is-in', 'is-out');
      wipe.style.transform = '';
    });
  }

  // ---------------- 配色器 ----------------

  var palette = document.getElementById('palette');
  if (palette) {
    var hueEl = document.getElementById('hue');
    var satEl = document.getElementById('sat');
    var lightEl = document.getElementById('light');
    var hueOut = document.getElementById('hueOut');
    var satOut = document.getElementById('satOut');
    var lightOut = document.getElementById('lightOut');
    var chipsEl = document.getElementById('chips');
    var statusEl = document.getElementById('status');

    function hsl(h, s, l) {
      return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    }

    function hex(h, s, l) {
      var a = (s / 100) * Math.min(l / 100, 1 - l / 100);
      function f(n) {
        var k = (n + h / 30) % 12;
        var c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * c)
          .toString(16)
          .padStart(2, '0');
      }
      return '#' + f(0) + f(8) + f(4);
    }

    var SPEC = [
      { name: 'a', dh: 0, ds: -14, dl: 22 },
      { name: 'b', dh: 14, ds: 0, dl: 8 },
      { name: 'c', dh: -18, ds: 8, dl: -6 },
      { name: 'd', dh: 168, ds: -22, dl: 0 },
      { name: 'e', dh: 148, ds: -6, dl: 14 },
    ];

    var clamp = function (n, lo, hi) {
      return Math.max(lo, Math.min(hi, n));
    };

    function render() {
      var h = Number(hueEl.value);
      var s = Number(satEl.value);
      var l = Number(lightEl.value);

      hueOut.textContent = h;
      satOut.textContent = s;
      lightOut.textContent = l;
      statusEl.textContent = '';

      var html = '';
      for (var i = 0; i < SPEC.length; i++) {
        var v = SPEC[i];
        var hh = (h + v.dh + 360) % 360;
        var ss = clamp(s + v.ds, 0, 100);
        var ll = clamp(l + v.dl, 12, 94);
        var code = hex(hh, ss, ll);
        var lum = 0.2126 * parseInt(code.slice(1, 3), 16) / 255 +
          0.7152 * parseInt(code.slice(3, 5), 16) / 255 +
          0.0722 * parseInt(code.slice(5, 7), 16) / 255;
        var ink = lum > 0.6 ? '#0E0D0C' : '#F2EFE9';
        html +=
          '<button class="chip" type="button" data-hex="' + code + '" ' +
          'style="--chip:' + hsl(hh, ss, ll) + ';--chip-ink:' + ink + '">' +
          '<span class="chip__name">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="chip__hex">' + code.toUpperCase() + '</span>' +
          '</button>';
      }
      chipsEl.innerHTML = html;
    }

    chipsEl.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var code = chip.getAttribute('data-hex').toUpperCase();
      copyText(code).then(
        function () {
          statusEl.textContent = code + '  已复制';
        },
        function () {
          statusEl.textContent = code;
        }
      );
    });

    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy') ? resolve() : reject();
        } catch (err) {
          reject(err);
        }
        document.body.removeChild(ta);
      });
    }

    [hueEl, satEl, lightEl].forEach(function (el) {
      el.addEventListener('input', render);
    });

    render();
  }
})();
