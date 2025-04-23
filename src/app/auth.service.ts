import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, User, Auth } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;
  private firestore;
  private userSubject = new BehaviorSubject<User | null>(null);
  diceBearBaseUrl = 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=';

  constructor(private http: HttpClient) {
    // const firebaseConfig = {
    //   apiKey: "AIzaSyAejaIf_fFPGWm8BHKAlWrIj0zFoFFnJUg",
    //   authDomain: "scribe-570db.firebaseapp.com",
    //   projectId: "scribe-570db",
    //   storageBucket: "scribe-570db.appspot.com",
    //   messagingSenderId: "460535388327",
    //   appId: "1:460535388327:web:feea0e275b282c27c9a382",
    //   measurementId: "G-C6FV7HYPQ4"
    // };
    const firebaseConfig = {
      apiKey: "AIzaSyC-aXm870ZIqxg1XMk_Cr90bRop5H6_RZE",
      authDomain: "penndora-6b0ec.firebaseapp.com",
      projectId: "penndora-6b0ec",
      storageBucket: "penndora-6b0ec.firebasestorage.app",
      messagingSenderId: "303580676033",
      appId: "1:303580676033:web:10a750dbaa37433ceeb940",
      measurementId: "G-6XGHK7417T"
    };
    
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp(); // use the existing initialized app
    }
    this.auth = getAuth(app);
    this.firestore = getFirestore(app);

    this.initializeUser();
  }

  private initializeUser() {
    this.auth.onAuthStateChanged((user) => {
      this.userSubject.next(user);
      
      // If a user is logged in, ensure their profile data is in Firestore
      if (user) {
        this.ensureUserInFirestore(user);
      }
    });
  }
  
  private async ensureUserInFirestore(user: User) {
    try {
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // User document doesn't exist in Firestore, create it
        const names = user.displayName ? user.displayName.split(' ') : ['User', ''];
        await setDoc(userDocRef, {
          firstName: names[0],
          lastName: names.length > 1 ? names.slice(1).join(' ') : '',
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error ensuring user in Firestore:', error);
    }
  }

  get user$(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signup(email: string, password: string, firstName: string, lastName: string): Promise<User | null> {
    return new Promise<User | null>((resolve, reject) => {
      createUserWithEmailAndPassword(this.auth, email, password).then((response) => {
        const user = response.user;
        if (user) {
          const seed = `${firstName}-${lastName}-${Math.floor(Math.random() * 10000)}`;
          const avatarUrl = this.getDiceBearAvatar(seed);
          updateProfile(user, {
            displayName: `${firstName} ${lastName}`,
            photoURL: avatarUrl
          }).then(() => {
            // Also save user data to Firestore
            const userDocRef = doc(this.firestore, 'users', user.uid);
            setDoc(userDocRef, {
              firstName: firstName,
              lastName: lastName,
              email: user.email,
              photoURL: avatarUrl,
              uid: user.uid,
              createdAt: new Date()
            }).then(() => {
              this.userSubject.next(user);
              resolve(user);
            }).catch(error => {
              console.error('Error saving user to Firestore:', error);
              reject(error);
            });
          }).catch((error) => {
            reject(error);
          });
        } else {
          reject(new Error('User object not found'));
        }
      }).catch((error) => {
        reject(error);
      });
    });
  }

  private getDiceBearAvatar(seed: string): string {
    return `${this.diceBearBaseUrl}${encodeURIComponent(seed)}`;
  }
}
