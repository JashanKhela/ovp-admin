import { TimesheetEntry } from "@/lib/interfaces";
import { supabase } from "@/lib/supabase";


// 🟢 Fetch All Timesheets
export async function getTimesheets() {
  const { data, error } = await supabase
    .from("timesheets")
    .select("*")
    .order("date_tracked", { ascending: false });

  if (error) {
    console.error("❌ Error fetching timesheets:", error.message);
    return [];
  }

  return data as TimesheetEntry[];
}

// 🟢 Add a New Timesheet Entry
export async function addTimesheet(entry: TimesheetEntry) {
  const { error } = await supabase.from("timesheets").insert([entry]);

  if (error) {
    console.error("❌ Error adding timesheet:", error.message);
    return false;
  }

  return true;
}

// 🟢 Update Timesheet Approval Status
export async function updateTimesheetStatus(id: string, status: "Approved" | "Rejected", adminName: string) {
  const { error } = await supabase
    .from("timesheets")
    .update({ approval_status: status, approved: status === "Approved", approved_by: status === "Approved" ? adminName : null })
    .eq("id", id);

  if (error) {
    console.error("❌ Error updating timesheet status:", error.message);
    return false;
  }

  return true;
}
// 🟢 Update Entire Timesheet 
export async function updateTimesheet(entry: TimesheetEntry) {
  if (!entry.id) {
    console.error("Error: Missing timesheet ID for update.");
    return false;
  }

  const { error } = await supabase
    .from("timesheets")
    .update({
      date_tracked: entry.date_tracked,
      start_time: entry.start_time,
      end_time: entry.end_time,
      hours_worked: entry.hours_worked,
      location: entry.location,
      approval_status: entry.approval_status || "Pending",
    })
    .eq("id", entry.id);

  if (error) {
    console.error("Error updating timesheet:", error.message);
    return false;
  }

  return true;
}


// 🟢 Delete a Timesheet Entry
export async function deleteTimesheet(id: string) {
    const { error } = await supabase.from("timesheets").delete().eq("id", id);
  
    if (error) {
      console.error("❌ Error deleting timesheet:", error.message);
      return false;
    }
  
    return true;
  }
  