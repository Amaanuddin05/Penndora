import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  showLogoOverlay = true;
  private userLoggedIn = false;
  
  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.userLoggedIn = !!user;
    });
  }

  onOverlayDone() {
    this.showLogoOverlay = false;
    if (this.userLoggedIn) {
      this.router.navigate(['/myblogs']);
    }
  }
}
