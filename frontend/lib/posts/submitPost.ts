export const submitPost = async (
  payload: object,
  accessToken: string,
  postId?: number,
): Promise<{ ok: boolean; error?: string }> => {
  const isUpdate = postId !== undefined;

  const res = await fetch(
    isUpdate
      ? `http://localhost:8000/posts/${postId}`
      : `http://localhost:8000/posts/create`,
    {
      method: isUpdate ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    const message = Array.isArray(errorData.detail)
      ? errorData.detail.map((e: { msg: string }) => e.msg).join(", ")
      : (errorData.detail ?? "Something went wrong");
    return { ok: false, error: message };
  }

  return { ok: true };
};