import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DomSanitizer, SafeUrl, SafeHtml } from '@angular/platform-browser';
import { AiAssistantService } from '../services/ai-assistant.service';

interface Post {
  title: string;
  content: string;
  owner?: string;
  created?: any;
}

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  post: Post | undefined;
  postId: string = "";
  isLoading: boolean = true;
  
  // Summary functionality
  summaryText: string = '';
  isGeneratingSummary: boolean = false;
  showSummaryModal: boolean = false;
  
  // Author information
  author: any;
  authorName: string = 'Unknown Author';
  authorPhoto: SafeUrl | string = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCBmaWxsPSIjNGU3M2RmIiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIvPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjEyOCIgY3k9IjEwMCIgcj0iNDAiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNjQsMTg1YzAsNDQsMzAsODAsNjQsODAsNjQsMCw2NC0zMCw2NC04MHMtMjgtNDItNjQtNDJTNjQsMTQxLDY0LDE4NVoiLz48L3N2Zz4='; // Default SVG avatar
  postDate: string = '';

  constructor(
    private activateRoute: ActivatedRoute,
    private ngZone: NgZone,
    private firestore: AngularFirestore,
    private sanitizer: DomSanitizer,
    private aiAssistantService: AiAssistantService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    
    this.activateRoute.paramMap.pipe(
      switchMap(params => {
        const postId = params.get("postId");
        if (postId) {
          this.postId = postId;
          return this.firestore.collection('posts').doc<Post>(postId).valueChanges();
        } else {
          return new Observable<Post | undefined>();
        }
      })
    ).subscribe((post: Post | undefined) => {
      this.ngZone.run(() => {
        this.post = post;
        
        if (post) {
          if (post.created) {
            this.formatPostDate(post.created);
          }
          
          if (post.owner) {
            this.fetchAuthorInfo(post.owner);
          } else {
            this.isLoading = false;
          }
        } else {
          this.isLoading = false;
        }
      });
    }, (error: any) => {
      console.error("Error getting document:", error);
      this.isLoading = false;
    });
  }
  
  getSafeHTML(content: string): SafeHtml {
    if (!content) return '';
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
  
  
  fetchAuthorInfo(ownerId: string) {
    this.firestore.collection('users').doc(ownerId).get().subscribe(doc => {
      if (doc.exists) {
        this.author = doc.data();
        
        if (this.author.displayName) {
          this.authorName = this.author.displayName;
        } else if (this.author.firstName && this.author.lastName) {
          this.authorName = `${this.author.firstName} ${this.author.lastName}`;
        } else if (this.author.firstName) {
          this.authorName = this.author.firstName;
        }
        
        if (this.author.photoURL) {
          this.authorPhoto = this.sanitizer.bypassSecurityTrustUrl(this.author.photoURL);
        }
      }
      
      this.isLoading = false;
    }, error => {
      console.error("Error fetching author info:", error);
      this.isLoading = false;
    });
  }
  

  formatPostDate(timestamp: any) {
    if (!timestamp) return;
    
    const postDate = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      this.postDate = `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      // Minutes
      const minutes = Math.floor(diffSeconds / 60);
      this.postDate = `${minutes}m ago`;
    } else if (diffSeconds < 86400) {
      // Hours
      const hours = Math.floor(diffSeconds / 3600);
      this.postDate = `${hours}h ago`;
    } else if (diffSeconds < 604800) {
      // Days
      const days = Math.floor(diffSeconds / 86400);
      this.postDate = `${days}d ago`;
    } else {
      // More than a week, show the full date
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[postDate.getMonth()];
      const day = postDate.getDate();
      const year = postDate.getFullYear() !== now.getFullYear() ? `, ${postDate.getFullYear()}` : '';
      this.postDate = `${month} ${day}${year}`;
    }
  }
  

  summarizeContent() {
    if (!this.post?.content) return;
    
    this.isGeneratingSummary = true;
    this.showSummaryModal = true;
    this.summaryText = 'Generating summary...';
    
    this.aiAssistantService.summarizeContent(this.post.content)
      .subscribe({
        next: (response) => {
          this.summaryText = response.reply || 'Unable to generate summary.';
          this.isGeneratingSummary = false;
        },
        error: (error) => {
          console.error('Error generating summary:', error);
          this.summaryText = 'An error occurred while generating summary.';
          this.isGeneratingSummary = false;
        }
      });
  }
  
 
  closeSummaryModal() {
    this.showSummaryModal = false;
  }
}
