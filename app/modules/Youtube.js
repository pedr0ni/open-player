const https = require("https");

filePath = path.join(__dirname, '../..', 'database/key.txt');

class Youtube {

    constructor() {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) throw err;
            this.url = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=%query%&key=" + data;
            console.log("Set!");
        });
    }

    search(q, callback) {
        return https.get(this.url.replace("%query%", q), (response) => {
            var body = "";
            response.on('data', (value) => {
                body += value;
            });
            response.on('end', () => {
                callback(JSON.parse(body));
            });
        });
    }
}