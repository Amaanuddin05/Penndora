import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface Post {
  title: string;
  content: string;
}

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  post: Post | undefined;
  postId: string = "";

  constructor(
    private activateRoute: ActivatedRoute,
    private ngZone: NgZone,
    private firestore: AngularFirestore
  ) {}


  ngOnInit() {
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
      });
    }, (error: any) => {
      console.error("Error getting document:", error);
    });
  }
}
