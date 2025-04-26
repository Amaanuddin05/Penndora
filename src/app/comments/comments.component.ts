import { Component, OnInit, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, doc, deleteDoc } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { auth } from '../firebase.utils';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  comment: string = "";
  comments: any[] = [];
  loggedIn: boolean = false;
  user: any = {};
  private auth = auth;
  isLoading: boolean = true;

  @Input() postId: string = '';

  constructor(private authFire: AngularFireAuth, private firestore: Firestore) {
    this.authFire.onAuthStateChanged((user) => {
      this.loggedIn = !!user;
      this.user = user;
    });
  }

  ngOnInit() {
    this.isLoading = true;
    
    if (this.postId) {
      this.getComments();
    } else {
      console.error("postId is not defined!");
    }
  }

  async postComment() {
    if (!this.comment.trim()) {
      console.warn("Comment cannot be empty");
      return;
    }

    const user = await this.authFire.currentUser;

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
    this.isLoading = true;
    
    if (!this.postId) {
      console.error("postId is not defined!");
      this.isLoading = false;
      return;
    }

    try {
      const commentRef = collection(this.firestore, 'comments');
      const commentQuery = query(
        commentRef,
        where('post', '==', this.postId),
        orderBy('created', 'desc')
      );
      
      const querySnapshot = await getDocs(commentQuery);
      
      this.comments = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        this.comments.push({
          id: doc.id,
          ...data,
          authorName: data['ownerName'],
          timestamp: data['created']
        });
      });
    } catch (error) {
      console.error("Error getting comments:", error);
    } finally {
      this.isLoading = false;
    }
  }


  async deleteComment(commentId: string) {
    try {
      const commentDocRef = doc(this.firestore, 'comments', commentId);
      await deleteDoc(commentDocRef);
      console.log('Comment deleted successfully');
      this.getComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

 
  isCommentOwner(commentOwnerId: string): boolean {
    return this.user && this.user.uid === commentOwnerId;
  }


  formatCommentDate(timestamp: any): string {
    if (!timestamp || !timestamp.toDate) {
      return '';
    }
    
    const commentDate = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - commentDate.getTime();
    
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffSeconds < 604800) {
      const days = Math.floor(diffSeconds / 86400);
      return `${days}d ago`;
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[commentDate.getMonth()];
      const day = commentDate.getDate();
      const year = commentDate.getFullYear() !== now.getFullYear() ? `, ${commentDate.getFullYear()}` : '';
      return `${month} ${day}${year}`;
    }
  }
}
