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

    const { data: signedData, error: signedError } = await supabase.storage
      .from("post-images")
      .createSignedUrl(path, 60 * 60);

    if (signedError) throw new Error(signedError.message);

    return { path, previewUrl: signedData.signedUrl };
  });

  const results = await Promise.all(uploadPromises);
  return {
    paths: results.map((r) => r.path),
    previewUrls: results.map((r) => r.previewUrl),
  };
};