$(function () {
    var audioElement = new Audio();

    //формирование страницы согласно параметрам, сохраненным в localStorage
    $('input:checkbox').each(function () {
        var el = $(this);
        if (localStorage[el.attr('id')] === 'on') {
            el.attr('checked', 'checked');
        }
    });
    $('#opt_check_time [value="' + localStorage.opt_check_time + '"]').attr("selected", "selected");
    $('input[name="opt_sound"][id="' + localStorage.opt_sound + '"]').attr('checked', 'checked');

    //обработка изменений настроек
    $('input, select').on('change', function (e) {
        if (e.target.type === 'checkbox') {
            localStorage[e.target.id] = e.target.checked ? 'on' : 'off';
            return false;
        }
        if (e.target.type === 'radio') {
            localStorage[e.target.name] = e.target.id;
            if (e.target.name === 'opt_sound' && e.target.id !== 'off') {
                try {
                    audioElement.src = 'sound/' + e.target.id + '.mp3';
                    audioElement.load();
                    audioElement.play();
                } catch (er) {
                }
            }
            return false;
        }
        if (e.target.tagName === 'SELECT') {
            localStorage[e.target.id] = e.target.value;
            if (e.target.id === 'opt_check_time') {
                chrome.runtime.getBackgroundPage(function (bP) {
                    bP.setAlarm();
                });
            }
            return false;
        }
        return false;
    });
});