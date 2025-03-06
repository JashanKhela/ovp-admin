import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function createUser(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from("users")
    .insert([{ username, password: hashedPassword }]);

  return { data, error };
}
