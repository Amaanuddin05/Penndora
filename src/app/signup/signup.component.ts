import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { AuthService } from '../auth.service';
import { initializeApp } from 'firebase/app';
import { Router } from '@angular/router';

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

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  myForm: FormGroup;
  message: string = '';
  userError: any;

  constructor(public fb: FormBuilder, public authService: AuthService,private router: Router) {
    this.myForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.checkIfMatchingPasswords('password', 'confirmPassword')
    });
  }

  checkIfMatchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup) => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[confirmPasswordKey];
      if (password.value === confirmPassword.value)
        return;
      else {
        confirmPassword.setErrors({
          notEqualToPassword: true
        });
      }
    };
  }

  onSubmit(signupForm: any) {
    if (this.myForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const email: string = signupForm.value.email;
    const password: string = signupForm.value.password;
    const firstName: string = signupForm.value.firstName;
    const lastName: string = signupForm.value.lastName;

    this.authService.signup(email, password, firstName, lastName).then((user: any) => {
      if (!user || !user.uid) {
        throw new Error('User object is not defined or missing uid');
      }
      return setDoc(doc(firestore, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        photoURL: user.photoURL || '',
        interests: '',
        bio: '',
        hobbies: ''
      });
    })
    .then(() => {
      this.message = "You have been signed up successfully.";
      this.router.navigate(['/myblogs']); 
    })
    .catch((error: any) => {
      console.log(error);
      this.userError = error;
    });
  }
}
