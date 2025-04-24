import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { doc, setDoc } from 'firebase/firestore';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { firestore } from '../firebase.utils';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  myForm: FormGroup;
  message: string = '';
  userError: any;
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(public fb: FormBuilder, public authService: AuthService, private router: Router) {
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
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

    if (this.isLoading) return;
    
    this.isLoading = true;
    this.message = '';
    this.userError = null;

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
    })
    .finally(() => {
      this.isLoading = false;
    });
  }
}
