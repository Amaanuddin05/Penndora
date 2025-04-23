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

  /**
   * Formats a comment timestamp to a readable format
   */
  formatCommentDate(timestamp: any): string {
    if (!timestamp || !timestamp.toDate) {
      return '';
    }
    
    const commentDate = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - commentDate.getTime();
    
    // Convert to seconds
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      // Minutes
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffSeconds < 86400) {
      // Hours
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffSeconds < 604800) {
      // Days
      const days = Math.floor(diffSeconds / 86400);
      return `${days}d ago`;
    } else {
      // More than a week, show the full date
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[commentDate.getMonth()];
      const day = commentDate.getDate();
      const year = commentDate.getFullYear() !== now.getFullYear() ? `, ${commentDate.getFullYear()}` : '';
      return `${month} ${day}${year}`;
    }
  }
}
