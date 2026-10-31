export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'SalesAgent';
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  role: 'Admin' | 'SalesAgent';
  email: string;
}

export interface InternetPackage {
  id: string;
  name: string;
  speedMbps: number;
  monthlyPrice: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface CoverageAreaItem {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface CityCoverage {
  id: string;
  name: string;
  areas: CoverageAreaItem[];
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  coverageArea: string;
  packageName: string;
  packageSpeed: number;
  packagePrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CONNECTED' | 'CANCELLED';
  agentName?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CallbackRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  status: 'PENDING' | 'CONTACTED' | 'CLOSED';
  notes?: string;
  createdAt: string;
}

export interface FutureLead {
  id: string;
  customerName: string;
  customerPhone: string;
  cityName: string;
  areaName: string;
  status: 'NEW' | 'NOTIFIED';
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedConnections: number;
  totalSalesAgents: number;
  totalFutureLeads: number;
  totalCallbacks: number;
}
