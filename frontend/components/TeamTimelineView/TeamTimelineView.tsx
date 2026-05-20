"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./TeamTimelineView.scss";

type TaskStatus = "todo" | "in_progress" | "done";

interface TimelineTask {
  id: number;
  title: string;
  type: "copy" | "design" | "media" | "review";
  assigned_role: string;
  assigned_user_id: string | null;
  due_date: string | null;
  status: TaskStatus;
  post_id: number;
  posts?: {
    id: number;
    title: string;
    campaign_id: number;
    campaigns?: { name: string };
  };
}

type GroupedTasks = Record<string, TimelineTask[]>;

const TYPE_COLORS: Record<string, string> = {
  copy: "#3b82f6",
  design: "#8b5cf6",
  media: "#f97316",
  review: "#22c55e",
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; cls: string }> = {
  todo: { label: "To Do", cls: "status--todo" },
  in_progress: { label: "In Progress", cls: "status--in-progress" },
  done: { label: "Done", cls: "status--done" },
};

function getDueUrgency(dueDate: string | null, status: TaskStatus): string {
  if (!dueDate || status === "done") return "normal";
  const due = new Date(dueDate + "T00:00:00");
  const diffDays = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 2) return "urgent";
  if (diffDays <= 5) return "soon";
  return "normal";
}

