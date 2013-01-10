$(document).ready(function () {
    var rss = JSON.parse(localStorage.rss),
        news_el = $('#news');

    function showNews() {
        var i,
            max;
        for (i = 0, max = rss.length; i < max; i++) {
            news_el.append('<div class="news_elem">' +
                '<div class="elem_link"><a href="' + rss[i].link + '" target="_blank">' + rss[i].title + '</a></div> ' + rss[i].description + '</div><hr>');
        }
        $('.news_elem img').load().each(function () {
            var t = $(this);
            $(this).width('100px');
        });
    }

    function setEventsHandlers() {
        $('#search_place input').keydown(function (event) {
            if (event.keyCode === 13 && $(this).val().length >= 4) {
                chrome.tabs.create({'url': 'http://www.xorosho.com/index.php?do=search&subaction=search&story=' + encodeURIComponent($(this).val())});
            }
        });
        $('#search_place img:eq(0)').click(function () {
            var query = $('#search_place input').val();
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
                        bP.getRss(function (answ) {
                            img.attr('src', 'i/update.png');
                            if (answ.status === 'error') {
                                news_el.prepend('<div id="msg_place">' + answ.data + '</div>').find('#msg_place');
                            } else {
                                news_el.empty();
                                bP.handleRss(answ);
                                showNews();
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
    localStorage.last_pub = rss[0].pubDate;
    showNews();
});