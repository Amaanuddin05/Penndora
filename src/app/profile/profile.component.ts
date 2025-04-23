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
  isLoading: boolean = true;
 
  constructor(public activatedRoute: ActivatedRoute) { }

  async ngOnInit() {
    this.isLoading = true;
    
    this.activatedRoute.params.subscribe(async (routeParams: { [key: string]: any }) => {
      try {
        await Promise.all([
          this.getProfile(routeParams['id']),
          this.getUsersPosts(routeParams['id'])
        ]);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        this.isLoading = false;
      }
    });
  }

  getProfile(id: string) {
    return new Promise<void>((resolve, reject) => {
      firebase.firestore().collection("users").doc(id).get().then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          this.user = documentSnapshot.data();
          this.user.displayName = this.user.firstName + " " + this.user.lastName;
          this.user.id = documentSnapshot.id;
          this.user.hobbies = this.user.hobbies ? this.user.hobbies.split(',') : [];
          console.log(this.user);
          resolve();
        } else {
          console.log('User not found');
          resolve();
        }
      }).catch((error) => {
        console.log(error);
        reject(error);
      });
    });
  }

  getUsersPosts(id: string) {
    return new Promise<void>((resolve, reject) => {
      firebase.firestore().collection("posts")
        .where("owner", "==", id).get().then((querySnapshot) => {
          this.posts = querySnapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() };
          });
          resolve();
        }).catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

}
