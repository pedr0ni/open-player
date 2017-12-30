let database = __dirname + "/../../modules/database/playlist.config.json";

class Player {

    /**
     * elements[0] = table rows
     * elements[1] = current track
     * elements[2] = play button
     * elements[3] = progress_bar
     */
    constructor(elements) {
        this.index = 0;
        this.list = [];

        fs.readFile(database, 'utf-8', (err, data) => {
            if (err) throw err;
            let musics = JSON.parse(data).musics;
            if (musics == undefined) return;
            musics.forEach((entry) => {
                if (this.exists(entry.titulo)) return;
                let m = new Music(entry.titulo, entry.autor, entry.path);
                m.fav = entry.fav;
                m.audio.onloadedmetadata = () => {
                    this.list.push(m);
                    let icon = null;
                    if (m.fav) {
                        icon = "<i class=\"fa fa-heart\"></i>";
                    } else {
                        icon = "<i class=\"far fa-heart\"></i>";
                    }
                    elements[0].innerHTML = elements[0].innerHTML + "<tr><td>"+entry.titulo+"</td><td>"+entry.autor+"</td><td>"+m.format()+"</td><td><a id=\"fav-btn-"+this.list.length+"\" fav-id=\""+this.list.length+"\">"+icon+"</a></td></tr>";
                }
            });
        });

        this.elements = elements;
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
        fs.writeFile(database, JSON.stringify({musics: this.list}), (err) => {
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
        if (this.list.length == 0) return;
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
        if (this.list.length == 0) return;
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
        if (this.list.length == 0) return;
        if (this.playing != undefined)
            this.playing.stop();
        clearInterval(this.task);
        this.index = 0;
        this.playing = undefined;
        this.elements[1].textContent = "Nenhuma música tocando...";
        this.elements[2].innerHTML = "<i class=\"fa fa-play\"></i>";
        this.list = [];
        fs.writeFile(database, JSON.stringify({}), (err) => {
            this.elements[0].innerHTML = "";
            bar.style.width = "0%";
            console.log("[INFO] Playlist cleared.");
        });
    }

    /**
     * 
     * @param string
     * @return boolean
     */
    exists(titulo) {
        var ret = false;
        this.list.forEach((entry) => {
            ret = entry.titulo == titulo;
        });
        return ret;
    }
} 
