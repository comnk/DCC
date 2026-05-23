"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./PostTasksSection.scss";
import { PostTask } from "@/types/PostTask";

const TASK_TYPES = ["copy", "design", "media", "review"] as const;
const STATUS_LABELS: Record<PostTask["status"], string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const TYPE_COLORS: Record<PostTask["type"], string> = {
  copy: "#3b82f6",
  design: "#8b5cf6",
  media: "#f97316",
  review: "#22c55e",
};

export default function PostTasksSection({
  postId,
  campaignId,
  onAllTasksDone,
}: {
  postId: number;
  campaignId: number;
  onAllTasksDone?: () => void;
}) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [members, setMembers] = useState<
    {
      user_id: string;
      user_profiles: { display_name: string; profile_picture: string | null };
    }[]
  >([]);

  const [tasks, setTasks] = useState<PostTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    type: "copy" as PostTask["type"],
    assigned_role: "",
    due_date: "",
  });

  const getToken = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/posts/${postId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks(await res.json());
      }

      const membersRes = await fetch(
        `${API_URL}/campaigns/${campaignId}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (membersRes.ok) setMembers(await membersRes.json());

      setLoading(false);
    };

    fetchTasks().catch(console.error);
  }, [postId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setSubmitting(true);

    const token = await getToken();
    if (!token) return;

    const res = await fetch(`${API_URL}/posts/${postId}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newTask.title,
        type: newTask.type,
        assigned_role: newTask.assigned_role || null,
        due_date: newTask.due_date || null,
      }),
    });

    if (res.ok) {
      const created = await res.json();
      setTasks((prev) => [...prev, created]);
      setNewTask({ title: "", type: "copy", assigned_role: "", due_date: "" });
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const handleStatusChange = async (
    taskId: number,
    status: PostTask["status"],
  ) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
      );

      if (status === "done" && tasks.length > 0) {
        const allDone = tasks
          .map((t) => (t.id === taskId ? { ...t, status } : t))
          .every((t) => t.status === "done");

        if (allDone) {
          await fetch(`${API_URL}/posts/${postId}/submit_for_review`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          });
          onAllTasksDone?.();
        }
      }
    }
  };

  const handleDelete = async (taskId: number) => {
    const token = await getToken();
    if (!token) return;

    await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleUserAssign = async (taskId: number, userId: string | null) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assigned_user_id: userId }),
    });

    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, assigned_user_id: userId } : t,
        ),
      );
    }
  };

  const allDone = tasks.length > 0 && tasks.every((t) => t.status === "done");
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <section className="post-tasks">
      <div className="post-tasks__header">
        <div className="post-tasks__header-left">
          <h2 className="post-tasks__title">Tasks</h2>
          {tasks.length > 0 && (
            <span className="post-tasks__progress">
              {doneCount}/{tasks.length}
              {allDone && (
                <span className="post-tasks__all-done">All done ✓</span>
              )}
            </span>
          )}
        </div>
        <button
          className="post-tasks__add-btn"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "+ Add Task"}
        </button>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="post-tasks__progress-bar">
          <div
            className="post-tasks__progress-fill"
            style={{ width: `${(doneCount / tasks.length) * 100}%` }}
          />
        </div>
      )}

      {/* Add task form */}
      {showForm && (
        <form className="post-tasks__form" onSubmit={handleCreateTask}>
          <input
            className="post-tasks__input"
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, title: e.target.value }))
            }
            required
            autoFocus
          />
          <div className="post-tasks__form-row">
            <select
              className="post-tasks__select"
              value={newTask.type}
              onChange={(e) =>
                setNewTask((p) => ({
                  ...p,
                  type: e.target.value as PostTask["type"],
                }))
              }
            >
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <input
              className="post-tasks__input post-tasks__input--role"
              type="text"
              placeholder="Assigned role (e.g. Content Writer)"
              value={newTask.assigned_role}
              onChange={(e) =>
                setNewTask((p) => ({ ...p, assigned_role: e.target.value }))
              }
            />
            <input
              className="post-tasks__input post-tasks__input--date"
              type="date"
              value={newTask.due_date}
              onChange={(e) =>
                setNewTask((p) => ({ ...p, due_date: e.target.value }))
              }
            />
          </div>
          <div className="post-tasks__form-actions">
            <button
              type="submit"
              className="post-tasks__submit-btn"
              disabled={submitting}
            >
              {submitting ? "Adding…" : "Add Task"}
            </button>
          </div>
        </form>
      )}

      {/* Task list */}
      {loading ? (
        <p className="post-tasks__empty">Loading tasks…</p>
      ) : tasks.length === 0 && !showForm ? (
        <div className="post-tasks__empty-state">
          <p>No tasks yet. Add tasks to track pre-production work.</p>
        </div>
      ) : (
        <ul className="post-tasks__list">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`post-tasks__item ${task.status === "done" ? "post-tasks__item--done" : ""}`}
            >
              <div className="post-tasks__item-left">
                <input
                  type="checkbox"
                  className="post-tasks__checkbox"
                  checked={task.status === "done"}
                  onChange={(e) =>
                    handleStatusChange(
                      task.id,
                      e.target.checked ? "done" : "todo",
                    )
                  }
                />
                <div className="post-tasks__item-info">
                  <span className="post-tasks__item-title">{task.title}</span>
                  <div className="post-tasks__item-meta">
                    <span
                      className="post-tasks__type-badge"
                      style={{
                        background: TYPE_COLORS[task.type] + "20",
                        color: TYPE_COLORS[task.type],
                      }}
                    >
                      {task.type}
                    </span>
                    {task.assigned_role && (
                      <span className="post-tasks__role">
                        {task.assigned_role}
                      </span>
                    )}
                    {task.due_date && (
                      <span
                        className={`post-tasks__due ${new Date(task.due_date) < new Date() && task.status !== "done" ? "post-tasks__due--overdue" : ""}`}
                      >
                        Due{" "}
                        {new Date(
                          task.due_date + "T00:00:00",
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="post-tasks__item-right">
                <select
                  className="post-tasks__user-select"
                  value={task.assigned_user_id ?? ""}
                  onChange={(e) =>
                    handleUserAssign(task.id, e.target.value || null)
                  }
                >
                  {" "}
                  <option value="">Unassigned</option>{" "}
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {" "}
                      {m.user_profiles.display_name}{" "}
                    </option>
                  ))}{" "}
                </select>
                <select
                  className="post-tasks__status-select"
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(
                      task.id,
                      e.target.value as PostTask["status"],
                    )
                  }
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  className="post-tasks__delete-btn"
                  onClick={() => handleDelete(task.id)}
                  title="Delete task"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
