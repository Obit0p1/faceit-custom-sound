// Кошельки для донатов: поменяй name и addr на свои, лишние строки удали
var WALLETS = [
  { name: 'USDT (TRC20, сеть Tron)', addr: 'TN46o7p2ak9xnrc6JnYGFDmhk1K8Wxu9ZH' },
  { name: 'ETH (сеть Ethereum)', addr: '0x5739951D1487e98AF1F47a38a00FB0A9aaAa501F' },
  { name: 'GRAM (сеть TON)', addr: 'UQB1BzUbAzLKhPZOnQS2N6zkoNNW3xeHBw3UzAgFbKUOFT_9' }
];
var DEFAULTS = { url: '', volume: 70, maxSec: 30 };

var $ = function (id) { return document.getElementById(id); };
var statusEl = $('status');
var saveTimer;

function flash(text, color) {
  statusEl.textContent = text;
  statusEl.style.color = color || '#7ddc7d';
}

function save() {
  var data = {
    url: $('url').value.trim(),
    volume: Math.min(100, Math.max(0, +$('volume').value || 0)),
    maxSec: Math.min(120, Math.max(1, +$('maxSec').value || 30))
  };
  chrome.storage.sync.set(data, function () { flash('Сохранено ✓'); });
}

function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 300);
}

chrome.storage.sync.get(DEFAULTS, function (v) {
  $('url').value = v.url;
  $('volume').value = v.volume;
  $('volVal').textContent = v.volume + '%';
  $('maxSec').value = v.maxSec;
});

$('url').addEventListener('input', saveSoon);
$('maxSec').addEventListener('input', saveSoon);
$('volume').addEventListener('input', function () {
  $('volVal').textContent = $('volume').value + '%';
  saveSoon();
});

$('test').addEventListener('click', function () {
  save();
  setTimeout(function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs && tabs[0];
      if (!tab) return flash('Открой вкладку faceit.com', '#ff8888');
      chrome.tabs.sendMessage(tab.id, { type: 'test' }, function () {
        if (chrome.runtime.lastError) {
          flash('Открой faceit.com и обнови страницу (F5)', '#ff8888');
        } else {
          flash('Играет ▶');
        }
      });
    });
  }, 350);
});

WALLETS.forEach(function (w) {
  var row = document.createElement('div');
  row.className = 'wallet';
  var info = document.createElement('div');
  info.className = 'info';
  var coin = document.createElement('div');
  coin.className = 'coin';
  coin.textContent = w.name;
  var addr = document.createElement('div');
  addr.className = 'addr';
  addr.textContent = w.addr;
  addr.title = w.addr;
  info.appendChild(coin);
  info.appendChild(addr);
  var btn = document.createElement('button');
  btn.textContent = 'Копировать';
  btn.addEventListener('click', function () {
    navigator.clipboard.writeText(w.addr).then(function () {
      flash('Адрес ' + w.name + ' скопирован ✓');
    });
  });
  row.appendChild(info);
  row.appendChild(btn);
  $('wallets').appendChild(row);
});
