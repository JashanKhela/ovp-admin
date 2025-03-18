export interface Document {
  name: string;
  url: string;
  path: string;
  uploadedAt: string;
  uploadedBy: string;
  size: string;
  tag: string;
}

export interface TimesheetEntry {
  id?: string;
  first_name: string;
  last_name: string;
  username: string;
  date_tracked: string ;
  start_time: string | null; 
  end_time: string | null; 
  hours_worked: number;
  lunch_break_minutes?: number;
  location: string;
  approval_status?: "Pending" | "Approved" | "Rejected";
  approved_by?: string | null;
}

export interface Employee {
  username: string;
  first_name: string;
  last_name: string;
}

export interface PendingTimeSheet {
  id: number;
  first_name: string;
  last_name: string;
  date_tracked: string;
  hours_worked: number;
}

export interface Expense {
  id?: string;
  description: string
  category: string;
  amount: number;
  expense_date: string;     
  payment_method: string;
  uploaded_by: string;
  receipt_url?: string | null | undefined | File;
  notes:string;
}

export interface HarvestReport {
  id?: string;
  fruit: string;
  variety: string;
  bins_harvested: number;
  pounds_harvested: number;
  harvest_location: string;
  harvest_date: string;
  notes?: string;
  uploaded_by: string;
  shipped_to?: string;
  created_at?: string;
}

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "admin" | "employee";
  last_login?: string; // Nullable, since a user may have never logged in
}

export interface SiteLocation  {
  id: string;
  location_name: string;
  location_description?: string;
  location_lat?: number;
  location_long?: number;
  year_purchased?: number;
  location_size?: string;
}
export interface UpdateLocation {
  id?: string;
  location_name?: string;
  location_description?: string;
  location_lat?: number;
  location_long?: number;
  year_purchased?: number;
  location_size?: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  assigned_to: string[]; // Array of usernames of assigned employees
  assigned_by?: string; // Username of the admin who created the task
  status: "pending" | "in_progress" | "completed" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  start_date?: string; // Stored as YYYY-MM-DD
  end_date?: string; // Stored as YYYY-MM-DD
  completed_at?: string; // Timestamp when completed
  created_at?: string; // Timestamp when created
  updated_at?: string; // Timestamp when last updated
  location?: string; // Field, barn, storage, etc.
  category?: string; // Planting, harvesting, maintenance, etc.
  notes?: string;
}

