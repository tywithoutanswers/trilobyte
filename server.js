import { createServer } from 'http';
import { readFile } from 'fs/promises';
import admin from 'firebase-admin';


const serviceAccount = await import('../serviceAccountKey.json', { assert: { type: 'json' } });
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount.default),
});

const db = admin.firestore();


let playerData = null;
try {
  const data = await readFile('../placeholderData.json', 'utf8');
  const jsonData = JSON.parse(data);
  playerData = jsonData.playerdata[0];
  console.log('Player Data:', playerData);

  
  const saveToFirestore = async () => {
    try {
      const playerRef = db.collection('playerData').doc(playerData.name);
      await playerRef.set(playerData);
      console.log('Player data saved to Firestore:', playerData.name);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  };

  await saveToFirestore();
} catch (err) {
  console.log('Error reading the file:', err);
}


const server = createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    if (playerData) {
      const details = `
        userID: ${playerData.userID}<br>
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


server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});