function setDefaults() {
    localStorage.opt_top_search_btn = localStorage.opt_top_search_btn || 'on';
    localStorage.opt_bottom_search_btn = localStorage.opt_bottom_search_btn || 'on';
    localStorage.opt_check_time = localStorage.opt_check_time || '60';
    localStorage.opt_sound = localStorage.opt_sound || 'off';
    localStorage.last_pub = localStorage.last_pub || '';
    localStorage.already_played = localStorage.already_played || 'no';
    localStorage.rss = localStorage.rss || '[]';
}

function setAlarm() {
    chrome.alarms.clearAll();
    chrome.alarms.create({periodInMinutes: parseInt(localStorage.opt_check_time, 10)});
}

function notify() {
    chrome.browserAction.setBadgeText({
        text: 'N'
    });
    chrome.browserAction.setBadgeBackgroundColor({color: '#008000'});
    if (localStorage.opt_sound !== 'off' && localStorage.already_played === 'no') {
        try {
            var audioElement = new Audio();
            audioElement.src = 'sound/' + localStorage.opt_sound + '.mp3';
            audioElement.load();
            audioElement.play();
        } catch (e) {
        }
        localStorage.already_played = 'yes';
    }
}

function getRss(cb) {
    var answer = {};
    $.get('http://www.xorosho.com/engine/rss.php')
        .success(function (data) {
            try {
                var news = [];
                $(data).find('item').each(function () {
                    var el = $(this);
                    news.push({
                        title: el.find('title').text(),
                        link: el.find('link').text(),
                        description: el.find('description').text().replace(/(<!--[\s\S]*?-->)|(<object[\s\S]*?<\/object>)/g, ''),
                        pubDate: el.find('pubDate').text(),
                        creator: el.find('creator').text()
                    });
                });
                answer = {status: 'ok', data: news};
            } catch (e) {
                answer = {status: 'error', data: 'Ошибка разбора rss'};
            }
        })
        .error(function () {
            answer = {status: 'error', data: 'Ошибка при получении rss'};
        })
        .complete(function () {
            cb(answer);
        });
}

function handleRss(request) {
    if (request.status === 'ok') {
        localStorage.rss = JSON.stringify(request.data);
        if (localStorage.last_pub !== request.data[0].pubDate) {
            notify();
        }
    }
}

function starter() {
    setDefaults();
    setAlarm();
    getRss(handleRss);
}

chrome.runtime.onInstalled.addListener(function (details) {
    starter();
    if (details.reason === 'install' || (details.reason === 'update' && details.previousVersion === '0.4.3')) {
        chrome.tabs.create({'url': 'options.html'});
    }
});

chrome.runtime.onStartup.addListener(function () {
    starter();
});

chrome.alarms.onAlarm.addListener(function () {
    getRss(handleRss);
});