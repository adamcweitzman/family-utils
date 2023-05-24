import firebase from 'firebase/compat/app'
import { getFirestore } from '@firebase/firestore'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'
// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js'
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyD1r6C8Co0ytvIb5hrXTpG95nGOhkWvHF4',
  authDomain: 'family-utils-5c765.firebaseapp.com',
  projectId: 'family-utils-5c765',
  storageBucket: 'family-utils-5c765.appspot.com',
  messagingSenderId: '927793641173',
  appId: '1:927793641173:web:5777409231d9025115d45c',
  measurementId: 'G-49XRRG7P59'
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()
export default db
