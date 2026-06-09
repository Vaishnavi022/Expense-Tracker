import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExpenseService } from '../../services/expense.service';
import { Expense, ExpenseCreate } from '../../models/models';
import { ExpenseDialogComponent } from '../../components/expense-dialog/expense-dialog.component';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Education', 'Other'];

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule,
    MatSelectModule, MatProgressSpinnerModule, MatCardModule, MatChipsModule, MatTooltipModule,
  ],
  template: `
    <div class="expenses-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Expenses</h1>
          <p class="page-subtitle">Manage and track your spending</p>
        </div>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Add Expense
        </button>
      </div>

      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search expenses</mat-label>
              <input matInput [formControl]="searchCtrl" placeholder="Search category or comments...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="category-field">
              <mat-label>Filter by category</mat-label>
              <mat-select [formControl]="categoryCtrl">
                <mat-option value="">All Categories</mat-option>
                <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <div *ngIf="loading" class="loading-overlay"><mat-spinner diameter="40"></mat-spinner></div>

        <table mat-table [dataSource]="expenses" class="expense-table" *ngIf="!loading">
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let e">
              <span class="cat-badge" [style.background]="getCatColor(e.category)">{{ e.category }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let e" class="amount-cell">₹{{ e.amount | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="comments">
            <th mat-header-cell *matHeaderCellDef>Comments</th>
            <td mat-cell *matCellDef="let e" class="comments-cell">{{ e.comments || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="created_at">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let e">{{ e.created_at | date:'dd MMM yyyy, HH:mm' }}</td>
          </ng-container>

          <ng-container matColumnDef="updated_at">
            <th mat-header-cell *matHeaderCellDef>Updated</th>
            <td mat-cell *matCellDef="let e">{{ e.updated_at | date:'dd MMM yyyy' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let e">
              <button mat-icon-button color="primary" (click)="openDialog(e)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteExpense(e)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="empty-state" *ngIf="!loading && expenses.length === 0">
          <mat-icon>receipt_long</mat-icon>
          <p>No expenses found. Add one to get started!</p>
        </div>

        <mat-paginator
          [length]="total"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 50]"
          [pageIndex]="page - 1"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .expenses-page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .page-title { margin: 0 0 4px; font-size: 1.75rem; font-weight: 700; color: #1e293b; }
    .page-subtitle { margin: 0; color: #64748b; }
    .filter-card { margin-bottom: 16px; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .search-field { flex: 2; min-width: 200px; }
    .category-field { flex: 1; min-width: 160px; }
    .table-card { position: relative; overflow: hidden; }
    .loading-overlay { display: flex; justify-content: center; padding: 60px; }
    .expense-table { width: 100%; }
    .cat-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; color: white; white-space: nowrap; }
    .amount-cell { font-weight: 600; color: #1e293b; }
    .comments-cell { color: #64748b; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #94a3b8; }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; margin-bottom: 12px; }
    @media (max-width: 600px) {
      .page-header { flex-direction: column; gap: 12px; }
    }
  `],
})
export class ExpensesComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  expenses: Expense[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  loading = false;
  categories = CATEGORIES;

  displayedColumns = ['category', 'amount', 'comments', 'created_at', 'updated_at', 'actions'];

  searchCtrl = this.fb.control('');
  categoryCtrl = this.fb.control('');

  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.loadExpenses();
    this.searchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => { this.page = 1; this.loadExpenses(); });
    this.categoryCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadExpenses(); });
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getExpenses({
      page: this.page,
      page_size: this.pageSize,
      search: this.searchCtrl.value || undefined,
      category: this.categoryCtrl.value || undefined,
    }).subscribe({
      next: res => {
        this.expenses = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  onPageChange(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.loadExpenses();
  }

  openDialog(expense?: Expense): void {
    const ref = this.dialog.open(ExpenseDialogComponent, {
      width: '480px',
      data: expense || null,
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadExpenses();
    });
  }

  deleteExpense(expense: Expense): void {
    if (!confirm(`Delete this ₹${expense.amount} expense?`)) return;
    this.expenseService.deleteExpense(expense.id).subscribe({
      next: () => {
        this.snack.open('Expense deleted', 'Close', { duration: 3000 });
        this.loadExpenses();
      },
      error: () => this.snack.open('Failed to delete expense', 'Close', { duration: 3000 }),
    });
  }

  getCatColor(category: string): string {
    const colors: Record<string, string> = {
      Food: '#22c55e', Travel: '#0ea5e9', Shopping: '#f59e0b',
      Entertainment: '#a855f7', Health: '#ef4444', Utilities: '#6366f1',
      Education: '#14b8a6', Other: '#94a3b8',
    };
    return colors[category] || '#6366f1';
  }
}