import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, User, Auth } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { getApps, getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;
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
    // const app = initializeApp(firebaseConfig);
    // this.auth = getAuth(app);
    

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // use the existing initialized app
}
this.auth = getAuth(app);

    this.initializeUser();
  }

  private initializeUser() {
    this.auth.onAuthStateChanged((user) => {
      this.userSubject.next(user);
    });
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
          const avatarSvg = this.getDiceBearAvatar(seed);
          updateProfile(user, {
            displayName: `${firstName} ${lastName}`,
            photoURL: avatarSvg
          }).then(() => {
            this.userSubject.next(user);
            resolve(user);
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
    return `${this.diceBearBaseUrl}${seed}`;
  }
}
