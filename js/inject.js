/*global localStorage: false, console: false, $: false, Audio: false, chrome: false, window: false, document: false */
function extXorosho(settings) {
    var query_strings = {   //строки для поисковых запросов
            before_slash: false,
            artist: false
        },
        search_engines = {
            rutracker: {
                ico: chrome.extension.getURL("../i/rutracker_16x16.ico"),
                ico_big: chrome.extension.getURL("../i/rutracker_big.png"),
                lnk: 'http://rutracker.org/forum/tracker.php?nm=',
                category: ['music', 'movie'],
                title: 'Искать на rutracker.org',
                top_btn: settings.top_search_btn || 'on',
                bottom_btn: settings.bottom_search_btn || 'on',
                query_string_type: 'before_slash'
            },
            soundcloud: {
                ico: chrome.extension.getURL("../i/soundcloud.png"),
                ico_big: chrome.extension.getURL("../i/soundcloud_big.png"),
                lnk: 'https://soundcloud.com/search?q=',
                category: ['music'],
                title: 'Искать исполнителя на soundcloud.com',
                top_btn: settings.top_soundcloud_btn || 'on',
                bottom_btn: settings.bottom_soundcloud_btn || 'on',
                query_string_type: 'artist'
            }
        },
        ext_ico = chrome.extension.getURL("../i/ico/icon_19.png"),
        current_page_type = (function () {
            var page_url = document.location.href;
            //убеждаюсь, что это релизы, а не корень категорий
            if (page_url.search(/xoroshaya_muzika\/[\s\S]/) !== -1) {
                return 'music';
            }
            if (page_url.search(/xoroshee_kino\/[\s\S]/) !== -1) {
                return 'movie';
            }
            return false;
        }());

    function findQueryStrings() {
        //принимаем, что все заголовки новости создаются по шаблону Артист - Альбом (год) / жанры
        var news_title = $('h1:eq(0)').text();
        if (typeof news_title === 'string') {
            query_strings.before_slash = (function () {
                var str = news_title.slice(0, news_title.indexOf('/'));
                if (str.length >= 4) {
                    return str;
                }
                return false;
            }());
            query_strings.artist = (function () {
                var artist_end = news_title.indexOf(' - '),
                    str;
                if (artist_end !== -1) {
                    str = news_title.slice(0, artist_end);
                    if (str.length >= 2) {
                        return str;
                    }
                }
                return false;
            }());
        }
    }

    function go() {
        var top_html = '',
            bottom_html = '',
            engine,
            query_str;
        if (current_page_type) {
            findQueryStrings();
            for (engine in search_engines) {
                if (search_engines.hasOwnProperty(engine)) {
                    query_str = query_strings[search_engines[engine].query_string_type];
                    if (query_str) {
                        if (search_engines[engine].top_btn === 'on') {
                            top_html += '<a class="search_btn" target="_blank" title="' + search_engines[engine].title + '" href="' + search_engines[engine].lnk + encodeURIComponent(query_str) + '">' +
                                '<img src="' + search_engines[engine].ico + '"></a>';
                        }
                        if (search_engines[engine].bottom_btn === 'on') {
                            bottom_html += '<a class="search_btn" target="_blank" title="' + search_engines[engine].title + '" href="' + search_engines[engine].lnk + encodeURIComponent(query_str) + '">' +
                                '<img src="' + search_engines[engine].ico_big + '"></a>';
                        }
                    }
                }
            }
            if (top_html !== '') {
                $('td[class="category  style1"]').prepend(top_html);
            }
            if (bottom_html !== '') {
                $('span[id*="ratig-layer"]').after('<div id="bottom_search">' + bottom_html + '</div>');
            }
        }
    }

    go();
}

chrome.extension.sendMessage('tell_me_settings', function (resp) {
    extXorosho(resp);
});