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
