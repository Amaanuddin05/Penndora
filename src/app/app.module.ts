import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxEditorModule } from 'ngx-editor';
// app.module.ts
import { firebaseApp } from './firebase.config';
// src/main.ts or src/app/app.module.ts
import './firebase.compat.config';



import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireModule } from '@angular/fire/compat'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';
import { MyblogsComponent } from './myblogs/myblogs.component';
import { ProfileComponent } from './profile/profile.component';
import { CreateComponent } from './create/create.component';
import { PostComponent } from './post/post.component';
import { ViewComponent } from './view/view.component';
import { CommentsComponent } from './comments/comments.component';


import { EditProfileComponent } from './edit-profile/edit-profile.component';

// export  const firebaseConfig = {
//   apiKey: "AIzaSyAejaIf_fFPGWm8BHKAlWrIj0zFoFFnJUg",
//   authDomain: "scribe-570db.firebaseapp.com",
//   projectId: "scribe-570db",
//   storageBucket: "scribe-570db.appspot.com",
//   messagingSenderId: "460535388327",
//   appId: "1:460535388327:web:feea0e275b282c27c9a382",
//   measurementId: "G-C6FV7HYPQ4"
// };
const firebaseConfig = {
  apiKey: "AIzaSyC-aXm870ZIqxg1XMk_Cr90bRop5H6_RZE",
  authDomain: "penndora-6b0ec.firebaseapp.com",
  projectId: "penndora-6b0ec",
  storageBucket: "penndora-6b0ec.firebasestorage.app",
  messagingSenderId: "303580676033",
  appId: "1:303580676033:web:10a750dbaa37433ceeb940",
  measurementId: "G-6XGHK7417T"
};

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    HomeComponent,
    MenuComponent,
    MyblogsComponent,
    ProfileComponent,
    CreateComponent,
    PostComponent,
    ViewComponent,
    CommentsComponent,
    EditProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig),
    NgxEditorModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
