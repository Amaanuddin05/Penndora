import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoOverlayComponent } from './logo-overlay.component';

describe('LogoOverlayComponent', () => {
  let component: LogoOverlayComponent;
  let fixture: ComponentFixture<LogoOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogoOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
