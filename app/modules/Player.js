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
                    m.setId(this.list.length);
                    $('#user-musics').html($('#user-musics').html() + "<tr><td>"+entry.titulo+"</td><td>"+entry.autor+"</td><td>"+m.format()+"</td><td><a style=\"cursor: pointer;\" class=\"fav-btn\" fav-id=\""+this.list.length+"\">"+m.getIcon()+"</a></td></tr>");
                    $('.fav-btn').on('click', (event) => {
                        let favid = $(event.target.parentElement).attr('fav-id');
                        let musicChange = this.getMusicById(favid);
                        if (musicChange.isFavorite()) {
                            musicChange.setFavorite(false);
                            $(event.target).removeClass('fa').addClass('far');
                        } else {
                            $(event.target).removeClass('far').addClass('fa');
                            musicChange.setFavorite(true);
                        }

                        this.saveList();

                    });
                }
            });
        });

        this.elements = elements;
    }

    saveList() {
        fs.writeFile(database, JSON.stringify({musics: this.list}), (err) => {
            console.log("[INFO] Playlist saved.");
        });
    }

    /**
     * 
     * @param {int} id 
     * @returns {Music}
     */
    getMusicById(id) {
        let result;
        this.list.forEach(entry => {
            if (entry.id == id) {
                result = entry;
            }
        });
        return result;
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
        this.saveList();
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
