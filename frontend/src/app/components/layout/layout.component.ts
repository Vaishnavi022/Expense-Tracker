import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <div class="brand">
          <mat-icon class="brand-icon">account_balance_wallet</mat-icon>
          <span>ExpenseTracker</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/expenses" routerLinkActive="active-link">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Expenses</span>
          </a>
          <a mat-list-item routerLink="/analytics" routerLinkActive="active-link">
            <mat-icon matListItemIcon>pie_chart</mat-icon>
            <span matListItemTitle>Analytics</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <div class="user-info" *ngIf="auth.user$ | async as user">
            <mat-icon>account_circle</mat-icon>
            <div>
              <p class="user-name">{{ user.name }}</p>
              <p class="user-email">{{ user.email }}</p>
            </div>
          </div>
          <button mat-icon-button (click)="auth.logout()" matTooltip="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="main-content">
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-spacer"></span>
        </mat-toolbar>
        <div class="page-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
  .sidenav-container {
    height: 100vh;
  }

  .sidenav {
    width: 280px;
    background: #1e293b;
    color: white;
    border-right: none;
  }

  .brand {
    height: 70px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
    font-size: 1.2rem;
    font-weight: 700;
    border-bottom: 1px solid #334155;
  }

  .brand-icon {
    color: #818cf8;
    font-size: 28px;
    width: 28px;
    height: 28px;
  }

  mat-nav-list {
    padding-top: 16px;
  }

  mat-nav-list a {
    height: 52px !important;
    margin: 4px 10px;
    border-radius: 10px;
    color: #cbd5e1 !important;
  }

  mat-nav-list a mat-icon {
    margin-right: 16px;
    color: #cbd5e1;
  }

  .active-link {
    background: rgba(129,140,248,0.15) !important;
    color: #818cf8 !important;
  }

  .active-link mat-icon {
    color: #818cf8 !important;
  }

  .sidenav-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    border-top: 1px solid #334155;
    background: #1e293b;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .user-info mat-icon {
    font-size: 36px;
    width: 36px;
    height: 36px;
  }

  .user-name {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    margin: 0;
    font-size: 12px;
    color: #94a3b8;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toolbar {
    height: 70px;
    background: #4f46e5 !important;
    color: white;
  }

  .main-content {
    background: #f8fafc;
  }

  .page-content {
    padding: 30px;
  }

  @media (max-width: 768px) {
    .sidenav {
      width: 240px;
    }

    .page-content {
      padding: 16px;
    }
  }
`]
})
export class LayoutComponent {
  auth = inject(AuthService);
}