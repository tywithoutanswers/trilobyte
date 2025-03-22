const http = require('http');
const fs = require('fs');

// Read the JSON file before starting the server
let playerData = null;
fs.readFile('placeholderData.json', 'utf8', (err, data) => {
  if (err) {
    console.log('Error reading the file:', err);
    return;
  }

  // Parse the JSON data and store it in playerData
  const jsonData = JSON.parse(data);
  playerData = jsonData.playerdata[0]; // Access the first element of the playerdata array
  console.log(playerData.name); // Outputs: John Doe
});

// Create the HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    if (playerData) {
      const details = `
        Name: ${playerData.name}<br>
        Email: ${playerData.email}<br>
        Totalscore: ${playerData.totalscore}<br>
        Totalfish: ${playerData.totalfish}<br>
        Trilobites: ${playerData.trilobites}<br>
        Cod: ${playerData.cod}<br>
        Salmon: ${playerData.salmon}<br>
        Trouts: ${playerData.trouts}
      `;
      res.end(details);
    } else {
      res.end('Loading player data...');
    }
  }
});

// Start the server
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});