import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input('post') post: any;
  @Output('onDelete') onDelete = new EventEmitter();

  postData: any = {};
  user: any = {};

  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth) { }

  async ngOnInit() {
    this.postData = this.post; // directly assign the post object to postData
    console.log(this.postData);
    this.user = await this.auth.currentUser;
  }

  delete() {
    this.firestore.collection("posts").doc(this.post.id).delete().then(() => {
      this.onDelete.emit();
    }).catch(error => {
      console.error('Error deleting post:', error);
    });
  }

}
