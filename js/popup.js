$(function () {
    var rss = JSON.parse(localStorage.rss),
        $news_el = $('#news');

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
        $news_el.html(html);
    }

    function showError(msg) {
        $news_el.prepend('<div id="msg_place">' + msg + '</div>').find('#msg_place');
    }

    //init
    (function () {
        var $search_input = $('#search_place').find('input'),
            $site_search = $('#site_search');

        $site_search.find('[value=' + localStorage.site_search + ']').attr('selected', 'selected');

        function setPlaceholder() {
            $search_input.attr('placeholder', localStorage.site_search === 'xorosho' ? 'Искать на Xorosho. Мин. 4 знака, латиница' : 'Искать на Xorosho движком Google');
        }

        function xoroshoSearch(query) {
            if (localStorage.site_search === 'xorosho') {
                if (query.length >= 4) {
                    chrome.tabs.create({'url': 'http://www.xorosho.com/index.php?do=search&subaction=search&story=' + encodeURIComponent(query)});
                }
            } else {
                chrome.tabs.create({'url': 'https://www.google.com/#hl=ru&newwindow=1&q=site:xorosho.com+' + encodeURIComponent(query)});
            }
        }

        $search_input.keydown(function (event) {
            var val = $(this).val();
            
            if (event.keyCode === 13 && val) {
                xoroshoSearch(val);
            }
        });

        $site_search.change(function () {
            localStorage.site_search = $(this).val();
            setPlaceholder();
            if ($search_input.val()) {
                xoroshoSearch($search_input.val());
            }
            return false;
        });

        $('#action_place').on('click', 'img', function (event) {
            switch (event.target.id) {
                case 'btn_upd':
                    var $img = $(this);

                    $img.attr('src', 'i/ajax-loader.gif');
                    getRss(function (news) {
                        $img.attr('src', 'i/update.png');
                        if (news.status === 'error') {
                            showError(news.data);
                        } else if (localStorage.last_pub !== news.data[0].pubDate) {
                            localStorage.last_pub = rss[0].pubDate;
                            showNews(news.data);
                        }
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

        setPlaceholder();
    }());

    localStorage.already_played = 'no';
    chrome.browserAction.setBadgeText({text: ''});
    localStorage.last_pub = rss[0].pubDate || '';
    showNews();
});