import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/firestore';
import 'firebase/auth';


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  user: any = {};
  message!: string; // Initialize or assert definite assignment for message

  constructor() {
    this.getProfile();
  }

  ngOnInit() {
  }


  getProfile() {
    let userId = firebase.auth().currentUser!.uid; // Access current user's uid safely
    firebase.firestore().collection("users").doc(userId).get().then((documentSnapshot) => {
      this.user = documentSnapshot.data(); // Retrieve user data from Firestore
      this.user.displayName = this.user.firstName + " " + this.user.lastName; // Construct displayName
      this.user.id = documentSnapshot.id; // Assign document id to user object
      console.log(this.user); // Log user data
    }).catch((error) => {
      console.log(error); // Log any errors
    });
  }

  update() {
    this.message = "Updating Profile..."; // Display updating message
  
    firebase.auth().currentUser!.updateProfile({
      displayName: this.user.displayName, photoURL: this.user.photoUrl // Update user profile in Firebase Auth
    }).then(() => {
      let userId = firebase.auth().currentUser!.uid; // Get current user's uid
      firebase.firestore().collection("users").doc(userId).update({
        first_name: this.user.displayName.split(' ')[0], // Update first_name in Firestore
        last_name: this.user.displayName.split(' ')[1], // Update last_name in Firestore
        hobbies: this.user.hobbies, // Update hobbies in Firestore
        interests: this.user.interests, // Update interests in Firestore
        bio: this.user.bio // Update bio in Firestore
      }).then(() => {
        this.message = "Profile Updated Successfully."; // Update success message
      }).catch((error) => {
        console.log(error); // Log Firestore update error
      });
    }).catch((error) => {
      console.log(error); // Log Firebase Auth update error
    });
  }
}