(function () {
    const keyBind = {
        'Enter': togglePlayPause,
        'r': restart
    };

    function main() {
        window.addEventListener('keydown', async function (event) {
            try {
                if (event.key in keyBind) {
                    keyBind[event.key]();
                } else if ('1' <= event.key && event.key <= '9') {
                    let seconds = Number(event.key) * 10;
                    if (event.altKey) {
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
    function change_playback_position(new_timestamp_from_url) {
        pause();

        const element = document.getElementById('url');
        const url = new URL(element['value']);

        const timestamp = sanitize(new_timestamp_from_url(url), url);

        url.searchParams.set('seek', timestamp);
        element['value'] = url.href;

        play();
    }

    function isPlaying() {
        return getToggleButton().getAttribute('data-elabel') == 'stop';
    }

    function togglePlayPause() {
        getToggleButton().click();
    }

    function getToggleButton() {
        return document.querySelector('#now-programs-list .play-radio');
    }

    function play() {
        if (!isPlaying()) {
            togglePlayPause();
        }
    }

    function pause() {
        if (isPlaying()) {
            togglePlayPause();
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
})();
