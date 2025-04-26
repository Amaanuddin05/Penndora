import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.user$.pipe(
    take(1),
    map(user => {
      const isLoggedIn = !!user;
      
      if (isLoggedIn) {
        return true;
      }
      
      // Not logged in, redirect to login
      router.navigate(['/login']);
      return false;
    })
  );
};

export const redirectIfLoggedIn: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.user$.pipe(
    take(1),
    map(user => {
      const isLoggedIn = !!user;
      
      if (!isLoggedIn) {
        return true;
      }
      
      // Already logged in, redirect to myblogs
      router.navigate(['/myblogs']);
      return false;
    })
  );
};
