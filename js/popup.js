/*global localStorage: false, console: false, $: false, Audio: false, chrome: false, window: false, document: false */
$(function () {
    var rss = JSON.parse(localStorage.rss),
        news_el = $('#news');

    function showNews(news) {
        var i,
            max,
            html = '';
        news = news || rss;
        for (i = 0, max = news.length; i < max; i++) {
            html += '<div class="news_elem">' +
                '<div class="elem_link"><a href="' + news[i].link + '" target="_blank">' + news[i].title + '</a></div><div>' + news[i].description +
                '</div><div class="creator">Автор: ' + news[i].creator + '</div></div><hr>';
        }
        news_el.append(html);
    }

    function setEventsHandlers() {
        var search_input = $('#search_place input');
        search_input.keydown(function (event) {
            if (event.keyCode === 13 && $(this).val().length >= 4) {
                chrome.tabs.create({'url': 'http://www.xorosho.com/index.php?do=search&subaction=search&story=' + encodeURIComponent($(this).val())});
            }
        });
        $('#search_place img:eq(0)').click(function () {
            var query = search_input.val();
            if (query.length >= 4) {
                chrome.tabs.create({'url': 'http://www.xorosho.com/index.php?do=search&subaction=search&story=' + encodeURIComponent(query)});
            }
        });
        $('#action_place').on('click', 'img', function (event) {
            switch (event.target.id) {
            case 'btn_upd':
                var img = $(this);
                img.attr('src', 'i/ajax-loader.gif');
                chrome.runtime.getBackgroundPage(function (bP) {
                    bP.getRss(function (answer) {
                        img.attr('src', 'i/update.png');
                        if (answer.status === 'error') {
                            news_el.prepend('<div id="msg_place">' + answer.data + '</div>').find('#msg_place');
                        } else {
                            news_el.empty();
                            bP.handleRss(answer);
                            showNews(answer.data);
                        }
                    });
                });
                break;
            case 'btn_opt':
                chrome.tabs.create({url: "options.html"});
                break;
            case 'btn_close':
                window.close();
                break;
            }
            return false;
        });
    }

    setEventsHandlers();
    localStorage.already_played = 'no';
    chrome.browserAction.setBadgeText({text: ''});
    localStorage.last_pub = rss[0].pubDate || '';
    showNews();
});