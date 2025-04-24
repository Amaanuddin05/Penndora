import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  myForm: FormGroup;
  message: string = '';
  userError: any;
  isLoading: boolean = false;

  constructor(public fb: FormBuilder, public authService: AuthService, public router: Router) {
    this.myForm = this.fb.group({
      email: ['',[Validators.email, Validators.required]],
      password: ['',[Validators.required]]
    })
  }
     
  onSubmit(form: any) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.message = '';
    this.userError = null;
    
    this.authService.login(form.value.email, form.value.password)
      .then((userCredential) => {
        console.log(userCredential);
        this.message = 'You have been logged in successfully.';
        this.router.navigate(['/myblogs']);
      })
      .catch((error) => {
        console.log(error);
        this.userError = error;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}