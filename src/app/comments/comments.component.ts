import { Component, OnInit, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  comment: string = "";
  comments: any[] = [];
  loggedIn: boolean = false;

  @Input() postId: string = '';

  constructor(private auth: AngularFireAuth, private firestore: Firestore) {
    this.auth.onAuthStateChanged((user) => {
      this.loggedIn = !!user;
    });
  }

  ngOnInit() {
    if (this.postId) {
      this.getComments();
    } else {
      console.error("postId is not defined!");
    }
  }

  async postComment() {
    if (this.comment.length < 5) {
      console.warn("Comment is too short");
      return;
    }

    const user = await this.auth.currentUser;

    if (user) {
      const commentData = {
        text: this.comment,
        post: this.postId,
        owner: user.uid,
        ownerName: user.displayName,
        created: serverTimestamp()
      };

      try {
        const commentsRef = collection(this.firestore, "comments");
        await addDoc(commentsRef, commentData);
        console.log("Comment saved!");
        this.comment = "";
        this.getComments();
      } catch (error) {
        console.error("Error saving comment:", error);
      }
    }
  }

  async getComments() {
    if (!this.postId) {
      console.error("postId is not defined!");
      return;
    }

    this.comments = [];

    try {
      const commentsRef = collection(this.firestore, "comments");
      const q = query(commentsRef, where("post", "==", this.postId), orderBy("created", "desc"));
      const snapshot = await getDocs(q);
      this.comments = snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting comments:", error);
    }
  }
}
