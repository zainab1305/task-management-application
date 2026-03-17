"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TaskStatus = "todo" | "in_progress" | "done";

type TaskItem = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdDate: string;
};

type ApiError = {
  error?: {
    message?: string;
  };
};

const statusOptions: TaskStatus[] = ["todo", "in_progress", "done"];

export default function DashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");

  const [filterStatus, setFilterStatus] = useState<"" | TaskStatus>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo");

  const [submitting, setSubmitting] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "6",
    });

    if (filterStatus) {
      params.set("status", filterStatus);
    }

    if (search.trim()) {
      params.set("search", search.trim());
    }

    return params.toString();
  }, [page, filterStatus, search]);

  const loadCurrentUser = useCallback(async () => {
    const response = await fetch("/api/auth/me", { credentials: "include" });
    if (response.status === 401) {
      router.push("/login");
      return;
    }

    const result = await response.json();
    if (response.ok) {
      setName(result.data.user.name);
    }
  }, [router]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks?${queryString}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error((result as ApiError)?.error?.message ?? "Failed to fetch tasks");
      }

      setTasks(result.data.tasks);
      setTotalPages(result.data.pagination.totalPages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  }, [queryString, router]);

  useEffect(() => {
    loadCurrentUser();
    loadTasks();
  }, [loadCurrentUser, loadTasks]);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, status }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error((result as ApiError)?.error?.message ?? "Failed to create task");
      }

      setTitle("");
      setDescription("");
      setStatus("todo");
      await loadTasks();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(task: TaskItem) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
  }

  async function saveTask(taskId: string) {
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          status: editStatus,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error((result as ApiError)?.error?.message ?? "Failed to update task");
      }

      setEditingTaskId(null);
      await loadTasks();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update task");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteTask(taskId: string) {
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error((result as ApiError)?.error?.message ?? "Failed to delete task");
      }

      await loadTasks();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete task");
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <h1>Task Control Center</h1>
          <p>{name ? `Signed in as ${name}` : "Loading profile..."}</p>
        </div>
        <button onClick={logout} className="ghost-button" type="button">
          Logout
        </button>
      </section>

      <section className="panel">
        <h2>Create Task</h2>
        <form className="task-form" onSubmit={createTask}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            required
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Task description"
            rows={3}
            required
          />
          <div className="inline-controls">
            <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button disabled={submitting} type="submit">
              {submitting ? "Saving..." : "Add Task"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="toolbar">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search by title"
          />
          <select
            value={filterStatus}
            onChange={(event) => {
              setPage(1);
              setFilterStatus(event.target.value as "" | TaskStatus);
            }}
          >
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? <p>Loading tasks...</p> : null}

        {!loading && tasks.length === 0 ? <p>No tasks found.</p> : null}

        <div className="task-grid">
          {tasks.map((task) => {
            const isEditing = editingTaskId === task.id;

            return (
              <article key={task.id} className="task-card">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                    />
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                    />
                    <select
                      value={editStatus}
                      onChange={(event) => setEditStatus(event.target.value as TaskStatus)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <span className="task-status">{task.status}</span>
                    <small>{new Date(task.createdDate).toLocaleString()}</small>
                  </>
                )}

                <div className="task-actions">
                  {isEditing ? (
                    <>
                      <button type="button" onClick={() => saveTask(task.id)} disabled={submitting}>
                        Save
                      </button>
                      <button type="button" className="ghost-button" onClick={() => setEditingTaskId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => startEditing(task)}>
                        Edit
                      </button>
                      <button type="button" className="danger-button" onClick={() => deleteTask(task.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="pagination">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}
