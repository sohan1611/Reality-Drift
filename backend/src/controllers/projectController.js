const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Helper: recalculate project progress from tasks ──────────────────────
async function recalcProgress(projectId) {
  const tasks = await prisma.task.findMany({ where: { projectId } });
  if (tasks.length === 0) return; // keep manual progress when no tasks exist
  const done = tasks.filter(t => t.completed).length;
  const progress = Math.round((done / tasks.length) * 100);
  await prisma.project.update({ where: { id: projectId }, data: { progress } });
}

// ─── Projects CRUD ────────────────────────────────────────────────────────
exports.getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: { orderBy: { createdAt: 'asc' } },
        activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, progress } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const project = await prisma.project.create({
      data: {
        userId: req.user.userId,
        title,
        description,
        progress: progress ? Number(progress) : 0,
      },
      include: { tasks: true, activityLogs: true },
    });

    // Activity log
    await prisma.activityLog.create({
      data: { projectId: project.id, message: `Project "${title}" created` },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, progress } = req.body;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const updates = {};
    const logMessages = [];

    if (title !== undefined && title !== existing.title) {
      updates.title = title;
      logMessages.push(`Project name updated to "${title}"`);
    }
    if (description !== undefined) updates.description = description;
    if (progress !== undefined && progress !== existing.progress) {
      updates.progress = Number(progress);
      logMessages.push(`Progress manually set to ${progress}%`);
    }

    const project = await prisma.project.update({
      where: { id },
      data: updates,
      include: { tasks: true, activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });

    // Create activity logs
    for (const msg of logMessages) {
      await prisma.activityLog.create({ data: { projectId: id, message: msg } });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
};

// ─── Tasks ────────────────────────────────────────────────────────────────
exports.addTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user.userId },
    });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const task = await prisma.task.create({
      data: { projectId, title },
    });

    // Recalc progress & log
    await recalcProgress(projectId);
    await prisma.activityLog.create({
      data: { projectId, message: `New task added: "${title}"` },
    });

    // Return updated project
    const updated = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: { orderBy: { createdAt: 'asc' } }, activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });

    res.status(201).json({ success: true, data: updated });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ success: false, error: 'Failed to add task' });
  }
};

exports.toggleTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user.userId },
    });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { completed: !task.completed },
    });

    // Recalc progress & log
    await recalcProgress(projectId);

    const action = task.completed ? 'uncompleted' : 'completed';
    await prisma.activityLog.create({
      data: { projectId, message: `Task "${task.title}" ${action}` },
    });

    // Return updated project
    const updated = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: { orderBy: { createdAt: 'asc' } }, activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user.userId },
    });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id: taskId } });

    // Recalc progress & log
    await recalcProgress(projectId);
    await prisma.activityLog.create({
      data: { projectId, message: `Task "${task.title}" removed` },
    });

    // Return updated project
    const updated = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: { orderBy: { createdAt: 'asc' } }, activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
};
