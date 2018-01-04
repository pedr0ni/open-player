const dialog = require('electron').remote.dialog;
const fs = require('fs');
const mm = require('musicmetadata');
const { ipcRenderer } = require('electron');

let bar = document.querySelector("#bar");
let yt = new Youtube();

let user_musics = document.querySelector("#user-musics");
let player = new Player([user_musics, document.querySelector("#current-track"), document.querySelector("#play-btn"), bar], false);

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
                user_musics.innerHTML = user_musics.innerHTML + "<tr><td>"+metadata.title+"</td><td>"+metadata.artist[0]+"</td><td>"+m.format()+"</td><td><a>"+m.getIcon()+"</a></td></tr>";
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
/*query.addEventListener('input', (event) => {
    let busca = document.querySelector("#query").value.toString().toLowerCase();
    var results = [];
    player.getList().forEach((entry) => {
        if (entry.titulo.toLowerCase().indexOf(busca) != -1 || entry.autor.toLowerCase().indexOf(busca) != -1)
            results.push(entry);
    });
    var rows = "";
    results.forEach((entry) => {
        rows += "<tr><td>"+entry.titulo+"</td><td>"+entry.autor+"</td><td>"+entry.format()+"</td><td><a>"+entry.getIcon()+"</a></td></tr>";
    })
    user_musics.innerHTML = rows;
});*/
query.addEventListener('keydown', (event) => {
    if (event.key == "Enter") {
        $("#loader").addClass("active");
        $(user_musics).html("");
        let req = yt.search(query.value.toString(), (res) => {
            console.log(res);
            let lista = res.items;
            
            lista.forEach(entry => {
                let snippet = entry.snippet;
                $(user_musics).append("<tr><td>" + snippet.title + "</td><td>" + snippet.channelTitle + "</td><td>00:00</td><td><i class=\"fa fa-download\"></i></td></tr>");
            });
            
            $("#loader").removeClass("active");
        });
    }
});
query.addEventListener('input', (event) => {
    if (query.value.length == 0) {
        player.renderList();
    }
});

let clear_btn = document.querySelector("#clear-btn");
clear_btn.addEventListener('click', (event) => {
    event.preventDefault();
    player.clear();
});

let list_fav_btn = document.querySelector("#list-fav-btn");
list_fav_btn.addEventListener('click', (event) => {
    event.preventDefault();
    if (player.fav_list) {
        player.fav_list = false;
        $(list_fav_btn.children).removeClass('fa').addClass('far');
        player.renderList();
    } else {
        player.fav_list = true;
        $(list_fav_btn.children).removeClass('far').addClass('fa');
        player.renderList();
    }
});