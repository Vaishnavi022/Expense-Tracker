import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ExpenseService } from '../../services/expense.service';
import { CategoryTotal, MonthlyTrend } from '../../models/models';

import {
  Chart,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement
} from 'chart.js';

Chart.register(
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement
);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="analytics-page">

      <h1>Analytics Dashboard</h1>

      <div *ngIf="loading" style="text-align:center">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading">

        <mat-card class="summary-card">
          <mat-card-content>
            <h2>Total Expenses</h2>
            <h1>₹{{ grandTotal }}</h1>
          </mat-card-content>
        </mat-card>

        <br>

        <div class="chart-grid">

          <mat-card>
            <mat-card-content>
              <h3>Category Distribution</h3>
              <canvas #pieChart></canvas>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <h3>Category Totals</h3>
              <canvas #barChart></canvas>
            </mat-card-content>
          </mat-card>

        </div>

        <br>

        <mat-card>
          <mat-card-content>
            <h3>Monthly Expense Trend</h3>
            <canvas #lineChart></canvas>
          </mat-card-content>
        </mat-card>

      </div>

    </div>
  `,
  styles: [`
    .analytics-page{
      padding:20px;
    }

    .summary-card{
      text-align:center;
    }

    .chart-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:20px;
    }

    canvas{
      max-height:350px;
    }

    @media(max-width:768px){
      .chart-grid{
        grid-template-columns:1fr;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit {

  private expenseService = inject(ExpenseService);

  @ViewChild('pieChart', { static: false })
  pieChartRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('barChart', { static: false })
  barChartRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('lineChart', { static: false })
  lineChartRef!: ElementRef<HTMLCanvasElement>;

  data: CategoryTotal[] = [];
  trendData: MonthlyTrend[] = [];

  loading = true;
  private viewReady = false;

  get grandTotal(): number {
    return this.data.reduce(
      (sum, item) => sum + Number(item.total),
      0
    );
  }

  ngOnInit(): void {

    this.expenseService.getCategoryDistribution().subscribe({
      next: (res) => {

        this.data = res;

        this.expenseService.getMonthlyTrend().subscribe({
          next: (trend) => {

            this.trendData = trend;

            this.loading = false;

            setTimeout(() => {
              this.renderCharts();
            }, 500);

          },
          error: () => {
            this.loading = false;
          }
        });

      },
      error: () => {
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
  }

  private renderCharts(): void {

    if (!this.viewReady) {
      setTimeout(() => this.renderCharts(), 300);
      return;
    }

    if (
      !this.pieChartRef ||
      !this.barChartRef ||
      !this.lineChartRef
    ) {
      return;
    }

    if (this.data.length > 0) {
      this.createPieChart();
      this.createBarChart();
    }

    if (this.trendData.length > 0) {
      this.createLineChart();
    }
  }

  private createPieChart(): void {

    new Chart(this.pieChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: this.data.map(x => x.category),
        datasets: [{
          data: this.data.map(x => Number(x.total))
        }]
      }
    });
  }

  private createBarChart(): void {

    new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.data.map(x => x.category),
        datasets: [{
          label: 'Expenses',
          data: this.data.map(x => Number(x.total))
        }]
      }
    });
  }

  private createLineChart(): void {

    new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.trendData.map(x => x.month),
        datasets: [{
          label: 'Monthly Expenses',
          data: this.trendData.map(x => Number(x.total)),
          fill: false
        }]
      }
    });
  }
}
