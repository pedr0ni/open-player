const data = require("../../modules/data");
const { ipcRenderer } = require('electron');

let user_btn = document.querySelector("#user-btn");

user_btn.addEventListener('click', (event) => {
    event.preventDefault();
    let username = document.querySelector("#username").value;
    if (username == "") {
        ipcRenderer.send('dialog', 'error', 'Digite um username válido.');
        return;
    }
    ipcRenderer.send('dialog', 'msg', "Usuário " + username + " criado com sucesso.");
    data.createUser(username);
});
