import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // ✅ ADD THIS

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhSsQFZGSEoc-5l4DsNzPO8qPf6ZVQzEw",
  authDomain: "naildesigns-live.firebaseapp.com",
  projectId: "naildesigns-live",
  storageBucket: "naildesigns-live.firebasestorage.app",
  messagingSenderId: "504070869012",
  appId: "1:504070869012:web:51aef7d375cfe69adf1701",
  measurementId: "G-EBQ1QJ4265"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 EXPORT ALL REQUIRED SERVICES
export const auth = getAuth(app);        // 🔐 Admin Email/Password login
export const db = getFirestore(app);     // 📝 Firestore (posts, data)
export const storage = getStorage(app);  // 🖼️ Storage (images)
export const analytics = getAnalytics(app);
