import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { MyblogsComponent } from './myblogs/myblogs.component';
import { ProfileComponent } from './profile/profile.component';
import { ViewComponent } from './view/view.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { authGuard, redirectIfLoggedIn } from './auth.guard';

const routes: Routes = [{
  path: '' , redirectTo: 'home', pathMatch: 'full'
},{
  path: 'home' , component: HomeComponent, canActivate: [redirectIfLoggedIn]
},{
  path: 'login', component: LoginComponent, canActivate: [redirectIfLoggedIn]
},{
  path: 'signup' , component: SignupComponent, canActivate: [redirectIfLoggedIn]
},{
  path: 'myblogs' , component: MyblogsComponent, canActivate: [authGuard]
},{
  path: 'profile/:id', component: ProfileComponent, canActivate: [authGuard]
},{
  path: 'view/:postId', component: ViewComponent
},{
  path: 'edit-profile/:id', component: EditProfileComponent, canActivate: [authGuard]
},
{
  path:'**', redirectTo: 'home',
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
