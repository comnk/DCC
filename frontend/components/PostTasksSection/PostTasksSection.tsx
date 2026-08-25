"use client";

import { useEffect, useState } from "react";
import { getClientToken, apiRequest } from "@/lib/api/client";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { TASK_TYPE_COLORS } from "@/lib/tasks/taskTypeColors";
import "./PostTasksSection.scss";
import { PostTask } from "@/types/PostTask";

const TASK_TYPES = ["copy", "design", "media", "review"] as const;

export default function PostTasksSection({
  postId,
  onAllTasksDone,
}: {
  postId: number;
  onAllTasksDone?: () => void;
}) {
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
  const [token, setToken] = useState<string | null>(null);
  const { updateTaskStatus } = useTaskStatus(token);

  useEffect(() => {
    const fetchTasks = async () => {
      const currentToken = await getClientToken();
      setToken(currentToken);
      if (!currentToken) {
        setLoading(false);
        return;
      }

      try {
        setTasks(await apiRequest<PostTask[]>(`/posts/${postId}/tasks`, currentToken));
      } catch {
        // preserves prior "silent on failure" behavior
      }

      setLoading(false);
    };

    fetchTasks().catch(console.error);
  }, [postId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setSubmitting(true);

    if (!token) {
      setSubmitting(false);
      return;
    }

    try {
      const created = await apiRequest<PostTask>(`/posts/${postId}/tasks`, token, {
        method: "POST",
        body: JSON.stringify({
          title: newTask.title,
          type: newTask.type,
          assigned_role: newTask.assigned_role || null,
          due_date: newTask.due_date || null,
        }),
      });
      setTasks((prev) => [...prev, created]);
      setNewTask({ title: "", type: "copy", assigned_role: "", due_date: "" });
      setShowForm(false);
    } catch {
      // preserves prior "silent on failure" behavior
    }
    setSubmitting(false);
  };

  const handleStatusChange = async (
    taskId: number,
    status: PostTask["status"],
  ) => {
    const updated = await updateTaskStatus(taskId, status);
    if (!updated) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
    );

    if (status === "done" && tasks.length > 0) {
      const allDone = tasks
        .map((t) => (t.id === taskId ? { ...t, status } : t))
        .every((t) => t.status === "done");

      if (allDone && token) {
        try {
          await apiRequest(`/posts/${postId}/submit_for_review`, token, {
            method: "PUT",
          });
        } catch {
          // preserves prior "fire and forget" behavior
        }
        onAllTasksDone?.();
      }
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!token) return;

    try {
      await apiRequest(`/tasks/${taskId}`, token, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      // preserves prior behavior (no error surfaced to user)
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
                <span
                  className="post-tasks__type-badge"
                  style={{
                    background: TASK_TYPE_COLORS[task.type] + "20",
                    color: TASK_TYPE_COLORS[task.type],
                  }}
                >
                  {task.type}
                </span>
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
