import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo-overlay',
  templateUrl: './logo-overlay.component.html',
  styleUrl: './logo-overlay.component.css'
})
export class LogoOverlayComponent implements OnInit {
  showOverlay = true;
  showRipple = false;

  @Output() overlayDone = new EventEmitter<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
 
    setTimeout(() => {
      this.showRipple = true;
      
      setTimeout(() => {
        this.showOverlay = false;
        this.overlayDone.emit();
      }, 2400); 
    }, 300); 
  }
}
