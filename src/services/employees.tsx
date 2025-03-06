import { Employee } from "@/lib/interfaces";
import { supabase } from "@/lib/supabase";



// 🟢 Fetch All Employees (Only Users with `role = 'employee'`)
export async function getEmployees() {
  const { data, error } = await supabase
    .from("users")
    .select("username, first_name, last_name")
    .eq("role", "employee"); // ✅ Only fetch employees

  if (error) {
    console.error("❌ Error fetching employees:", error.message);
    return [];
  }

  return data as Employee[];
}
