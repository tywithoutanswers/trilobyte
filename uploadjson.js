import { auth, db, collection, getDocs, doc, onAuthStateChanged, getDoc, setDoc } from '@/firebase';

const fishList = window.fishList;
const fishCaught = window.fishCaught;

export function renderUploadJSON() {
  const uploadSection = document.getElementById('upload-section');
  if (!uploadSection) {
    console.error('Upload section not found in the DOM');
    return;
  }

  let user = null;
  let userName = '';
  let userEmail = '';

  onAuthStateChanged(auth, async (currentUser) => {
    user = currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userName = userData.username || 'Unknown';
        userEmail = userData.email || user.email || 'Unknown';
      } else {
        console.error('User document not found in Firestore');
        userName = 'Unknown';
        userEmail = user.email || 'Unknown';
      }
    }
    updateUploadUI();
  });

  function updateUploadUI() {
    if (!user) {
      uploadSection.innerHTML = `
        <p>Please <a href="#" id="upload-login-link">sign in</a> to upload or load data.</p>
      `;
      const loginLink = document.getElementById('upload-login-link');
      if (loginLink) {
        loginLink.addEventListener('click', (e) => {
          e.preventDefault();
          window.history.pushState({}, '', '/login');
          renderPage();
        });
      } else {
        console.error('Upload login link not found in the DOM');
      }
      return;
    }

    uploadSection.innerHTML = `
      <div class="upload-json">
        <h2>JSON Upload to Firebase</h2>
        <p>Welcome, ${userName}!</p>
        <button id="upload-sample-button">Upload Game Data</button>
        <button id="load-button">Load Data</button>
        <div id="data-display"></div>
      </div>
    `;

    const sampleButton = document.getElementById('upload-sample-button');
    if (sampleButton) {
      sampleButton.addEventListener('click', async () => {
        try {
          const fishCaughtData = {};
          for (const fishKey in fishList) {
            const fishName = fishList[fishKey].name;
            fishCaughtData[fishName] = fishCaught[fishName] || 0;
          }

          const gameData = {
            name: userName,
            email: userEmail,
            totalscore: calculateTotalScore(),
            totalfish: calculateTotalFish(),
            fishCaught: fishCaughtData,
          };
          window.jsonData = gameData;
          if (!user) {
            alert('Please sign in to upload data.');
            return;
          }
          const userDocRef = doc(db, 'users', user.uid);
          const playerDataDocRef = doc(collection(userDocRef, 'playerData'), 'profile');
          await setDoc(playerDataDocRef, window.jsonData, { merge: true });
          alert('Game Data updated in Firebase!');
        } catch (error) {
          console.error('Upload failed:', error);
          alert('Failed to upload game data: ' + error.message);
        }
      });
    } else {
      console.error('Upload sample button not found in the DOM');
    }

    const loadButton = document.getElementById('load-button');
    if (loadButton) {
      loadButton.addEventListener('click', async () => {
        try {
          if (!user) {
            alert('Please sign in to load data.');
            return;
          }
          const userDocRef = doc(db, 'users', user.uid);
          const playerDataDocRef = doc(collection(userDocRef, 'playerData'), 'profile');
          const playerDocSnapshot = await getDoc(playerDataDocRef);
          const dataDisplay = document.getElementById('data-display');
          if (!dataDisplay) {
            console.error('Data display element not found in the DOM');
            return;
          }
          if (!playerDocSnapshot.exists()) {
            dataDisplay.innerHTML = '<p>No data found for this user.</p>';
            return;
          }
          const player = playerDocSnapshot.data();
          let html = '<h3>Loaded Player Data</h3>';
          html += `
              <strong>Name:</strong> ${player.name || 'N/A'}<br />
              <strong>Email:</strong> ${player.email || 'N/A'}<br />
              <strong>Total Score:</strong> ${player.totalscore || 0}<br />
              <strong>Total Fish:</strong> ${player.totalfish || 0}<br />
              <strong>Fish Caught:</strong><br />
          `;
          for (const fishKey in fishList) {
            const fishName = fishList[fishKey].name;
            const count = player.fishCaught && player.fishCaught[fishName] ? player.fishCaught[fishName] : 0;
            html += `<strong>${fishName}:</strong> ${count}</br>`;
          }
          dataDisplay.innerHTML = html;
        } catch (error) {
          console.error('Error loading data from Firestore:', error);
          alert('Failed to load data: ' + error.message);
        }
      });
    } else {
      console.error('Load button not found in the DOM');
    }
  }

  function calculateTotalScore() {
    let total = 0;
    for (const fishKey in fishList) {
      const fishName = fishList[fishKey].name;
      const pointValue = fishList[fishKey].pointValue || 0;
      const count = fishCaught[fishName] || 0;
      total += count * pointValue;
    }
    return total;
  }

  function calculateTotalFish() {
    let total = 0;
    for (const fishName in fishCaught) {
      total += fishCaught[fishName] || 0;
    }
    return total;
  }
}