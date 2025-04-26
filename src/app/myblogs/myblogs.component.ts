import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../auth.service';
import { User } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-myblogs',
  templateUrl: './myblogs.component.html',
  styleUrls: ['./myblogs.component.css']
})
export class MyblogsComponent implements OnInit {
  user: any = {};
  posts: any[] = [];
  safePhotoURL: SafeUrl | string = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCBmaWxsPSIjNGU3M2RmIiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIvPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjEyOCIgY3k9IjEwMCIgcj0iNDAiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNjQsMTg1YzAsNDQsMzAsODAsNjQsODAsNjQsMCw2NC0zMCw2NC04MHMtMjgtNDItNjQtNDJTNjQsMTQxLDY0LDE4NVoiLz48L3N2Zz4='; // Default SVG avatar

  constructor(
    private firestore: AngularFirestore, 
    private auth: AngularFireAuth,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    
    this.getPosts();
  }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.user = user;
        // console.log('User data in myblogs:', user);
        
        if (user.photoURL) {
          this.safePhotoURL = this.sanitizer.bypassSecurityTrustUrl(user.photoURL);
          console.log('Photo URL set:', user.photoURL);
        } else {
          this.getUserFromFirestore(user.uid);
        }
        
        this.getPosts();
      }
    });
  }

  getUserFromFirestore(userId: string) {
    this.firestore.collection('users').doc(userId).get().subscribe(doc => {
      if (doc.exists) {
        const userData = doc.data() as { photoURL?: string };
        if (userData?.photoURL) {
          this.safePhotoURL = this.sanitizer.bypassSecurityTrustUrl(userData.photoURL);
          console.log('Photo URL from Firestore:', userData.photoURL);
        }
      }
    });
  }

  getPosts() {
    this.firestore.collection('posts', ref => ref.orderBy('created', 'desc').limit(100))
      .snapshotChanges()
      .subscribe((changes) => {
        this.posts = changes.map(a => {
          const data = a.payload.doc.data() as Record<string, any>;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
        // console.log('Fetched posts:', this.posts); // Log the fetched posts
      }, (err: any) => {
        console.error('Error fetching posts:', err);
      });
  }

  onPostCreated(){
    this.posts = [];
    this.getPosts();
  }

  onDelete(){
    this.posts = [];
    this.getPosts();
  }
}
