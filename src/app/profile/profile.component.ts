import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import firebase from '../firebase.utils';
import { auth } from '../firebase.utils';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any = {};
  posts: any[] = [];
  isLoading: boolean = true;
  isOwnProfile: boolean = false;
  currentUserId: string | null = null;
 
  constructor(public activatedRoute: ActivatedRoute) { }

  async ngOnInit() {
    this.isLoading = true;
    
    // Get current user
    this.currentUserId = auth.currentUser?.uid || null;
    
    this.activatedRoute.params.subscribe(async (routeParams: { [key: string]: any }) => {
      const profileId = routeParams['id'];
      
      // Check if this is the current user's profile
      this.isOwnProfile = this.currentUserId === profileId;
      
      try {
        await Promise.all([
          this.getProfile(profileId),
          this.getUsersPosts(profileId)
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
          // console.log(this.user);
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
        .where("owner", "==", id)
        .orderBy("created", "desc")
        .get().then((querySnapshot) => {
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
