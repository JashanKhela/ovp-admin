import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function login(username: string, password: string) {
  console.log("🔵 Attempting login for:", username);

  const { data, error } = await supabase
    .from("users")
    .select("id, username, password, role, first_name, last_name, last_login") // 🟢 Fetch the role
    .eq("username", username)
    .single();

  if (error || !data) {
    console.error("❌ Login failed:", error?.message || "Invalid credentials");
    return { error: "Invalid username or password" };
  }

  const isValidPassword = await bcrypt.compare(password, data.password);
  if (!isValidPassword) {
    return { error: "Invalid username or password" };
  }
  await supabase
  .from("users")
  .update({ last_login: new Date().toISOString() })
  .eq("id", data.id);

  console.log(data.role)
  const user = { userId: data.id, username: data.username, role: data.role, first_name: data.first_name, last_name: data.last_name, last_login: data.last_login || new Date().toISOString()}; 

  localStorage.setItem("user", JSON.stringify(user));

  return { userId: data.id };
}


export function logout() {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    window.location.href = "/"; 
  }
  

  export function getCurrentUser() {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return null;
  
      const user = JSON.parse(userData);
  
      if (!user.role) {
        console.warn("⚠️ User role not found in localStorage. Possible login issue.");
        return null;
      }
  
      return user;
    } catch (error) {
      console.error("❌ Error retrieving user from localStorage:", error);
      return null;
    }
  }

// 🟢 Function to Add Employees & Admins
export async function createUsers(users: { username: string; password: string; role: string; first_name: string; last_name:string; }[]) {
  try {
    // Hash passwords before storing
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10), // Hash the password
      }))
    );

    // Insert users into Supabase
    const { error } = await supabase.from("users").insert(hashedUsers);

    if (error) {
      console.error("❌ Error adding users:", error.message);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error in createUsers:", error);
    return { error: "An error occurred while adding users." };
  }
}
