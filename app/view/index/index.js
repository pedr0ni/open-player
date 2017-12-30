const dialog = require('electron').remote.dialog;
const fs = require('fs');
const mm = require('musicmetadata');
const { ipcRenderer } = require('electron');

let bar = document.querySelector("#bar");

let user_musics = document.querySelector("#user-musics");
let player = new Player([user_musics, document.querySelector("#current-track"), document.querySelector("#play-btn"), bar]);

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
        let parser = mm(fs.createReadStream(dir), function (err, metadata) {
            if (err) throw err;
            let m = new Music(metadata.title, metadata.artist[0], dir);
            if (player.exists(metadata.title)) {
                ipcRenderer.send('notify', 'error', 'Esta música já está na sua playlist.');
                return;
            }
            m.audio.onloadedmetadata = () => {
                player.addMusic(m);
                user_musics.innerHTML = user_musics.innerHTML + "<tr><td>"+metadata.title+"</td><td>"+metadata.artist[0]+"</td><td>"+m.format()+"</td></tr>";
                ipcRenderer.send('notify', 'success', 'Adicionado ' + metadata.title + ' na playlist.');
            };
        });
    }
    
});

let play_btn = document.querySelector("#play-btn");
play_btn.addEventListener('click', (event) => {
    event.preventDefault();

    if (player.isPlaying()) {
        if (player.isPaused()) {
            //Unpause
            play_btn.innerHTML = "<i class=\"fa fa-pause\"></i>";
            player.resume();
            document.querySelector("#current-track").textContent = player.getPlaying().titulo;
        } else {
            //Pause
            player.pause();
            play_btn.innerHTML = "<i class=\"fa fa-play\"></i>";
            document.querySelector("#current-track").textContent = player.getPlaying().titulo + " (Pausado)";
        }
    } else {
        if (player.getList().length == 0) {
            dialog.showErrorBox("Erro", "Você não possui nenhuma música na lista.");
            return;
        }
        player.playFirst();
        play_btn.innerHTML = "<i class=\"fa fa-pause\"></i>";
    }
});


let next_btn = document.querySelector("#btn-next");
next_btn.addEventListener('click', (event) => {
    event.preventDefault();
    player.next();

});

let prev_btn = document.querySelector("#btn-prev");
prev_btn.addEventListener('click', (event) => {
    event.preventDefault();
    player.prev();
});

let query = document.querySelector("#query");
query.addEventListener('input', (event) => {
    let busca = document.querySelector("#query").value.toString().toLowerCase();
    var results = [];
    player.getList().forEach((entry) => {
        if (entry.titulo.toLowerCase().indexOf(busca) != -1 || entry.autor.toLowerCase().indexOf(busca) != -1)
            results.push(entry);
    });
    var rows = "";
    results.forEach((entry) => {
        rows += "<tr><td>"+entry.titulo+"</td><td>"+entry.autor+"</td><td>"+entry.format()+"</td></tr>";
    })
    user_musics.innerHTML = rows;
});

let clear_btn = document.querySelector("#clear-btn");
clear_btn.addEventListener('click', (event) => {
    event.preventDefault();

    player.clear();
});

let conteudo = document.querySelector("#conteudo");
let yt_btn = document.querySelector("#yt-btn");
yt_btn.addEventListener('click', (event) => {
    event.preventDefault();
    
});
