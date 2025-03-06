import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp: string | null) {
  if (!timestamp) return "Unknown Date"; // 🛠 Handle null or undefined values

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.warn("⚠️ Invalid timestamp detected:", timestamp);
    return "Invalid Date";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", // e.g., "March"
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Display in AM/PM format
  });
}

export const predefinedTags = [
  "Bank Documents",
  "Employee Documents",
  "Crop Insurance",
  "Agristability",
  "BC Cherry Export",
  "Wali",
  "Personal",
  "Receipt",
  "Packout Slip",
  "Rentals/Tenants",
  "Miscellaneous",
];

export const usersToAdd = [
  { username: "sarbjeetkhela", password: "10231970", role: "admin", first_name: "Sarbjeet", last_name: "Khela" },
  { username: "avneetkhela", password: "10231991", role: "admin", first_name: "Avneet", last_name: "Khela" },
  { username: "nikkikhela", password: "04211999", role: "admin", first_name: "Nikki", last_name: "Khela" },
  { username: "manueldominguez", password: "03261968", role: "employee", first_name: "Manuel", last_name: "Dominguez" },
  { username: "eduardosocorro", password: "12011996", role: "employee", first_name: "Eduardo", last_name: "Socorro" },
];