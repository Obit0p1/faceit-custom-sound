// Достаёт прямую ссылку на звук из TikTok через tikwm.com
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg && msg.type === 'resolve') {
    fetch('https://www.tikwm.com/api/?hd=1&url=' + encodeURIComponent(msg.url))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var d = j && j.data;
        sendResponse({ direct: d && (d.music || d.play) || null });
      })
      .catch(function () { sendResponse({ direct: null }); });
    return true; // ответ придёт асинхронно
  }
});
