import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../auth.service';
import firebase from '../firebase.utils';

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
  writerPhoto: SafeUrl | string = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCBmaWxsPSIjNGU3M2RmIiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIvPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjEyOCIgY3k9IjEwMCIgcj0iNDAiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNjQsMTg1YzAsNDQsMzAsODAsNjQsODAsNjQsMCw2NC0zMCw2NC04MHMtMjgtNDItNjQtNDJTNjQsMTQxLDY0LDE4NVoiLz48L3N2Zz4='; // Default SVG avatar
  writerName: string = 'Unknown Writer';
  timeAgo: string = '';
  borderColor: string = '#1d9bf0'; // Default color
  
  // Vibrant color options
  private colorPalette: string[] = [
    '#1DA1F2', // Twitter Blue
    '#E1306C', // Instagram Pink/Red
    '#6D28D9', // Purple
    '#2563EB', // Royal Blue
    '#10B981', // Emerald Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F43F5E'  // Rose
  ];

  constructor(
    private firestore: AngularFirestore, 
    private auth: AngularFireAuth,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.postData = { ...this.post }; // Make a copy to avoid reference issues
    this.postData.id = this.post.id || this.postData.id; // ✅ Ensure postData.id exists
    // console.log(this.postData);
    
    // Generate border color based on user ID
    if (this.postData.owner) {
      this.borderColor = this.generateColorFromUserId(this.postData.owner);
    }
    
    // Calculate time ago string
    if (this.postData.created) {
      this.calculateTimeAgo();
    }
    
    // Get current user
    this.user = await this.auth.currentUser;
    
    // Use authService to get the current user's data for posts created by the current user
    this.authService.user$.subscribe(currentUser => {
      if (currentUser && this.postData.owner === currentUser.uid) {
        // This is the current user's post, use their photo
        this.writerName = currentUser.displayName || 'You';
        if (currentUser.photoURL) {
          this.writerPhoto = this.sanitizer.bypassSecurityTrustUrl(currentUser.photoURL);
        }
      } else if (this.postData.owner) {
        // This is someone else's post
        this.fetchWriterProfile(this.postData.owner);
      }
    });
  }

  fetchWriterProfile(ownerId: string) {
    this.firestore.collection('users').doc(ownerId).get().subscribe((doc) => {
      if (doc.exists) {
        const userData = doc.data() as { displayName?: string; photoURL?: string; firstName?: string; lastName?: string };
        
        // Try different name fields that might exist
        if (userData.displayName) {
          this.writerName = userData.displayName;
        } else if (userData.firstName && userData.lastName) {
          this.writerName = `${userData.firstName} ${userData.lastName}`;
        } else if (userData.firstName) {
          this.writerName = userData.firstName;
        }
        
        if (userData.photoURL) {
          this.writerPhoto = this.sanitizer.bypassSecurityTrustUrl(userData.photoURL);
        }
      }
    });
  }

  calculateTimeAgo() {
    const now = new Date();
    const postDate = this.postData.created.toDate();
    const diffMs = now.getTime() - postDate.getTime();
    
    // Convert to seconds
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      this.timeAgo = `${diffSeconds}s`;
    } else if (diffSeconds < 3600) {
      // Minutes
      const minutes = Math.floor(diffSeconds / 60);
      this.timeAgo = `${minutes}m`;
    } else if (diffSeconds < 86400) {
      // Hours
      const hours = Math.floor(diffSeconds / 3600);
      this.timeAgo = `${hours}h`;
    } else if (diffSeconds < 604800) {
      // Days
      const days = Math.floor(diffSeconds / 86400);
      this.timeAgo = `${days}d`;
    } else {
      // More than a week, show month and day
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      this.timeAgo = `${monthNames[postDate.getMonth()]} ${postDate.getDate()}`;
    }
  }

  delete() {
    this.firestore.collection("posts").doc(this.post.id).delete().then(() => {
      this.onDelete.emit();
    }).catch(error => {
      console.error('Error deleting post:', error);
    });
  }

  // Generate a consistent color based on user ID
  generateColorFromUserId(userId: string): string {
    if (!userId) return this.colorPalette[0];
    
    // Simple hash function to convert userId string to a number
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use the hash to select a color from our palette
    const index = Math.abs(hash) % this.colorPalette.length;
    return this.colorPalette[index];
  }
}
