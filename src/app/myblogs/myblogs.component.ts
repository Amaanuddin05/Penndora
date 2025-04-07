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
  safePhotoURL: SafeUrl | undefined;


  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth,private sanitizer: DomSanitizer,private authService: AuthService) {
    // firebase.firestore().settings({
    //   timestampsInSnapshots: true
    // });
    this.user = this.auth.currentUser;
    console.log(this.user)
    this.getPosts();
  }


  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (this.user?.photoURL) {
        this.safePhotoURL = this.sanitizer.bypassSecurityTrustUrl(this.user.photoURL);
      }
      this.getPosts();
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
        console.log('Fetched posts:', this.posts); // Log the fetched posts
      }, (err: any) => {
        console.error('Error fetching posts:', err);
      });
  }

  onPostCreated(){
    // refresh the list of posts
    this.posts = [];
    this.getPosts();

  }

  onDelete(){
    // refresh the list of posts
    this.posts = [];
    this.getPosts();
  }

}
