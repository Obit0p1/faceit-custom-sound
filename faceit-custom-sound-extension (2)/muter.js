// Работает внутри страницы FACEIT: глушит родной звук, пока открыто окно "Принять"
(function () {
  'use strict';
  var TEXTS = ['принять', 'accept', 'match ready', 'матч найден'];
  var URL_RE = /match|ready|accept|found|queue/i;
  var lastSeen = 0;

  function popupVisible() {
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var t = (b.textContent || '').trim().toLowerCase();
      if (!t || b.offsetParent === null) continue;
      for (var j = 0; j < TEXTS.length; j++) {
        if (t === TEXTS[j] || t.indexOf(TEXTS[j]) === 0) {
          lastSeen = Date.now();
          return true;
        }
      }
    }
    return Date.now() - lastSeen < 3000;
  }

  var origPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    var src = this.currentSrc || this.src || '';
    if (popupVisible() || URL_RE.test(src)) {
      this.muted = true;
      this.volume = 0;
      return Promise.resolve();
    }
    return origPlay.apply(this, arguments);
  };

  var origStart = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function () {
    if (popupVisible()) return;
    return origStart.apply(this, arguments);
  };
})();
