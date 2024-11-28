import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
class PermissionsService {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  redirectToAppropriatePage(): boolean {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/chat']);
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
}

// Guard for authenticated paths
export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(PermissionsService).canActivate(next, state);
};

// Guard for default redirection
export const DefaultRedirectGuard: CanActivateFn = (): boolean => {
  return inject(PermissionsService).redirectToAppropriatePage();
};
