// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyAsgYVJx_bcz_Qou6YK9pvb2ZRFTkWjs8Y',
	authDomain: 'powerlifting-leaderboard.firebaseapp.com',
	projectId: 'powerlifting-leaderboard',
	storageBucket: 'powerlifting-leaderboard.appspot.com',
	messagingSenderId: '328304782718',
	appId: '1:328304782718:web:5dbbe0d8afc0a8c393172f',
	measurementId: 'G-SQTBEWW1ET'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
