"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  addTask,
  toggleTask,
  deleteTask,
} from "@/services/projects";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface ActivityLogEntry {
  id: string;
  message: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  activityLogs: ActivityLogEntry[];
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Expanded project (for detail view)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Confirm delete
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProjects();
      if (data && data.success) {
        setProjects(data.data);
      }
    } catch (e) {
      toast.error("Failed to load projects.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const data = await createProject({ title, description, progress: 0 });
      if (data.success) {
        toast.success("Project created!");
        setShowForm(false);
        setTitle("");
        setDescription("");
        fetchProjects();
      } else {
        toast.error("Failed to create project.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  // Replace a single project in state (optimistic update after backend returns)
  const replaceProject = (updated: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDelete = async (id: string) => {
    try {
      const data = await deleteProject(id);
      if (data.success) {
        toast.success("Project deleted.");
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (expandedId === id) setExpandedId(null);
      } else {
        toast.error("Delete failed.");
      }
    } catch {
      toast.error("Network error.");
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight glow-text">
            Active Projects
          </h2>
          <p className="text-gray-400 mt-1 text-sm md:text-base">
            Manage projects, tasks, and track progress automatically.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(138,43,226,0.5)]"
        >
          <Plus className="w-5 h-5" /> New Project
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-panel p-6 rounded-2xl glow-border animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold mb-4">Create New Project</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Project Title
              </label>
              <input
                type="text"
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary/50 focus:outline-none transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Description
              </label>
              <textarea
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary/50 focus:outline-none transition-colors"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary/80 text-black font-semibold px-6 py-2 rounded-xl transition-all"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Project List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl glow-border text-center">
          <h3 className="text-xl font-bold text-gray-300">
            No projects yet
          </h3>
          <p className="text-gray-500 mt-2">
            Create your first project to begin tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              isExpanded={expandedId === proj.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === proj.id ? null : proj.id)
              }
              onProjectUpdated={replaceProject}
              deleteConfirmId={deleteConfirmId}
              onDeleteRequest={(id) => setDeleteConfirmId(id)}
              onDeleteConfirm={handleDelete}
              onDeleteCancel={() => setDeleteConfirmId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Project Card Component ──────────────────────────────────────────────
function ProjectCard({
  project,
  isExpanded,
  onToggleExpand,
  onProjectUpdated,
  deleteConfirmId,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  project: Project;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onProjectUpdated: (p: Project) => void;
  deleteConfirmId: string | null;
  onDeleteRequest: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const [editDesc, setEditDesc] = useState(project.description || "");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  const isDeleteTarget = deleteConfirmId === project.id;
  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const totalTasks = project.tasks.length;

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    try {
      const data = await updateProject(project.id, {
        title: editTitle,
        description: editDesc,
      });
      if (data.success) {
        onProjectUpdated(data.data);
        toast.success("Project updated.");
        setIsEditing(false);
      } else {
        toast.error("Update failed.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    try {
      const data = await addTask(project.id, newTaskTitle);
      if (data.success) {
        onProjectUpdated(data.data);
        setNewTaskTitle("");
        toast.success("Task added!");
      } else {
        toast.error("Failed to add task.");
      }
    } catch {
      toast.error("Network error.");
    }
    setAddingTask(false);
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const data = await toggleTask(project.id, taskId);
      if (data.success) {
        onProjectUpdated(data.data);
      } else {
        toast.error("Failed to update task.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const data = await deleteTask(project.id, taskId);
      if (data.success) {
        onProjectUpdated(data.data);
        toast.success("Task removed.");
      } else {
        toast.error("Failed to remove task.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  return (
    <div className="glass-panel rounded-2xl glow-border overflow-hidden transition-all">
      {/* Card Header */}
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Title & Desc */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full bg-black/40 border border-primary/30 rounded-lg p-2 text-white font-semibold focus:border-primary/60 focus:outline-none transition-colors"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-gray-300 focus:border-primary/50 focus:outline-none transition-colors"
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Description (optional)"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(project.title);
                      setEditDesc(project.description || "");
                    }}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg md:text-xl font-bold truncate">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Right: Actions */}
          {!isEditing && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Edit project"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteRequest(project.id)}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleExpand}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5" />
              {totalTasks > 0
                ? `${completedTasks}/${totalTasks} tasks`
                : "No tasks"}
            </span>
            <span className="font-semibold text-white">{project.progress}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${project.progress}%`,
                background:
                  project.progress === 100
                    ? "linear-gradient(90deg, #4ade80, #22c55e)"
                    : "linear-gradient(90deg, #8a2be2, #00d2ff)",
              }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 mt-1.5">
            <span>
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              {project.progress === 100 ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-green-400" /> Completed
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" /> In Progress
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {isDeleteTarget && (
        <div className="px-5 md:px-6 pb-4">
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300 flex-1">
              Delete &quot;{project.title}&quot;? This cannot be undone.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => onDeleteConfirm(project.id)}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={onDeleteCancel}
                className="px-3 py-1.5 text-gray-400 hover:text-white text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Detail: Tasks + Logs */}
      {isExpanded && (
        <div className="border-t border-white/5 px-5 md:px-6 py-5 space-y-6 animate-in fade-in slide-in-from-top-2">
          {/* ── Tasks Section ── */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" /> Tasks
            </h4>

            {/* Task List */}
            {project.tasks.length > 0 ? (
              <div className="space-y-2 mb-3">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-2.5 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl transition-colors group"
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? "bg-green-500 border-green-500"
                          : "border-gray-500 hover:border-primary"
                      }`}
                    >
                      {task.completed && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm transition-colors ${
                        task.completed
                          ? "text-gray-500 line-through"
                          : "text-gray-200"
                      }`}
                    >
                      {task.title}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-red-400 transition-all"
                      title="Remove task"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-3">
                No tasks yet. Add tasks to auto-track progress.
              </p>
            )}

            {/* Add Task Form */}
            <form
              onSubmit={handleAddTask}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Add a new task..."
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-colors"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                disabled={addingTask}
              />
              <button
                type="submit"
                disabled={addingTask || !newTaskTitle.trim()}
                className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* ── Activity Log Section ── */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" /> Activity Log
            </h4>
            {project.activityLogs.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                {project.activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2.5 text-xs"
                  >
                    <Circle className="w-2 h-2 text-secondary mt-1.5 shrink-0 fill-secondary" />
                    <span className="text-gray-400 flex-1">
                      {log.message}
                    </span>
                    <span className="text-gray-600 shrink-0">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No activity recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
