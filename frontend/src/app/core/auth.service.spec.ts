import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';

const routes: Routes = [{ path: 'login', component: class {} as any }];

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter(routes)],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report not logged in initially', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(service.isSalesAgent()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should restore user from localStorage', () => {
    const user = { token: 't', username: 'u', fullName: 'f', role: 'Admin' as const, email: 'e' };
    localStorage.setItem('isp_user', JSON.stringify(user));
    localStorage.setItem('isp_token', 't');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter(routes)],
    });
    const s = TestBed.inject(AuthService);
    expect(s.isLoggedIn()).toBe(true);
    expect(s.isAdmin()).toBe(true);
  });

  it('should handle corrupted stored user gracefully', () => {
    localStorage.setItem('isp_user', '{bad json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter(routes)],
    });
    const s = TestBed.inject(AuthService);
    expect(s.currentUser()).toBeNull();
    expect(s.isLoggedIn()).toBe(false);
  });

  it('logout should clear storage', () => {
    localStorage.setItem('isp_token', 't');
    localStorage.setItem('isp_user', JSON.stringify({ token: 't', username: 'u', fullName: 'f', role: 'Admin', email: 'e' }));
    service.currentUser.set({ token: 't', username: 'u', fullName: 'f', role: 'Admin', email: 'e' });
    service.logout();
    expect(localStorage.getItem('isp_token')).toBeNull();
    expect(localStorage.getItem('isp_user')).toBeNull();
    expect(service.currentUser()).toBeNull();
  });
});
