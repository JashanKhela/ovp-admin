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
  date_tracked: string;
  start_time: string; // 🟢 New field
  end_time: string; // 🟢 New field
  hours_worked: number;
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
