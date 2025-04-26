import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.getCurrentUser().pipe(
    switchMap(currentUser => {
      if (currentUser) {
        return of(true);
      }
      
      return authService.user$.pipe(
        take(1),
        map(user => {
          const isLoggedIn = !!user;
          
          if (isLoggedIn) {
            return true;
          }
          
          router.navigate(['/login']);
          return false;
        })
      );
    })
  );
};

export const redirectIfLoggedIn: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.getCurrentUser().pipe(
    switchMap(currentUser => {
      if (currentUser) {
        router.navigate(['/myblogs']);
        return of(false);
      }
      
      return authService.user$.pipe(
        take(1),
        map(user => {
          const isLoggedIn = !!user;
          
          if (!isLoggedIn) {
            return true;
          }
          
          router.navigate(['/myblogs']);
          return false;
        })
      );
    })
  );
};
