var moment = require('moment');

class Music {

    constructor(titulo,autor,path) {
        this.titulo = titulo;
        this.autor = autor;
        this.path = path;
        this.audio = new Audio(path);
        this.fav = false;
    }

    play() {
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    stop() {
        this.audio.pause();
        this.audio = new Audio(this.path);
        this.current = 0;
    }

    format() {
        return moment().startOf('day').seconds(this.audio.duration).format('mm:ss').toString();
    }
}
