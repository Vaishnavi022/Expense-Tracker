import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { DashboardSummary } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="dashboard">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Welcome back, {{ (auth.user$ | async)?.name }}!</p>

      <div class="stats-grid" *ngIf="summary; else loading">
        <mat-card class="stat-card stat-total">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>account_balance_wallet</mat-icon></div>
            <div class="stat-info">
              <p class="stat-label">Total Expenses</p>
              <p class="stat-value">₹{{ summary.total_expenses | number:'1.2-2' }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-monthly">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>calendar_month</mat-icon></div>
            <div class="stat-info">
              <p class="stat-label">This Month</p>
              <p class="stat-value">₹{{ summary.monthly_expenses | number:'1.2-2' }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-top">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>trending_up</mat-icon></div>
            <div class="stat-info">
              <p class="stat-label">Top Category</p>
              <p class="stat-value">{{ summary.highest_category || 'None' }}</p>
              <p class="stat-sub" *ngIf="summary.highest_category">₹{{ summary.highest_category_amount | number:'1.2-2' }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loading>
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      </ng-template>

      <mat-card class="recent-card" *ngIf="summary?.recent_expenses?.length">
        <mat-card-header>
          <mat-card-title>Recent Expenses</mat-card-title>
          <a mat-button routerLink="/expenses" color="primary" class="view-all">View All</a>
        </mat-card-header>
        <mat-card-content>
          <div class="recent-list">
            <div class="recent-item" *ngFor="let e of summary?.recent_expenses">
              <div class="recent-cat">
                <span class="cat-badge">{{ e['category'] }}</span>
              </div>
              <div class="recent-comment">{{ e['comments'] || '—' }}</div>
              <div class="recent-amount">₹{{ e['amount'] | number:'1.2-2' }}</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="quick-actions" *ngIf="summary?.total_expenses === 0">
        <mat-card class="empty-card">
          <mat-card-content>
            <mat-icon class="empty-icon">receipt_long</mat-icon>
            <h3>No expenses yet</h3>
            <p>Start tracking your spending by adding your first expense.</p>
            <a mat-raised-button color="primary" routerLink="/expenses">Add Expense</a>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 900px; }
    .page-title { margin: 0 0 4px; font-size: 1.75rem; font-weight: 700; color: #1e293b; }
    .page-subtitle { margin: 0 0 24px; color: #64748b; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 20px !important; }
    .stat-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    .stat-total .stat-icon { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
    .stat-monthly .stat-icon { background: linear-gradient(135deg, #0ea5e9, #06b6d4); }
    .stat-top .stat-icon { background: linear-gradient(135deg, #f59e0b, #ef4444); }
    .stat-label { margin: 0; font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { margin: 4px 0 0; font-size: 1.4rem; font-weight: 700; color: #1e293b; }
    .stat-sub { margin: 2px 0 0; font-size: 0.85rem; color: #64748b; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .recent-card { margin-bottom: 16px; }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .view-all { margin-left: auto; }
    .recent-list { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
    .recent-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .cat-badge {
      background: #e0e7ff;
      color: #4338ca;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .recent-comment { flex: 1; color: #64748b; font-size: 0.9rem; }
    .recent-amount { font-weight: 600; color: #1e293b; }
    .empty-card mat-card-content { text-align: center; padding: 40px !important; }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #cbd5e1; margin-bottom: 16px; }
  `],
})
export class DashboardComponent implements OnInit {
  expense = inject(ExpenseService);
  auth = inject(AuthService);

  summary: DashboardSummary | null = null;

  ngOnInit(): void {
    this.expense.getSummary().subscribe({ next: s => this.summary = s });
  }
}