import { supabase } from "@/lib/supabase";
import { Task } from "@/lib/interfaces";

// Fetch all tasks
export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error.message);
    return [];
  }
  return data;
}

// Add a new task
export async function addTask(taskData: Task) {
  const { error } = await supabase.from("tasks").insert([taskData]);

  if (error) {
    console.error("Error adding task:", error.message);
    return false;
  }
  return true;
}

// Update a task
export async function updateTask(id: string, taskData: Partial<Task>) {
  const { error } = await supabase.from("tasks").update(taskData).eq("id", id);

  if (error) {
    console.error("Error updating task:", error.message);
    return false;
  }
  return true;
}

// Delete a task
export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    console.error("Error deleting task:", error.message);
    return false;
  }
  return true;
}
