// Import necessary Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';

// Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyB9EKMnm56WYp4Z3-wl9ACjt075sVPtcRk",
  authDomain: "trilobyte-4467e.firebaseapp.com",
  projectId: "trilobyte-4467e",
  storageBucket: "trilobyte-4467e.firebasestorage.app",
  messagingSenderId: "274511927374",
  appId: "1:274511927374:web:ff12db499028d8250b4b1f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function adds the different temperature-based messages
// Function adds the different temperature-based messages
function getMessage(temp) {
  if (temp <= -20) {
    return "-> Most water bodies will be frozen solid, don't bother fishing.";
  }
  else if (temp <= -10) {
    return "-> Fishing at this temperature is extremely challenging";
  }
  else if (temp <= -5) {
    return "-> Water begins to freeze, you might need to break through ice to fish";
  }
  else if (temp <= 0) {
    return "-> Layered clothing and quick setups essential!";
  }
  else if (temp <= 3) {
    return "-> Cold-water species are more active, but it's still quite chilly";
  }
  else if (temp <= 4) {
    return "-> Productive fishing to be had, but you will require warm clothing for comfort.";
  }
  else if (temp <= 5) {
    return "-> Fish like Trout and Pike may be more active";
  }
  else if (temp <= 6) {
    return "->  Good time to catch species like trout or perch in the cool, oxygen-rich waters";
  }
  else if (temp <= 7) {
    return "-> A comfortable temperature for fishing, many fish will be more active";
  }
  else if (temp <= 8) {
    return "-> Fish are usually quite active, making it a great temperature for a variety of species";
  }
  else if (temp <= 9) {
    return "-> Fishing will be quite enjoyable, with plenty of opportunities for successful catches";
  }
  else if (temp <= 10) {
    return "-> Temperate weather and active fish make for perfect fishing!";
  }
  else if (temp <= 11) {
    return "-> Warm enough for extended fishing trips with minimal discomfort";
  }
  else if (temp <= 12) {
   return "-> Fishing will feel crisp and refreshing, with fish becoming more active as the water warms";
  }
  else if (temp <= 13) {
	return "-> Fishing conditions are ideal for a variety of species,";
  }
  else if (temp <= 14) {
    return "-> Fishing here will offer comfortable balance, with consistent bites and longer fishing sessions.";
  }
  else if (temp <= 15) {
    return "-> Fish will be actively feeding and the weather is warm enough to keep you comfortable";
  }
  else if (temp <= 20) {
    return "-> Fishing will be great for a wide range of species, as the fish will be very active";
  }
  else if (temp <= 25) {
    return "-> Fish will be feeding heavily, though remember to stay hydrated!";
  }
  else if (temp <= 30) {
    return "-> Fish will potentially become lethargic in the warmer waters";
  }
  else if (temp <= 35) {
    return "-> Extreme heat will cause fish to be less active, making a catch difficult";
  }
  else if (temp <= 40) {
    return "-> Fish will be too sluggish in the hot water, don't bother fishing.";
  }
}
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const auth = getAuth();


// Fetches data from Firestore
async function fetchData() {
  try {
    // References for the doc
    // weather is the collection
    // weatherData is the file
    const docRef = doc(db, "weather", "weatherData");

    // Gets document data
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      // Save the generated HTML content as a variable
      let htmlContent = '';

      // Specifies each city
      const cities = [
        "Galway,ie", "Dublin,ie", "Brest,fr", "Cardiff,uk",
        "Cork,ie", "Lisbon,pt", "Reykjavik,is", "The Hague,nl"
      ];

      // Loops through all of the cities
      cities.forEach(city => {
        if (data[city]) {
          const temp = data[city];
          const extraMessage = getMessage(temp);

          // Removes country code from the string (Galway,ie -> Galway)
          const cityName = city.split(',')[0];
          htmlContent += `<p>${cityName} Temp: ${temp}°C ${extraMessage}</p>`;
        }
      });

      // Display the content in the HTML
      const dataDisplay = document.getElementById('data-display');
      dataDisplay.innerHTML = htmlContent;

    // Error Handling
    } else {
      console.log("WEATHER DOC NOT FOUND");
    }
  } catch (error) {
    console.error("ERROR FETCHING WEATHER DOC:", error);
  }
}

// Calls the function
fetchData();
