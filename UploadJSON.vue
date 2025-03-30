<template>
  <div class="upload-json">
    <h2>JSON Upload to Firebase</h2>
    <p v-if="loading">Loading authentication state...</p>
    <p v-else-if="!user">Please <router-link to="/login">sign in</router-link> to upload or load data.</p>
    <div v-else>
      <input type="file" @change="handleFileUpload" accept=".json" />
      <button @click="uploadData">Upload to Firebase</button>
      <button @click="uploadSampleData">Upload Sample JSON</button>
      <button @click="loadData">Load Data</button>

      <!-- Display the loaded data -->
      <div v-if="loadedData.length" class="data-display">
        <h3>Loaded Player Data</h3>
        <ul>
          <li v-for="(player, index) in loadedData" :key="index">
            <strong>Name:</strong> {{ player.name }}<br />
            <strong>Email:</strong> {{ player.email }}<br />
            <strong>Total Score:</strong> {{ player.totalscore }}<br />
            <strong>Total Fish:</strong> {{ player.totalfish }}<br />
            <strong>Trilobites:</strong> {{ player.trilobites }}<br />
            <strong>Cod:</strong> {{ player.cod }}<br />
            <strong>Salmon:</strong> {{ player.salmon }}<br />
            <strong>Trouts:</strong> {{ player.trouts }}<br />
            <hr />
          </li>
        </ul>
      </div>
      <p v-else-if="loadedData.length === 0 && loadAttempted">No data found for this user.</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { auth, db, collection, addDoc, getDocs, doc, onAuthStateChanged } from '@/firebase';

export default {
  setup() {
    const jsonData = ref([]);
    const loadedData = ref([]);
    const loadAttempted = ref(false);
    const user = ref(null);
    const loading = ref(true);

    console.log('UploadJSON.vue setup');

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('onAuthStateChanged fired:', currentUser ? currentUser.uid : 'No user');
      user.value = currentUser;
      loading.value = false;
      if (!currentUser) {
        console.log('No user signed in, redirecting to login');
        this.$router.push('/login');
      }
    }, (error) => {
      console.error('onAuthStateChanged error:', error);
      loading.value = false;
    });

    return {
      jsonData,
      loadedData,
      loadAttempted,
      user,
      loading,
      unsubscribe,
    };
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            this.jsonData = JSON.parse(e.target.result);
            console.log('Parsed JSON from file input:', this.jsonData);
          } catch (error) {
            console.error('Error parsing JSON from file input:', error);
            alert('Invalid JSON file: ' + error.message);
            this.jsonData = [];
          }
        };
        reader.readAsText(file);
      }
    },
    async uploadData() {
      try {
        console.log('uploadData called, user:', this.user);
        if (!this.user) {
          throw new Error('user is not defined');
        }

        if (!this.jsonData.length) {
          alert('No data to upload. Please select a valid JSON file.');
          return;
        }

        const userDocRef = doc(db, 'users', this.user.uid);
        const dataCollection = collection(userDocRef, 'playerData');
        for (const row of this.jsonData) {
          if (Object.keys(row).length === 0) continue;
          await addDoc(dataCollection, row);
        }
        alert('JSON Data uploaded to Firebase!');
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload JSON data: ' + error.message);
      }
    },
    async uploadSampleData() {
      try {
        console.log('uploadSampleData called, user:', this.user);
        const sampleData = [
          {
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
        console.log('Sample JSON:', sampleData);

        this.jsonData = sampleData;
        await this.uploadData();
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload JSON data: ' + error.message);
      }
    },
    async loadData() {
      try {
        this.loadAttempted = true;
        this.loadedData = [];

        if (!this.user) {
          alert('Please sign in to load data.');
          return;
        }

        const userDocRef = doc(db, 'users', this.user.uid);
        const dataCollection = collection(userDocRef, 'playerData');
        const querySnapshot = await getDocs(dataCollection);

        if (querySnapshot.empty) {
          console.log('No data found for this user.');
          return;
        }

        querySnapshot.forEach((doc) => {
          this.loadedData.push(doc.data());
        });
        console.log('Loaded data:', this.loadedData);
      } catch (error) {
        console.error('Error loading data from Firestore:', error);
        alert('Failed to load data: ' + error.message);
      }
    },
  },
};
</script>