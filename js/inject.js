function ext_xorosho(settings) {
    "use strict";
    var rutracker_img = chrome.extension.getURL("../i/rutracker_16x16.ico"),
        ext_img = chrome.extension.getURL("../i/ico/icon_19.png"),
        rutracker_searh_lnk = 'http://rutracker.org/forum/tracker.php?nm=',
        query_string,
        page_url = document.location.href,
        top_search = settings.top_search_btn || 'on',
        bottom_search = settings.bottom_search_btn || 'on';

    function getQueryString() {
        var title = $('h1:eq(0)').text(),
            query_str;
        if (title !== '') {
            query_str = title.slice(0, title.indexOf('/'));
            if (query_str && query_str.length >= 4) {
                return query_str;
            }
        }
        return false;
    }

    if (page_url.search(/xoroshaya_muzika\/$/) === -1 && page_url.search(/xoroshee_kino\/$/) === -1) {
        query_string = getQueryString();
        if (query_string) {
            if (top_search === 'on') {
                $('td[class="category  style1"]')
                    .prepend('<a id="search_btn" title="Искать на rutracker.org"  target="_blank" href="' + rutracker_searh_lnk + query_string + '"><img src="' + rutracker_img + '"></a>');
            }
            if (bottom_search === 'on') {
                $('span[id*="ratig-layer"]')
                    .after('<div id="search_txt"><a title="Искать на rutracker.org"  target="_blank" href="' + rutracker_searh_lnk + query_string + '">' +
                    '<img width="16" height="16" src="' + ext_img + '"> Искать на rutracker.org <img src="' + rutracker_img + '"></a></div>');
            }
        }
    }
}

chrome.extension.sendMessage('tell_me_settings', function (resp) {
    ext_xorosho(resp);
});
