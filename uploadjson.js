import { auth, db, collection, addDoc, getDocs, doc, onAuthStateChanged } from '@/firebase';

const uploadJsonModule = {
  jsonData: ref([]),
  loadedData: ref([]),
  loadAttempted: ref(false),
  user: ref(null),
  loading: ref(true),
  init() {
    onAuthStateChanged(auth, (currentUser) => {
      uploadJsonModule.user.value = currentUser;
      uploadJsonModule.loading.value = false;
    });
  },
  handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          uploadJsonModule.jsonData.value = JSON.parse(e.target.result);
        } catch (error) {
          alert('Invalid JSON file: ' + error.message);
          uploadJsonModule.jsonData.value = [];
        }
      };
      reader.readAsText(file);
    }
  },
  async uploadData() {
    if (!uploadJsonModule.user.value) {
      alert('Please sign in first.');
      return;
    }
    
    if (!uploadJsonModule.jsonData.value.length) {
      alert('No data to upload.');
      return;
    }
    
    const userDocRef = doc(db, 'users', uploadJsonModule.user.value.uid);
    const dataCollection = collection(userDocRef, 'playerData');
    for (const row of uploadJsonModule.jsonData.value) {
      if (Object.keys(row).length === 0) continue;
      await addDoc(dataCollection, row);
    }
    alert('Data uploaded successfully!');
  },
  async loadData() {
    uploadJsonModule.loadAttempted.value = true;
    uploadJsonModule.loadedData.value = [];

    if (!uploadJsonModule.user.value) {
      alert('Please sign in to load data.');
      return;
    }
    
    const userDocRef = doc(db, 'users', uploadJsonModule.user.value.uid);
    const dataCollection = collection(userDocRef, 'playerData');
    const querySnapshot = await getDocs(dataCollection);

    if (querySnapshot.empty) {
      return;
    }
    
    querySnapshot.forEach((doc) => {
      uploadJsonModule.loadedData.value.push(doc.data());
    });
  },
};
uploadJsonModule.init();
