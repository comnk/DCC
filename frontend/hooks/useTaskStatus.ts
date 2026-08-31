"use client";

import { apiRequest } from "@/lib/api/client";
import { PostTask } from "@/types/PostTask";

export function useTaskStatus(token: string | null) {
  const updateTaskStatus = async (
    taskId: number,
    status: PostTask["status"],
  ): Promise<PostTask | null> => {
    try {
      return await apiRequest<PostTask>(`/tasks/${taskId}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch {
      return null;
    }
  };

  return { updateTaskStatus };
}
