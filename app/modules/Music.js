var moment = require('moment');

class Music {

    constructor(titulo,autor,path) {
        this.titulo = titulo;
        this.autor = autor;
        this.path = path;
        this.audio = new Audio(path);
        this.fav = false;
    }

    setId(id) {
        this.id = id;
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
    }

    format() {
        return moment().startOf('day').seconds(this.audio.duration).format('mm:ss').toString();
    }

    getIcon() {
        return this.fav ? "<i class=\"fa fa-heart\"></i>" : "<i class=\"far fa-heart\"></i>";
    }

    setFavorite(b) {
        this.fav = b;
    }

    isFavorite() {
        return this.fav;
    }
}
