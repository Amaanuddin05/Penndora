import { Component } from '@angular/core';
import { auth } from '../firebase.utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  loggedIn: boolean = false;
  user: any;
  auth = auth;

  constructor(private router: Router) {
    this.user = this.auth.currentUser;
    if(this.user) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }

    this.auth.onAuthStateChanged((user) => {
      this.user = user;
      if(user){
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    })
  }

  ngOnInit() {
  }

  logout(){
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Error during sign out:', error);
    });
  }
  
  confirmLogout() {
    if (confirm('Are you sure you want to log out?')) {
      this.logout();
    }
  }
}
