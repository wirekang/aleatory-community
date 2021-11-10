import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyCUrkS2HUWgUUYsQUq1DA-xwB0MNbsNu74",
  authDomain: "aleatory-community.firebaseapp.com",
  projectId: "aleatory-community",
  storageBucket: "aleatory-community.appspot.com",
  messagingSenderId: "978604432033",
  appId: "1:978604432033:web:df40ec9a4f1c6a4158aee0",
  measurementId: "G-66PNR5NN30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
console.log("sdf")