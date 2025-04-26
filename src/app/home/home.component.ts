import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit() {
    // Check if user is logged in and redirect to myblogs if they are
    this.authService.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/myblogs']);
      }
    });
  }
}
