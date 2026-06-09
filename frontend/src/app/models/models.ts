export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Expense {
  id: number;
  user_id: number;
  category: string;
  amount: number;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreate {
  category: string;
  amount: number;
  comments?: string;
}

export interface ExpenseListResponse {
  data: Expense[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
}

export interface DashboardSummary {
  total_expenses: number;
  monthly_expenses: number;
  highest_category: string | null;
  highest_category_amount: number;
  recent_expenses: Partial<Expense>[];
}

/* NEW - Monthly Trend */
export interface MonthlyTrend {
  month: string;
  total: number;
}