import { apiRequest, ApiError } from "@/lib/api/core";

export const submitPost = async (
  payload: object,
  accessToken: string,
  postId?: number,
): Promise<{ ok: boolean; error?: string }> => {
  const isUpdate = postId !== undefined;

  try {
    await apiRequest(
      isUpdate ? `/posts/${postId}` : "/posts/create",
      accessToken,
      {
        method: isUpdate ? "PUT" : "POST",
        body: JSON.stringify(payload),
      },
    );
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Something went wrong",
    };
  }
};
