import { SupabaseClient } from "@supabase/supabase-js";

export const uploadProfileImage = async (file: File, supabase: SupabaseClient, old_path: string): Promise<{ path: string; previewUrl: string }> => {
    if (old_path) {
      const { error: deleteError } = await supabase.storage
        .from("profile_pictures")
        .remove([old_path]);

        if (deleteError) {
          console.error("Error deleting old profile picture:", deleteError);
        }
    } else {
      console.warn("No old profile picture to delete");
    } 
    
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile_pictures")
      .upload(path, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: signedData, error: signedError } = await supabase.storage
      .from("profile_pictures")
      .createSignedUrl(path, 60 * 60);

    if (signedError) throw new Error(signedError.message);

    return { path: path, previewUrl: signedData.signedUrl };
}