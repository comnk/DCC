import { SupabaseClient } from "@supabase/supabase-js";

export const uploadPostImages = async (
  files: File[],
  supabase: SupabaseClient,
): Promise<{ paths: string[]; previewUrls: string[] }> => {
  const uploadPromises = files.map(async (file) => {
    const ext = file.name.split(".").pop();
    const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, file);

    if (uploadError) throw new Error(uploadError.message);

    const publicUrl = supabase.storage
      .from("post-images")
      .getPublicUrl(path).data.publicUrl;

    return { path, previewUrl: publicUrl };
  });

  const results = await Promise.all(uploadPromises);
  return {
    paths: results.map((r) => r.path),
    previewUrls: results.map((r) => r.previewUrl),
  };
};