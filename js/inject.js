/*global localStorage: false, console: false, $: false, Audio: false, chrome: false, window: false, document: false */
//согласно манифесту включается только в категориях музыка и кино
chrome.extension.sendMessage('tell_me_settings', function (settings) {
    console.log(settings);

    var CONF = {
            max_query_str_length: 61, //рутрекер не поддерживает поисковый запрос длиней 61 символов
            search_engines: {
                rutracker: {
                    ico: chrome.extension.getURL("../i/rutracker_16x16.ico"),
                    ico_big: chrome.extension.getURL("../i/rutracker_big.png"),
                    lnk: 'http://rutracker.org/forum/tracker.php?nm=',
                    category: ['music', 'movie'],
                    title: 'Искать на rutracker.org',
                    top_btn: settings.opt_top_search_btn || 'on',
                    bottom_btn: settings.opt_bottom_search_btn || 'on',
                    query_string_type: 'before_slash'
                },
                soundcloud: {
                    ico: chrome.extension.getURL("../i/soundcloud.png"),
                    ico_big: chrome.extension.getURL("../i/soundcloud_big.png"),
                    lnk: 'https://soundcloud.com/search?q=',
                    category: ['music'],
                    title: 'Искать исполнителя на soundcloud.com',
                    top_btn: settings.opt_top_soundcloud_btn || 'on',
                    bottom_btn: settings.opt_bottom_soundcloud_btn || 'on',
                    query_string_type: 'artist'
                },
                lastfm: {
                    ico: chrome.extension.getURL("../i/lastfm_16.ico"),
                    ico_big: chrome.extension.getURL("../i/lastfm_big.gif"),
                    lnk: 'http://www.lastfm.ru/search?q=',
                    category: ['music'],
                    title: 'Искать исполнителя на lastfm.ru',
                    top_btn: settings.opt_top_lastfm_btn || 'on',
                    bottom_btn: settings.opt_bottom_lastfm_btn || 'on',
                    query_string_type: 'artist'
                }
            }
        },
        page;

    function PageInfo() {
        var self = this;
        // тип релиза или false если корень категории
        this.type = (function () {
            var page_url = document.location.href;
            if (page_url.search(/xoroshaya_muzika\/[\s\S]/) !== -1) {
                return 'music';
            }
            if (page_url.search(/xoroshee_kino\/[\s\S]/) !== -1) {
                return 'movie';
            }
            return false;
        }());
        // строки для поисковых запросов
        // отдаются {before_slash: 'строка новости до слеша', artist: 'строка до первого дефиса'} или пустые, если не найдены
        this.query_strings = (function () {
            var strings = {
                    before_slash: '',
                    artist: ''
                },
                news_title = $('h1:eq(0)').text();
            //принимаю, что все заголовки новости создаются по шаблону Артист - Альбом (год) / жанры
            //фильмы - после первого слеша либо оригинальное название, либо жанры, тоже ОК
            if (self.type && typeof news_title === 'string') {
                strings.before_slash = (function () {
                    var str = news_title.slice(0, news_title.indexOf('/')),
                        last_word_start;
                    if (str.length >= 4) {
                        if (str.length > CONF.max_query_str_length) {
                            str = str.slice(0, CONF.max_query_str_length);
                            //для корректной работы поиска нужно обрезать до последнего слова (пробела)
                            last_word_start = str.lastIndexOf(' ');
                            str = last_word_start !== -1 ? str.slice(0, last_word_start) : str;
                        }
                        return str;
                    }
                    return '';
                }());

                // артист - до первого " - " в заголовке новости
                strings.artist = (function () {
                    function slicer(s) {
                        var artist_end = strings.before_slash.indexOf(s),
                            str;
                        if (artist_end !== -1) {
                            str = strings.before_slash.slice(0, artist_end);
                            if (str.length >= 2) {
                                return str;
                            }
                        }
                        return false;
                    }

                    // здесь проверяются разные типы дефисов, хотя выглядят почти одинаково
                    return slicer(' - ') || slicer(' – ') || slicer(' — ') || slicer(' ‎- ') || '';
                }());
            }
            return strings;
        }());
    }

    function SearchButton(engine) {
        this.engine = CONF.search_engines[engine];
    }

    SearchButton.prototype = {
        buildSearchLink_: function (ico) {
            return '<a class="search_btn" target="_blank" title="' + this.engine.title + '" href="' + this.engine.lnk + encodeURIComponent(page.query_strings[this.engine.query_string_type]) + '">' +
                '<img src="' + this.engine[ico] + '"></a>';
        },
        topHtml: function () {
            return this.engine.top_btn === 'on' ? this.buildSearchLink_('ico') : '';
        },
        bottomHtml: function () {
            return this.engine.bottom_btn === 'on' ? this.buildSearchLink_('ico_big') : '';
        }
    };

    function searchButtonsMaker() {
        var engine,
            engines = CONF.search_engines,
            button,
            top_html = '',
            bottom_html = '';
        if (page.type) {
            for (engine in engines) {
                if (engines.hasOwnProperty(engine) && engines[engine].category.indexOf(page.type) !== -1) {
                    button = new SearchButton(engine);
                    top_html += button.topHtml();
                    bottom_html += button.bottomHtml();
                }
            }
        }
        if (top_html) {
            $('td[class="category  style1"]').prepend(top_html);
        }
        if (bottom_html) {
            $('span[id*="ratig-layer"]').after('<div id="bottom_search">' + bottom_html + '</div>');
        }
    }

    page = new PageInfo();
    searchButtonsMaker();
});