import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guard/auth.guard';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Welcome Chat App'
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
        component: ChatComponent,
        title: 'Messages',
        canActivate: [AuthGuard]
    }
];
