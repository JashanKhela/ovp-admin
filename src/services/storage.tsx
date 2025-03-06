import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./auth";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

// 🟢 Upload file to Supabase Storage with metadata
export async function uploadDocument(file: File, tag: string, setProgress: (progress: number) => void) {
  try {
    const filePath = `uploads/${file.name}`;
    const fileSize = (file.size / 1024).toFixed(2) + " KB"; // Convert to KB
    const uploadedAt = new Date().toISOString(); // Get current timestamp
    setProgress(10);

    // Get the current user from local storage
    const currentUser = getCurrentUser();
    const uploadedBy = currentUser?.username || "Unknown"; // Use username from localStorage
    setProgress(30); 
    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) throw error;
    setProgress(70); 
    // Get public URL
    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    // Store metadata in a Supabase table (if using a database for tracking)
    await supabase.from("document_metadata").insert([
      {
        name: file.name,
        path: filePath,
        uploaded_at: uploadedAt,
        uploaded_by: uploadedBy,
        size: fileSize,
        url: urlData.publicUrl,
        tag: tag
      },
    ]);
    setProgress(100); 
    toast.success(`${file.name} uploaded successfully!`);

    return {
      name: file.name,
      url: urlData.publicUrl,
      path: filePath,
      uploadedAt,
      uploadedBy,
      size: fileSize,
      tag: tag,
    };
  } catch (error) {
    console.error("Supabase Upload Error:", error);
    return null;
  }
}

// 🟢 Get all documents
export async function getAllDocuments() {
  try {
    const { data, error } = await supabase
      .from("document_metadata")
      .select("*");
    console.log(data);
    if (error) throw error;

    return data.map((doc) => ({
      name: doc.name,
      url: doc.url,
      path: doc.path,
      tag: doc.tag,
      uploadedAt: formatDate(doc.uploaded_at),
      uploadedBy: doc.uploaded_by,
      size: doc.size,
    }));
  } catch (error) {
    console.error("Supabase Fetch Error:", error);
    return [];
  }
}

// 🟢 Delete a file from Supabase Storage & document_metadata table
export async function deleteDocument(filePath: string) {
  try {
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([filePath]);
    if (storageError)
      throw new Error(`Storage Delete Error: ${storageError.message}`);

    const { error: metadataError } = await supabase
      .from("document_metadata")
      .delete()
      .eq("path", filePath);

    if (metadataError)
      throw new Error(`Metadata Delete Error: ${metadataError.message}`);
    toast.success(`Document deleted successfully!`);

    return true;
  } catch (error) {
    console.error("❌ Delete Error:", error);
    return false;
  }
}
