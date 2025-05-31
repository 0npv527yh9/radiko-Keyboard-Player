(function () {
    const keyBind = {
        'Enter': togglePlayPause,
        'r': restart
    };

    function main() {
        document.addEventListener('keydown', async function (event) {
            // Do nothing when the search field is focused
            if (document.activeElement.id == 'search_text') {
                return;
            }

            try {
                if (event.key in keyBind) {
                    keyBind[event.key]();
                } else {
                    const number_key_match = event.code.match(/^(?:Digit|Numpad)(\d)$/);
                    if (number_key_match) {
                        let seconds = Number(number_key_match[1]) * 10;
                        if (event.altKey) {
                            seconds = -seconds;
                        }
                        skip(seconds);
                    }
                }
            } catch (e) {
                if (e) {
                    console.error(e);
                } else {
                    console.error('radiko-keyboard-player: Some error');
                }
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
    // The reason for implementing it this way is that 
    // `skip` and `restart` take the url as an argument and change the playback position.
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
        return document.querySelector('#play i').classList.contains('on');
    }

    function togglePlayPause() {
        if (isPlaying()) {
            pause();
        } else {
            play();
        }
    }

    function getToggleButton() {
        return document.querySelector('#now-programs-list .play-radio');
    }

    function play() {
        let button = getToggleButton();
        if (!button) {
            button = document.getElementById('play');
        }
        if (button) {
            button.click();
        }
    }

    function pause() {
        let button = getToggleButton();
        if (!button) {
            button = document.getElementById('pause');
        }
        if (button) {
            button.click();
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
