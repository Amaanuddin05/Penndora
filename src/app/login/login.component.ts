import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import 'firebase/auth';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {


  myForm: FormGroup;
  message:string='';
  userError:any;

  constructor(public fb: FormBuilder , public authService: AuthService, public router:Router)
  {
    this.myForm = this.fb.group({
      email: ['',[Validators.email,Validators.required]],
      password: ['',[Validators.required]]
    })
  }
  
     
    onSubmit(form: any) {
      
      this.authService.login(form.value.email, form.value.password)
        .then((userCredential) => {
          console.log(userCredential);
          this.message = 'You have been logged in successfully.';
          this.router.navigate(['/myblogs'])
        })
        .catch((error) => {
          console.log(error);
          this.userError = error;
        });
    }
  
  }