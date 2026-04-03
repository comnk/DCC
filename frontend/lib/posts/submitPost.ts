export const submitPost = async (
  payload: object,
  accessToken: string,
): Promise<{ ok: boolean; error?: string }> => {
  const res = await fetch("http://localhost:8000/posts/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    const message = Array.isArray(errorData.detail)
      ? errorData.detail.map((e: { msg: string }) => e.msg).join(", ")
      : (errorData.detail ?? "Something went wrong");
    return { ok: false, error: message };
  }

  return { ok: true };
};