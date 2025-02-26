const http = require('http');
const app = require("./app");

const port = 3000; // This should probably not be hardcoded

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});