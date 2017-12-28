const jsonfile = require('jsonfile-promised');
const fs = require('fs');

let user_config = __dirname + "/database/user.config.json";

module.exports = {

    hasUser: function() {
        return fs.existsSync(user_config);
    },
    createUser: function(name) {
        console.log("[INFO] Creating user " + name);
        jsonfile.writeFile(user_config, {name: name, created_at: Date.now()})
            .then(() => {
                console.log("[INFO] User " + name + " successfuly created");
            }).catch((err) => {
                console.log(err);
            });
    }

};
