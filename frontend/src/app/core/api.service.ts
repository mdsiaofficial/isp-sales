import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InternetPackage,
  CityCoverage,
  CustomerOrder,
  DashboardStats,
  CallbackRequest,
  FutureLead,
  User
} from './models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Public Endpoints
  getPublicPackages(): Observable<InternetPackage[]> {
    return this.http.get<InternetPackage[]>(`${this.baseUrl}/public/packages`);
  }

  getPublicCoverage(): Observable<CityCoverage[]> {
    return this.http.get<CityCoverage[]>(`${this.baseUrl}/public/coverage-areas`);
  }

  submitChatbotOrder(order: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    cityId: string;
    coverageAreaId: string;
    packageId: string;
  }): Observable<{ orderId: string; orderNumber: string; message: string; status: string }> {
    return this.http.post<any>(`${this.baseUrl}/public/chatbot/order`, order);
  }

  submitChatbotCallback(callback: {
    customerName: string;
    customerPhone: string;
  }): Observable<{ message: string; id: string }> {
    return this.http.post<any>(`${this.baseUrl}/public/chatbot/callback`, callback);
  }

  submitChatbotLead(lead: {
    customerName: string;
    customerPhone: string;
    cityName: string;
    areaName: string;
  }): Observable<{ message: string; id: string }> {
    return this.http.post<any>(`${this.baseUrl}/public/chatbot/lead`, lead);
  }

  // Admin Endpoints
  getAdminStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/admin/dashboard/stats`);
  }

  getAdminPackages(): Observable<InternetPackage[]> {
    return this.http.get<InternetPackage[]>(`${this.baseUrl}/admin/packages`);
  }

  createPackage(pkg: Partial<InternetPackage>): Observable<InternetPackage> {
    return this.http.post<InternetPackage>(`${this.baseUrl}/admin/packages`, pkg);
  }

  updatePackage(id: string, pkg: Partial<InternetPackage>): Observable<InternetPackage> {
    return this.http.put<InternetPackage>(`${this.baseUrl}/admin/packages/${id}`, pkg);
  }

  deletePackage(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/packages/${id}`);
  }

  getAdminCoverage(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/coverage-areas`);
  }

  createCity(name: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/cities`, { name });
  }

  createCoverageArea(cityId: string, name: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/coverage-areas`, { cityId, name });
  }

  updateCoverageArea(id: string, name: string, isActive: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/coverage-areas/${id}`, { name, isActive });
  }

  deleteCoverageArea(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/coverage-areas/${id}`);
  }

  getAgents(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/agents`);
  }

  createAgent(agent: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/agents`, agent);
  }

  updateAgent(id: string, agent: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/agents/${id}`, agent);
  }

  getAdminOrders(): Observable<CustomerOrder[]> {
    return this.http.get<CustomerOrder[]>(`${this.baseUrl}/admin/orders`);
  }

  getCallbacks(): Observable<CallbackRequest[]> {
    return this.http.get<CallbackRequest[]>(`${this.baseUrl}/admin/callbacks`);
  }

  updateCallbackStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/admin/callbacks/${id}/status`, `"${status}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getLeads(): Observable<FutureLead[]> {
    return this.http.get<FutureLead[]>(`${this.baseUrl}/admin/leads`);
  }

  // Sales Agent Endpoints
  getAgentOrders(status?: string): Observable<CustomerOrder[]> {
    const url = status ? `${this.baseUrl}/agent/orders?status=${status}` : `${this.baseUrl}/agent/orders`;
    return this.http.get<CustomerOrder[]>(url);
  }

  updateOrderStatus(id: string, status: string, notes?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/agent/orders/${id}/status`, { status, notes });
  }
}
