import { HarvestReport } from "@/lib/interfaces";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";


// Fetch all reports
export async function getHarvestReports() {
  const { data, error } = await supabase
    .from("harvest_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    toast.error("Failed to fetch harvest reports.");
    return [];
  }
  return data;
}

// Add a new report
export async function addHarvestReport(report: HarvestReport) {
  const { error } = await supabase.from("harvest_reports").insert(report);
  if (error) {
    toast.error("Failed to add harvest report.");
    return false;
  }
  toast.success("Harvest report added successfully.");
  return true;
}

// Delete a report
export async function deleteHarvestReport(id: string) {
  const { error } = await supabase.from("harvest_reports").delete().eq("id", id);
  if (error) {
    toast.error("Failed to delete harvest report.");
    return false;
  }
  toast.success("Harvest report deleted.");
  return true;
}

export async function getRecentHarvestReports(limit = 5) {
    const { data, error } = await supabase
      .from("harvest_reports")
      .select("*")
      .order("harvest_date", { ascending: false })
      .limit(limit);
  
    if (error) {
      console.error("Error fetching recent harvest reports:", error);
      return [];
    }
    return data;
  }
  
