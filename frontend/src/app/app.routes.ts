import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home.component';
import { LoginComponent } from './features/auth/login.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { AgentDashboardComponent } from './features/agent/agent-dashboard.component';
import { adminGuard, agentGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'agent', component: AgentDashboardComponent, canActivate: [agentGuard] },
  { path: '**', redirectTo: '' }
];
