import { Expense } from "@/lib/interfaces";
import { supabase } from "@/lib/supabase";

import { v4 as uuidv4 } from "uuid"; 

// 🟢 Fetch All Expenses
export async function getExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false }); 

  if (error) {
    console.error("❌ Error fetching expenses:", error.message);
    return [];
  }

  return data;
}

// 🟢 Upload Receipt to Supabase Storage
export async function uploadReceipt(file: File, setUploadProgress: (progress: number) => void) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `receipts/${fileName}`;
  setUploadProgress(10);
  const { error } = await supabase.storage.from("receipts").upload(filePath, file);
  setUploadProgress(45);
  if (error) {
    console.error("❌ Error uploading receipt:", error.message);
    return null;
  }
  setUploadProgress(100);

  return filePath; // Return the receipt's storage path
}

// 🟢 Add New Expense
export async function addExpense(expense: Expense) {
  const { error } = await supabase.from("expenses").insert([expense]);

  if (error) {
    console.error("❌ Error adding expense:", error.message);
    return false;
  }

  return true;
}


// 🟢 Fetch a Single Expense by ID
export async function getExpenseById(id: string): Promise<Expense | null> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .single(); // Fetch only one record

  if (error) {
    console.error("❌ Error fetching expense:", error.message);
    return null;
  }

  return data;
}

export async function updateExpense(id: string, updatedFields: Partial<Expense>) {
  const { error } = await supabase
    .from("expenses")
    .update(updatedFields)
    .eq("id", id);

  if (error) {
    console.error("❌ Error updating expense:", error.message);
    return false;
  }
  return true;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("❌ Error deleting expense:", error.message);
    return false;
  }
  return true;
}

// 🟢 Fetch Recent Expenses
export async function getRecentExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false }) // Sort by latest
    .limit(5); // Get the latest 5

  if (error) {
    console.error("❌ Error fetching recent expenses:", error.message);
    return [];
  }

  return data as Expense[];
}
