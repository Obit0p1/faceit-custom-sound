(function () {
  'use strict';

  var DEFAULTS = { url: '', volume: 70, maxSec: 30 };
  var settings = {};
  for (var k in DEFAULTS) settings[k] = DEFAULTS[k];

  var resolved = null;
  var resolving = false;
  var ytFrame = null, curAudio = null, stopTimer = null, fadeTimer = null;

  function load(cb) {
    try {
      chrome.storage.sync.get(DEFAULTS, function (v) { settings = v; if (cb) cb(); });
    } catch (e) {}
  }

  function ytId(url) {
    var m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function isTikTok(url) { return /tiktok\.com/i.test(url); }

  // ---------- TikTok ----------
  function resolveTikTok(url, cb) {
    try {
      chrome.runtime.sendMessage({ type: 'resolve', url: url }, function (res) {
        if (chrome.runtime.lastError) return cb(null);
        cb(res && res.direct ? res.direct : null);
      });
    } catch (e) { cb(null); }
  }

  function prefetch() {
    var url = settings.url;
    if (!url || !isTikTok(url) || resolving) return;
    resolving = true;
    resolveTikTok(url, function (direct) {
      resolving = false;
      resolved = direct;
    });
  }

  // ---------- воспроизведение ----------
  function stopAll() {
    clearTimeout(stopTimer);
    clearInterval(fadeTimer);
    if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio = null; }
    if (ytFrame) { ytFrame.remove(); ytFrame = null; }
  }

  function ytCmd(fn, args) {
    if (ytFrame && ytFrame.contentWindow) {
      ytFrame.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: fn, args: args || [] }), '*');
    }
  }

  function fadeStop() {
    if (!curAudio && !ytFrame) return;
    clearTimeout(stopTimer);
    clearInterval(fadeTimer);
    var a = curAudio;
    var startVol = a ? a.volume : 1;
    var steps = 14, i = 0;
    fadeTimer = setInterval(function () {
      i++;
      var k = 1 - i / steps;
      if (a) { try { a.volume = Math.max(0, startVol * k); } catch (e) {} }
      ytCmd('setVolume', [Math.max(0, Math.round(settings.volume * k))]);
      if (i >= steps) stopAll();
    }, 50);
  }

  function playAudio(src, manual) {
    var a = new Audio(src);
    a.volume = Math.min(1, Math.max(0, settings.volume / 100));
    curAudio = a;
    a.play().catch(function () {
      if (manual) alert('Не удалось воспроизвести звук. Проверь ссылку.');
    });
    stopTimer = setTimeout(fadeStop, settings.maxSec * 1000);
  }

  function playCustom(manual) {
    var url = settings.url;
    if (!url) {
      if (manual) alert('Сначала вставь ссылку в окошке расширения.');
      return;
    }
    stopAll();
    var id = ytId(url);

    if (id) {
      ytFrame = document.createElement('iframe');
      ytFrame.allow = 'autoplay';
      ytFrame.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;left:0;';
      ytFrame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&controls=0&enablejsapi=1';
      document.body.appendChild(ytFrame);
      var applyVol = function () { ytCmd('setVolume', [Math.round(settings.volume)]); };
      ytFrame.addEventListener('load', function () {
        applyVol();
        setTimeout(applyVol, 300);
        setTimeout(applyVol, 1000);
        setTimeout(applyVol, 2000);
      });
      stopTimer = setTimeout(fadeStop, settings.maxSec * 1000);
    } else if (isTikTok(url)) {
      if (resolved) return playAudio(resolved, manual);
      resolveTikTok(url, function (direct) {
        if (!direct) {
          if (manual) alert('Не удалось достать звук из TikTok. Попробуй другую ссылку или прямой mp3.');
          return;
        }
        resolved = direct;
        playAudio(direct, manual);
      });
    } else {
      playAudio(url, manual);
    }
  }

  // ---------- детект окна "Принять" ----------
  var TEXTS = ['принять', 'accept', 'match ready', 'матч найден'];
  var active = false;

  function popupVisible() {
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var t = (b.textContent || '').trim().toLowerCase();
      if (!t || b.offsetParent === null) continue;
      for (var j = 0; j < TEXTS.length; j++) {
        if (t === TEXTS[j] || t.indexOf(TEXTS[j]) === 0) return true;
      }
    }
    return false;
  }

  function check() {
    var v = popupVisible();
    if (v && !active) {
      active = true;
      playCustom(false);
    } else if (!v && active) {
      active = false;
      fadeStop();
    }
  }

  // ---------- сообщения из окошка расширения ----------
  try {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
      if (msg && msg.type === 'test') {
        load(function () { playCustom(true); sendResponse({ ok: true }); });
        return true;
      }
    });
    chrome.storage.onChanged.addListener(function () {
      load(function () { resolved = null; prefetch(); });
    });
  } catch (e) {}

  var timer;
  function start() {
    load(prefetch);
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(check, 100);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  start();
})();