function formatDue(dueDate: string): string {
  return new Date(dueDate + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const getToken = async () => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};

export default function TeamTimelineView() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [grouped, setGrouped] = useState<GroupedTasks>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [view, setView] = useState<"team" | "mine">("team");
  const [myRole, setMyRole] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Fetch the current user's role from user_profiles
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role) setMyRole(profile.role);
      }

      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      if (view === "team") {
        const res = await fetch(`${API_URL}/tasks/by-role`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setGrouped(await res.json());
        else setError("Failed to load team timeline.");
      } else {
        const res = await fetch(`${API_URL}/tasks/my-tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const flat: TimelineTask[] = await res.json();
          const byType = flat.reduce((acc, task) => {
            acc[task.type] = [...(acc[task.type] ?? []), task];
            return acc;
          }, {} as GroupedTasks);
          setGrouped(byType);
        } else setError("Failed to load your tasks.");
      }
      setLoading(false);
    };
    load().catch(console.error);
  }, [view]);

  const handleStatusChange = async (
    taskId: number,
    status: TaskStatus,
    group: string,
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
      setGrouped((prev) => ({
        ...prev,
        [group]: prev[group].map((t) =>
          t.id === taskId ? { ...t, status } : t,
        ),
      }));
    }
  };

  const allTasks = Object.values(grouped).flat();
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => t.status === "done").length;
  const overdueTasks = allTasks.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date + "T00:00:00") < new Date() &&
      t.status !== "done",
  ).length;

  const filteredGrouped: GroupedTasks = Object.fromEntries(
    Object.entries(grouped)
      .map(([key, tasks]) => [
        key,
        filterStatus === "all"
          ? tasks
          : tasks.filter((t) => t.status === filterStatus),
      ])
      .filter(([, tasks]) => (tasks as TimelineTask[]).length > 0),
  );

  // Sort so the current user's role group always appears first
  const sortedGroups = Object.entries(filteredGrouped).sort(([a], [b]) => {
    if (myRole && a.toLowerCase() === myRole.toLowerCase()) return -1;
    if (myRole && b.toLowerCase() === myRole.toLowerCase()) return 1;
    return 0;
  });

  if (loading)
    return (
      <div className="tl-loading">
        <div className="tl-loading__spinner" />
        <span>
          {view === "team" ? "Loading team timeline…" : "Loading your tasks…"}
        </span>
      </div>
    );

  if (error) return <div className="tl-error">{error}</div>;

  return (
    <div className="tl">
      {/* ── Header ── */}
      <header className="tl__header">
        <div className="tl__header-left">
          <h1 className="tl__title">
            {view === "team" ? "Team Timeline" : "My Tasks"}
          </h1>
          <p className="tl__subtitle">
            {view === "team" ? (
              myRole ? (
                <>
                  Pre-production workload by role{" "}
                  <span className="tl__your-role">· {myRole}</span>
                </>
              ) : (
                "Pre-production workload by role"
              )
            ) : (
              "Tasks assigned to you"
            )}
          </p>
        </div>

        <div className="tl__header-right">
          <div className="tl__view-toggle">
            <button
              className={`tl__view-btn ${view === "mine" ? "tl__view-btn--active" : ""}`}
              onClick={() => setView("mine")}
            >
              My Tasks
            </button>
            <button
              className={`tl__view-btn ${view === "team" ? "tl__view-btn--active" : ""}`}
              onClick={() => setView("team")}
            >
              Team
            </button>
          </div>
          <div className="tl__stats">
            <div className="tl__stat">
              <span className="tl__stat-value">{totalTasks}</span>
              <span className="tl__stat-label">Total</span>
            </div>
            <div className="tl__stat">
              <span className="tl__stat-value tl__stat-value--done">
                {doneTasks}
              </span>
              <span className="tl__stat-label">Done</span>
            </div>
            {overdueTasks > 0 && (
              <div className="tl__stat">
                <span className="tl__stat-value tl__stat-value--overdue">
                  {overdueTasks}
                </span>
                <span className="tl__stat-label">Overdue</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Filters ── */}
      <div className="tl__filters">
        {(["all", "todo", "in_progress", "done"] as const).map((s) => (
          <button
            key={s}
            className={`tl__filter ${filterStatus === s ? "tl__filter--active" : ""}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === "all" ? "All" : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* ── Global progress bar ── */}
      {totalTasks > 0 && (
        <div className="tl__progress-track">
          <div
            className="tl__progress-fill"
            style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
          />
        </div>
      )}

      {/* ── Groups ── */}
      {sortedGroups.length === 0 ? (
        <div className="tl__empty">
          <p>
            {view === "mine"
              ? "No tasks assigned to you."
              : `No active tasks${filterStatus !== "all" ? ` with status "${STATUS_CONFIG[filterStatus as TaskStatus]?.label}"` : ""}.`}
          </p>
        </div>
      ) : (
        <div className="tl__groups">
          {sortedGroups.map(([group, tasks]) => {
            const isCollapsed = !!collapsed[group];
            const groupDone = tasks.filter((t) => t.status === "done").length;
            const isMyRole =
              view === "team" &&
              myRole &&
              group.toLowerCase() === myRole.toLowerCase();

            return (
              <section
                key={group}
                className={`rg ${isCollapsed ? "rg--collapsed" : ""} ${isMyRole ? "rg--mine" : ""}`}
              >
                <button
                  className="rg__header"
                  onClick={() =>
                    setCollapsed((p) => ({ ...p, [group]: !p[group] }))
                  }
                >
                  <div className="rg__header-left">
                    <span className="rg__chevron">
                      {isCollapsed ? "▸" : "▾"}
                    </span>
                    <span className="rg__name">{group}</span>
                    {isMyRole && <span className="rg__you-badge">you</span>}
                    <span className="rg__count">{tasks.length}</span>
                  </div>
                  <div className="rg__header-right">
                    <span className="rg__fraction">
                      {groupDone}/{tasks.length}
                    </span>
                    <div className="rg__mini-track">
                      <div
                        className="rg__mini-fill"
                        style={{
                          width: `${(groupDone / tasks.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </button>

                {!isCollapsed && (
                  <ul className="rg__list">
                    {tasks.map((task) => {
                      const urgency = getDueUrgency(task.due_date, task.status);
                      return (
                        <li key={task.id} className={`tr tr--${task.status}`}>
                          <span
                            className="tr__accent"
                            style={{ background: TYPE_COLORS[task.type] }}
                          />

                          <div className="tr__body">
                            <div className="tr__top">
                              <span className="tr__title">{task.title}</span>
                              <div className="tr__chips">
                                <span
                                  className="tr__type"
                                  style={{
                                    background: TYPE_COLORS[task.type] + "1a",
                                    color: TYPE_COLORS[task.type],
                                  }}
                                >
                                  {task.type}
                                </span>
                                <span
                                  className={`tr__status ${STATUS_CONFIG[task.status].cls}`}
                                >
                                  {STATUS_CONFIG[task.status].label}
                                </span>
                              </div>
                            </div>

                            <div className="tr__meta">
                              {view === "mine" && task.assigned_role && (
                                <span className="tr__role">
                                  ⬡ {task.assigned_role}
                                </span>
                              )}
                              {task.posts && (
                                <span className="tr__post">
                                  ◈ {task.posts.title}
                                  {task.posts.campaigns && (
                                    <span className="tr__campaign">
                                      {" "}
                                      · {task.posts.campaigns.name}
                                    </span>
                                  )}
                                </span>
                              )}
                              {task.due_date && (
                                <span className={`tr__due tr__due--${urgency}`}>
                                  ◷ {urgency === "overdue" ? "Overdue · " : ""}
                                  {formatDue(task.due_date)}
                                </span>
                              )}
                            </div>
                          </div>

                          <select
                            className="tr__select"
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(
                                task.id,
                                e.target.value as TaskStatus,
                                group,
                              )
                            }
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
