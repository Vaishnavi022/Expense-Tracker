import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  Expense,
  ExpenseCreate,
  ExpenseListResponse,
  CategoryTotal,
  DashboardSummary,
  MonthlyTrend
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/expenses`;

  getExpenses(params: {
    page?: number;
    page_size?: number;
    search?: string;
    category?: string;
  } = {}): Observable<ExpenseListResponse> {

    let p = new HttpParams();

    if (params.page) {
      p = p.set('page', params.page);
    }

    if (params.page_size) {
      p = p.set('page_size', params.page_size);
    }

    if (params.search) {
      p = p.set('search', params.search);
    }

    if (params.category) {
      p = p.set('category', params.category);
    }

    return this.http.get<ExpenseListResponse>(this.base, { params: p });
  }

  createExpense(payload: ExpenseCreate): Observable<Expense> {
    return this.http.post<Expense>(this.base, payload);
  }

  updateExpense(
    id: number,
    payload: Partial<ExpenseCreate>
  ): Observable<Expense> {
    return this.http.put<Expense>(`${this.base}/${id}`, payload);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getCategoryDistribution(): Observable<CategoryTotal[]> {
    return this.http.get<CategoryTotal[]>(
      `${environment.apiUrl}/analytics/category-distribution`
    );
  }

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(
      `${environment.apiUrl}/analytics/summary`
    );
  }

  getMonthlyTrend(): Observable<MonthlyTrend[]> {
    return this.http.get<MonthlyTrend[]>(
      `${environment.apiUrl}/analytics/monthly-trend`
    );
  }
}