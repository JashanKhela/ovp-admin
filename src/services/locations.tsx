import { SiteLocation, UpdateLocation } from "@/lib/interfaces";
import { supabase } from "../lib/supabase";

export async function getLocations() {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("location_name", { ascending: false });

  if (error) {
    console.error("Error fetching locations:", error.message);
    return [];
  }
  return data;
}

export async function addLocation(locationData:SiteLocation) {
    console.log(locationData)
  const { error } = await supabase.from("locations").insert([locationData]);

  if (error) {
    console.error("Error adding location:", error.message);
    return false;
  }
  return true;
}

export async function updateLocation(id: string, locationData: Partial<UpdateLocation>) {
  const { data, error } = await supabase
    .from("locations")
    .update(locationData)
    .eq("id", id);

  if (error) {
    console.error("Error updating location:", error.message);
    return false;
  }
  return data;
}

export async function deleteLocation(id: string) {
  const { error } = await supabase.from("locations").delete().eq("id", id);

  if (error) {
    console.error("Error deleting location:", error.message);
    return false;
  }
  return true;
}
