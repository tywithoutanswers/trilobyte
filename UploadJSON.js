import { auth, db, collection, addDoc, getDocs, doc, onAuthStateChanged } from '@/firebase';

export function renderUploadJSON() {
  const uploadSection = document.getElementById('upload-section');
  if (!uploadSection) {
    console.error('Error');
    return;
  }

  let user = null;
  onAuthStateChanged(auth, (currentUser) => {
    user = currentUser;
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
        console.error('Error');
      }
      return;
    }

    uploadSection.innerHTML = `
      <div class="upload-json">
        <h2>JSON Upload to Firebase</h2>
        <input type="file" id="json-file" accept=".json" />
        <button id="upload-button">Upload to Firebase</button>
        <button id="upload-sample-button">Upload Sample JSON</button>
        <button id="load-button">Load Data</button>
        <div id="data-display"></div>
      </div>
    `;

    const fileInput = document.getElementById('json-file');
    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              window.jsonData = JSON.parse(e.target.result);
              console.log('Parsed JSON from file input:', window.jsonData);
            } catch (error) {
              console.error('Error parsing JSON from file input:', error);
              alert('Invalid JSON file: ' + error.message);
              window.jsonData = [];
            }
          };
          reader.readAsText(file);
        }
      });
    } else {
      console.error('JSON file Error');
    }

    const uploadButton = document.getElementById('upload-button');
    if (uploadButton) {
      uploadButton.addEventListener('click', async () => {
        try {
          if (!user) {
            alert('Please sign in to upload data.');
            return;
          }
          if (!window.jsonData || !window.jsonData.length) {
            alert('No data to upload. Please select a valid JSON file.');
            return;
          }
          const userDocRef = doc(db, 'users', user.uid);
          const dataCollection = collection(userDocRef, 'playerData');
          for (const row of window.jsonData) {
            if (Object.keys(row).length === 0) continue;
            await addDoc(dataCollection, row);
          }
          alert('JSON Data uploaded to Firebase!');
        } catch (error) {
          console.error('Upload failed:', error);
          alert('Failed to upload JSON data: ' + error.message);
        }
      });
    } else {
      console.error('Upload button Error');
    }

    const sampleButton = document.getElementById('upload-sample-button');
    if (sampleButton) {
      sampleButton.addEventListener('click', async () => {
        try {
          const sampleData = [
            {
              userID: 1,
              name: "John Doe",
              email: "placeholder@placeholder.ie",
              totalscore: 0,
              totalfish: 0,
              trilobites: 0,
              cod: 0,
              salmon: 0,
              trouts: 0,
            },
          ];
          window.jsonData = sampleData;
          if (!user) {
            alert('Please sign in to upload data.');
            return;
          }
          const userDocRef = doc(db, 'users', user.uid);
          const dataCollection = collection(userDocRef, 'playerData');
          for (const row of window.jsonData) {
            if (Object.keys(row).length === 0) continue;
            await addDoc(dataCollection, row);
          }
          alert('JSON Data uploaded to Firebase!');
        } catch (error) {
          console.error('Upload failed:', error);
          alert('Failed to upload JSON data: ' + error.message);
        }
      });
    } else {
      console.error('Upload sample Error');
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
          const dataCollection = collection(userDocRef, 'playerData');
          const querySnapshot = await getDocs(dataCollection);
          const dataDisplay = document.getElementById('data-display');
          if (!dataDisplay) {
            console.error('Data display element not found in the DOM');
            return;
          }
          if (querySnapshot.empty) {
            dataDisplay.innerHTML = '<p>No data found for this user.</p>';
            return;
          }
          let html = '<h3>Loaded Player Data</h3><ul>';
          querySnapshot.forEach((doc) => {
            const player = doc.data();
            html += `
              <li>
                <strong>Name:</strong> ${player.name}<br />
                <strong>Email:</strong> ${player.email}<br />
                <strong>Total Score:</strong> ${player.totalscore}<br />
                <strong>Total Fish:</strong> ${player.totalfish}<br />
                <strong>Trilobites:</strong> ${player.trilobites}<br />
                <strong>Cod:</strong> ${player.cod}<br />
                <strong>Salmon:</strong> ${player.salmon}<br />
                <strong>Trouts:</strong> ${player.trouts}<br />
              </li>
            `;
          });
          html += '</ul>';
          dataDisplay.innerHTML = html;
        } catch (error) {
          console.error('Error loading data from Firestore:', error);
          alert('Failed to load data: ' + error.message);
        }
      });
    } else {
      console.error('Load button Error');
    }
  }
}