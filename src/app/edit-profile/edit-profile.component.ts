import { Component, OnInit } from '@angular/core';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';
import { AuthService } from '../auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  user: any = {
    displayName: '',
    email: '',
    photoURL: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCBmaWxsPSIjNGU3M2RmIiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIvPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjEyOCIgY3k9IjEwMCIgcj0iNDAiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNjQsMTg1YzAsNDQsMzAsODAsNjQsODAsNjQsMCw2NC0zMCw2NC04MHMtMjgtNDItNjQtNDJTNjQsMTQxLDY0LDE4NVoiLz48L3N2Zz4=', // Default SVG avatar
    bio: '',
    interests: '',
    hobbies: ''
  };
  message: string = '';
  safePhotoURL: SafeUrl | undefined;
  private auth = getAuth();
  private firestore = getFirestore();

  constructor(
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    await this.getProfile();
  }

  async getProfile() {
    try {
      // Get current user
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        console.error('No user is currently signed in');
        return;
      }

      // Get user data from Firestore
      const userDocRef = doc(this.firestore, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        this.user = {
          ...userData,
          displayName: userData['firstName'] + ' ' + userData['lastName'],
          id: currentUser.uid
        };

        // Handle photoURL
        if (userData['photoURL']) {
          this.user.photoURL = userData['photoURL'];
          this.safePhotoURL = this.sanitizer.bypassSecurityTrustUrl(userData['photoURL']);
        } else if (currentUser.photoURL) {
          this.user.photoURL = currentUser.photoURL;
          this.safePhotoURL = this.sanitizer.bypassSecurityTrustUrl(currentUser.photoURL);
        }

        console.log('User profile loaded:', this.user);
      } else {
        console.log('No user document found, using Auth user data');
        
        // Use data from Auth if no Firestore document exists
        this.user = {
          displayName: currentUser.displayName || '',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || this.user.photoURL,
          id: currentUser.uid
        };

        if (currentUser.photoURL) {
          this.safePhotoURL = this.sanitizer.bypassSecurityTrustUrl(currentUser.photoURL);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  async update() {
    this.message = "Updating Profile...";
    
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      // Split display name into first and last name
      const nameParts = this.user.displayName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: this.user.displayName,
        photoURL: this.user.photoURL
      });

      // Update Firestore document
      const userDocRef = doc(this.firestore, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        firstName: firstName,
        lastName: lastName,
        photoURL: this.user.photoURL,
        bio: this.user.bio || '',
        interests: this.user.interests || '',
        hobbies: this.user.hobbies || ''
      });

      this.message = "Profile Updated Successfully.";
      console.log('Profile updated successfully');
    } catch (error) {
      this.message = `Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('Error updating profile:', error);
    }
  }
}