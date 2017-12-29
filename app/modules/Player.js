const json = require('json-file');

let database = __dirname + "/../../modules/database/playlist.config.json";

class Player {

    constructor(element) {
        this.index = 0;
        this.file = json.read(database);
        this.list = [];

        if (this.file.get('musics') != undefined) {
            this.file.get('musics').forEach((entry) => {
                let m = new Music(entry.titulo, entry.autor, entry.path);
                setTimeout(() => {
                    this.list.push(m);
                    element.innerHTML = element.innerHTML + "<tr><td>"+entry.titulo+"</td><td>"+entry.autor+"</td><td>"+m.format()+"</td></tr>";
                }, 200);
            });
        }

        this.element = element;

    }

    /**
     * @param Music
     * @return player
     */
    setPlaying(music) {
        this.playing = music;
        return this;
    }
    /**
     * @return boolean
     */
    isPlaying() {
        return this.playing != null;
    }

    /**
     * @return Music
     */
    getPlaying() {
        return this.playing;
    }

    /**
     * @param music
     * @return player
     */
    addMusic(music) {
        this.list.push(music);
        this.file.set('musics', this.list);
        this.file.write(() => {
            console.log("[INFO] Playlist saved.");
        });
        return this;
    }

    /**
     * @return Array
     */
    getList() {
        return this.list;
    }

    /**
     * @return player
     */
    playFirst() {
        this.play(this.list[0]);
        this.index = 0;
        return this;
    }

    /**
     * @return player
     */
    pause() {
        this.playing.pause();
        this.paused = true;
        return this;
    }

    /**
     * @return player
     */
    resume() {
        this.paused = false;
        this.playing.play();
        return this;
    }

    /**
     * @return boolean
     */
    isPaused() {
        return this.paused;
    }

    /**
     * @param music
     * @return player
     */
    play(music) {
        music.play();
        this.setPlaying(music);
        document.querySelector("#current-track").textContent = music.titulo;
        this.task = setInterval(() => {
            if (this.playing.audio.currentTime == this.playing.audio.duration) {
                this.index = this.index + 1;
                if (this.list[this.index] == undefined) {
                    this.index = 0;
                }
                clearInterval(this.task);
                this.playing.stop();
                this.play(this.list[this.index]);

                return;
            }
            let pct = (this.playing.audio.currentTime / this.playing.audio.duration) * 100;
            bar.style.width = pct+'%';

        }, 100);
    }

    next() {
        this.index = this.index + 1;
        if (this.list[this.index] == undefined) {
            this.index = 0;
        }
        clearInterval(this.task);
        this.playing.stop();
        this.play(this.list[this.index]);
        if (this.paused) {
            this.playing.pause();
            document.querySelector("#current-track").textContent = this.playing.titulo + " (Pausado)";
        }
    }

    prev() {
        this.index = this.index - 1;
        if (this.list[this.index] == undefined) {
            this.index = this.list.length - 1;
        }
        clearInterval(this.task);
        this.playing.stop();
        this.play(this.list[this.index]);
        if (this.paused) {
            this.playing.pause();
            document.querySelector("#current-track").textContent = this.playing.titulo + " (Pausado)";
        }
    }

    clear() {
        this.playing.stop();
        this.index = 0;
        this.list = [];
        this.file.set('musics', undefined);
        this.file.write(() => {
            console.log("[INFO] Playlist cleared");
            this.element.innerHTML = "";
        });
    }
}
