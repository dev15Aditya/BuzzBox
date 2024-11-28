import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard, DefaultRedirectGuard } from './guard/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        canActivate: [DefaultRedirectGuard], // Custom logic for default redirection
        component: LoginComponent, // Placeholder, won't be used due to redirection logic
      },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login to Chat App'
    },
    {
        path: 'register',
        component: RegisterComponent,
        title: 'Register for Chat App'
    },
    {
        path: 'chat',
        component: LayoutComponent,
        canActivate: [AuthGuard]
    },
    {
        path: '**',
        component: LoginComponent,
        title: 'Login to Chat App'
    },
];
