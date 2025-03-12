import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// Fetch all users
export async function getUsers() {
  const { data, error } = await supabase.from("users").select("id, username, first_name, last_name, role, last_login");

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data;
}

// Add a new user
export async function addUser(user: { username: string; password: string; first_name: string; last_name: string; role: string }) {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const { error } = await supabase.from("users").insert({ ...user, password: hashedPassword });

  if (error) {
    console.error("Error adding user:", error);
    return false;
  }
  return true;
}

// Reset user password
export async function resetUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const { error } = await supabase.from("users").update({ password: hashedPassword }).eq("id", userId);

  if (error) {
    console.error("Error resetting password:", error);
    return false;
  }
  return true;
}
