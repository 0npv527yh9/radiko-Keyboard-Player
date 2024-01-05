(function () {
    const keyBind = {
        ' ': toggle_play_pause,
        'k': toggle_play_pause
    };

    function main() {
        window.addEventListener('keydown', async function (event) {
            try {
                if (event.key in keyBind) {
                    keyBind[event.key]();
                } else if (event.key == 'j' || event.key == 'l') {
                    let seconds = 10;
                    if (event.key == 'j') {
                        seconds = -seconds;
                    }
                    skip(seconds);
                }
            } catch (e) { // When you try to change the playback position in a live broadcast
                console.error(e);
            }
        });
    }
    main();

    function skip(seconds) {
        change_playback_position((url) => {
            const timestamp = url.searchParams.get('seek');
            const [f, y, mo, d, h, mi, s] = timestamp.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
            const date = new Date(`${y}/${mo}/${d} ${h}:${mi}:${s}`);
            date.setSeconds(date.getSeconds() + seconds);
            return formatDate(date);
        });
    }

    function restart() {
        change_playback_position(url =>
            url.searchParams.get('ft')
        );
    }

    // `new_timestamp` is a function that takes a URL instance and returns a new timestamp.
    function change_playback_position(new_timestamp) {
        pause();

        const element = document.getElementById('url');
        const url = new URL(element['value']);

        const timestamp = sanitize(new_timestamp(url), url);

        url.searchParams.set('seek', timestamp);
        element['value'] = url.href;

        play();
    }

    function isPlaying() {
        return document.querySelector('#stream-player .on') !== null;
    }

    function toggle_play_pause() {
        const button = document.getElementsByClassName('play-radio')[0];
        button.click()
    }

    function play() {
        if (!isPlaying()) {
            toggle_play_pause();
        }
    }

    function pause() {
        if (isPlaying()) {
            toggle_play_pause();
        }
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const seconds = ('0' + date.getSeconds()).slice(-2);
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    function sanitize(timestamp, url) {
        const startTimestamp = url.searchParams.get('ft');
        const endTimestamp = url.searchParams.get('to');

        if (timestamp < startTimestamp) {
            return startTimestamp;
        } else if (endTimestamp < timestamp) {
            return endTimestamp;
        } else {
            return timestamp;
        }
    }

    window.addEventListener('keydown', function (e) {
        if (e.key == ' ') {
            e.preventDefault();
        }
    }, { passive: false });
})();
