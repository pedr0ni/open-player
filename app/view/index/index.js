const dialog = require('electron').remote.dialog;
const fs = require('fs');
const mm = require('musicmetadata');
const moment = require('moment');
const { ipcRenderer } = require('electron');

let bar = document.querySelector("#bar");

class Music {

    constructor(titulo,autor,duration,path) {
        this.titulo = titulo;
        this.autor = autor;
        this.rawduration = duration;
        this.duration = Math.round(duration * 10) / 10;
        this.path = path;
        this.audio = new Audio(path);
        this.current = 0;
    }

    play() {
        this.audio.play();
        this.task = setInterval(() => {
            this.current = this.current + 0.1;
        }, 100);
    }

    getCurrent() {
        return Math.round(this.current * 10) / 10;
    }

    pause() {
        this.audio.pause();
        clearInterval(this.task);
    }

    stop() {
        this.audio.pause();
        this.audio = new Audio(this.path);
        clearInterval(this.task);
        this.current = 0;
    }
}

class Control {

    constructor(list) {
        this.list = list;
        this.index = 0;
    }

    /**
     * @param Music
     * @return control
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
     * @return control
     */
    addMusic(music) {
        this.list.push(music);
        return this;
    }

    /**
     * @return Array
     */
    getList() {
        return this.list;
    }

    /**
     * @return control
     */
    playFirst() {
        this.play(this.list[0]);
        this.index = 0;
        return this;
    }

    /**
     * @return control
     */
    pause() {
        this.playing.pause();
        this.paused = true;
        return this;
    }

    /**
     * @return control
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
     * @return control
     */
    play(music) {
        music.play();
        this.setPlaying(music);
        document.querySelector("#current-track").textContent = music.titulo;
        this.task = setInterval(() => {
            if (this.playing.getCurrent() == this.playing.duration + 0.1) {
                this.index = this.index + 1;
                if (this.list[this.index] == undefined) {
                    this.index = 0;
                }
                clearInterval(this.task);
                this.playing.stop();
                this.play(this.list[this.index]);

                return;
            }
            let pct = (this.playing.current / this.playing.rawduration) * 100;
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
}

let control = new Control([]); // Passar o json futuramente

let user_musics = document.querySelector("#user-musics");

let add_btn = document.querySelector("#add-music");
add_btn.addEventListener('click', (event) => {
    event.preventDefault();

    let path = dialog.showOpenDialog({
        properties: ['multiSelections'],
        filters: [
            {name: 'Músicas', extensions: ['mp3']}
        ]
    });

    if (path == undefined) {
        return;
    }
    for (var i = 0; i < path.length; i++) {
        let dir = path[i];
        let parser = mm(fs.createReadStream(dir), {duration: true}, function (err, metadata) {
            if (err) throw err;
            var duration = moment().startOf('day').seconds(metadata.duration).format('mm:ss').toString();
            user_musics.innerHTML = user_musics.innerHTML + "<tr><td>"+metadata.title+"</td><td>"+metadata.artist[0]+"</td><td>"+duration+"</td></tr>";
            control.addMusic(new Music(metadata.title, metadata.artist[0], metadata.duration, dir));
        });
    }
});

let play_btn = document.querySelector("#play-btn");
play_btn.addEventListener('click', (event) => {
    event.preventDefault();

    if (control.isPlaying()) {
        if (control.isPaused()) {
            //Unpause
            play_btn.innerHTML = "<i class=\"fa fa-pause\"></i>";
            control.resume();
            document.querySelector("#current-track").textContent = control.getPlaying().titulo;
        } else {
            //Pause
            control.pause();
            play_btn.innerHTML = "<i class=\"fa fa-play\"></i>";
            document.querySelector("#current-track").textContent = control.getPlaying().titulo + " (Pausado)";
        }
    } else {
        if (control.getList().length == 0) {
            dialog.showErrorBox("Erro", "Você não possui nenhuma música na lista.");
            return;
        }
        control.playFirst();
        play_btn.innerHTML = "<i class=\"fa fa-pause\"></i>";
    }


});


let next_btn = document.querySelector("#btn-next");
next_btn.addEventListener('click', (event) => {
    event.preventDefault();
    control.next();

});

let prev_btn = document.querySelector("#btn-prev");
prev_btn.addEventListener('click', (event) => {
    event.preventDefault();
    control.prev();
});
