import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseConfig } from '../environments/firebase.environment';

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); 
}

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

export const firestore = getFirestore(app);
export const firebaseApp = app;

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
      console.error("Compat auth persistence error:", error);
    });
}

export default firebase; 