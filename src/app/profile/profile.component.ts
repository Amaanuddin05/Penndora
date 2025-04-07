import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any = {};
  posts: any[] = [];
 
  constructor(public activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((routeParams: { [key: string]: any }) => {
      this.getProfile(routeParams['id']);
      this.getUsersPosts(routeParams['id']);
    });
  }

  getProfile(id: string) {
    firebase.firestore().collection("users").doc(id).get().then((documentSnapshot) => {
      if (documentSnapshot.exists) {
        this.user = documentSnapshot.data();
        this.user.displayName = this.user.firstName + " " + this.user.lastName;
        this.user.id = documentSnapshot.id;
        this.user.hobbies = this.user.hobbies.split(',');
        console.log(this.user);
      } else {
        console.log('User not found');
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  getUsersPosts(id: string) {
    firebase.firestore().collection("posts")
      .where("owner", "==", id).get().then((querySnapshot) => {
        this.posts = querySnapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() }; // ✅ include id with each post
        });
      }).catch((error) => {
        console.log(error);
      });
  }

}
