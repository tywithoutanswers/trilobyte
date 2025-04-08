const { auth, db, collection, getDocs, doc, onAuthStateChanged, getDoc, setDoc } = window.firebase || {};
if (!window.firebase) {
  console.error('Firebase not initialized. Ensure Firebase scripts load before this module.');
}
const fishList = window.fishList;
const fishCaught = window.fishCaught;

export function renderUploadJSON() {
  const uploadSection = document.getElementById('upload-section');
  if (!uploadSection) {
    return;
  }

  let user = null;
  let userName = '';
  let userEmail = '';
  
  async function loadData() {
    try {
      if (!user) return; 
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
      } else {
        const player = playerDocSnapshot.data();
        let displayHtml = `
          <strong>Username:</strong> ${player.name || 'N/A'}<br />
          <strong>Total Score:</strong> ${player.totalscore || 0}<br />
          <strong>Total Fish:</strong> ${player.totalfish || 0}<br />
          <strong>Fish Caught:</strong><br />
        `;
        for (const fishKey in fishList) {
          const fishName = fishList[fishKey].name;
          const count = player.fishCaught && player.fishCaught[fishName] ? player.fishCaught[fishName] : 0;
          displayHtml += `<strong>${fishName}:</strong> ${count}<br>`;
        }
        dataDisplay.innerHTML = displayHtml;
        Object.assign(window.fishCaught, player.fishCaught); 
      }
    } catch (error) {
      console.error('Error loading data from Firestore:', error);
      uploadSection.querySelector('#data-display').innerHTML = `<p>Failed to load data: ${error.message}</p>`;
    }
  }
  async function saveData() {
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
        console.error('No user signed in; cannot save data.');
        return;
      }
      const userDocRef = doc(db, 'users', user.uid);
      const playerDataDocRef = doc(collection(userDocRef, 'playerData'), 'profile');
      await setDoc(playerDataDocRef, window.jsonData, { merge: true });
      
      console.log('Game Data saved to Firebase!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save game data: ' + error.message);
    }
  }
  function updateUploadUI() {
    if (!user) {
      uploadSection.innerHTML = `
        <p>Please <a href="#" id="upload-login-link">sign in</a> to save or load data.</p>
      `;
      const loginLink = document.getElementById('upload-login-link');
      if (loginLink) {
        loginLink.addEventListener('click', (e) => {
          e.preventDefault();
          window.history.pushState({}, '', '/login');
          window.renderPage();
        });
      }
      return;
    }

    uploadSection.innerHTML = `
      <div class="upload-json">
        <h2>Profile</h2>
        <div id="data-display">Loading data...</div>
        <button id="save-button">Save Data</button>
      </div>
    `;
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        await saveData();
        //alert('Game Data saved manually!');
      });
    }

    loadData();
  }

  const originalFishCaught = new Proxy(fishCaught, {
    set(target, prop, value) {
      target[prop] = value;
      if (user) { // Only save if user is signed in
        saveData(); // Auto-save on change
      }
      return true;
    }
  });
  window.fishCaught = originalFishCaught;
  if (onAuthStateChanged) {
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
  } else {
    console.error('onAuthStateChanged not available. Firebase initialization failed.');
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