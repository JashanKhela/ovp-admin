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
  username: string;
  first_name: string;
  last_name: string;
  date_tracked: string;
  hours_worked: number;
  location: string;
  approval_status?: "Pending" | "Approved" | "Rejected";
  approved?: boolean;
  approved_by?: string | null;
  created_at?: string;
}

export interface Employee {
  username: string;
  first_name: string;
  last_name: string;
}
