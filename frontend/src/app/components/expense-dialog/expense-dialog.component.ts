import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/models';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Education', 'Other'];

@Component({
  selector: 'app-expense-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Expense' : 'Add Expense' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="expense-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('category')?.hasError('required')">Category is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Amount (₹)</mat-label>
          <input matInput type="number" formControlName="amount" min="0.01" step="0.01">
          <mat-error *ngIf="form.get('amount')?.hasError('required')">Amount is required</mat-error>
          <mat-error *ngIf="form.get('amount')?.hasError('min')">Amount must be greater than 0</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Comments (Optional)</mat-label>
          <textarea matInput formControlName="comments" rows="3" placeholder="Add a note..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="loading || form.invalid">
        <mat-spinner diameter="16" *ngIf="loading"></mat-spinner>
        <span *ngIf="!loading">{{ isEdit ? 'Save Changes' : 'Add Expense' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .expense-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; min-width: 360px; }
    .full-width { width: 100%; }
    mat-dialog-actions { padding: 16px 0 8px; }
  `],
})
export class ExpenseDialogComponent {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private snack = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ExpenseDialogComponent>);

  @Inject(MAT_DIALOG_DATA) data: Expense | null = inject(MAT_DIALOG_DATA);

  categories = CATEGORIES;
  loading = false;
  isEdit = !!this.data;

  form = this.fb.group({
    category: [this.data?.category || '', Validators.required],
    amount: [this.data?.amount || null, [Validators.required, Validators.min(0.01)]],
    comments: [this.data?.comments || ''],
  });

  save(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = this.form.value as any;

    const op = this.isEdit
      ? this.expenseService.updateExpense(this.data!.id, payload)
      : this.expenseService.createExpense(payload);

    op.subscribe({
      next: () => {
        this.snack.open(this.isEdit ? 'Expense updated' : 'Expense added', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.snack.open(err.error?.detail || 'Something went wrong', 'Close', { duration: 4000 });
      },
    });
  }
}