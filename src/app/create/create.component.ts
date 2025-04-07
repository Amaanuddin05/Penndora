import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Editor } from 'ngx-editor';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { serverTimestamp } from '@angular/fire/firestore'; // ✅ Use the modular serverTimestamp

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit, OnDestroy {
  title: string = '';
  content: string = '';
  html = '';

  @Output('postCreated') postCreated = new EventEmitter();

  editor!: Editor;

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth // ✅ Inject AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  createPost() {
    console.log('Title:', this.title);
    console.log('Content:', this.html);

    if (!this.title || !this.html) {
      console.error('Content or Title is not defined or invalid.');
      return;
    }

    this.afAuth.currentUser.then(user => {
      if (!user) {
        console.error('User not authenticated.');
        return;
      }

      const post = {
        title: this.title,
        content: this.html,
        owner: user.uid, // ✅ Safe UID access
        created: serverTimestamp() // ✅ Correct timestamp usage
      };

      this.firestore.collection('posts').add(post)
        .then(() => {
          console.log('Post created successfully!');
          this.postCreated.emit();
        })
        .catch(error => {
          console.error('Error creating post:', error);
        });
    });
  }
}
