const json = require('json-file');
const fs = require('fs');

let user_config = __dirname + "/database/user.config.json";

class User {
    constructor(name,created_at,updated_at) {
        this.name = name;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = {

    /**
     * @return boolean
     */
    hasUser: () => {
        return json.read(user_config).get('name') != undefined;
    },
    /**
     * Altera o user.config.json ~
     * @param name
     */
    createUser: (name) => {
        let up = Date.now();
        json.read(user_config).set('name', name)
            .set('created_at', up)
            .set('updated_at', up)
            .write();
    },
    /**
     * @return User at user.config.json
     */
    getUser: () => {
        let file = json.read(user_config);
        return new User(file.get('name'), file.get('created_at'), file.get('updated_at'));
    }

};
