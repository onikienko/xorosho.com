function setDefaults() {
    var defaults = {
            opt_top_search_btn: 'on',
            opt_bottom_search_btn: 'on',

            opt_top_soundcloud_btn: 'on',
            opt_bottom_soundcloud_btn: 'on',

            opt_top_lastfm_btn: 'on',
            opt_bottom_lastfm_btn: 'on',

            opt_check_time: '60',
            opt_sound: 'off',
            last_pub: '',
            already_played: 'no',
            rss: '[]',

            site_search: 'xorosho'
        },
        d;
    for (d in defaults) {
        if (defaults.hasOwnProperty(d)) {
            localStorage[d] = localStorage[d] || defaults[d];
        }
    }
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

function handleRss(news) {
    if (news.status === 'ok') {
        localStorage.rss = JSON.stringify(news.data);
        if (localStorage.last_pub !== news.data[0].pubDate) {
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

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    var opt,
        settings = {};
    if (msg === 'tell_me_settings') {
        for (opt in localStorage) {
            //если начинается с opt_ и заканчивается на _btn - то это нужные настройки кнопок, остальное не отправляем
            if (localStorage.hasOwnProperty(opt) && opt.indexOf('opt_') === 0 && /_btn$/.test(opt)) {
                settings[opt] = localStorage[opt];
            }
        }
        sendResponse(settings);
    } else {
        sendResponse(false);
    }
});