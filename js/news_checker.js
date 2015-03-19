function getRss(callback) {
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
                        description: el.find('description').text().replace(/(<!--[\s\S]*?-->)|(<object[\s\S]*?<\/object>)/g, '').replace('onclick="return hs.expand(this)"', ''),
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
            callback(answer);
        });
}