import { Component } from '@angular/core';
import * as firebase from 'firebase/app';
import { Auth,getAuth, onAuthStateChanged } from 'firebase/auth'
import 'firebase/auth';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  loggedIn: boolean = false;
  user: any;
  auth = getAuth();

  constructor() {

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
    this.auth.signOut();
  }

}
