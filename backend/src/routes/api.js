const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const logController = require('../controllers/logController');
const aiController = require('../controllers/aiController');
const projectController = require('../controllers/projectController');
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

// Auth Routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/google', authController.googleLogin);

// User Routes (Protected)
router.get('/user/me', auth, userController.getMe);
router.put('/user/password', auth, userController.updatePassword);

// Logging Routes (Protected)
router.post('/log', auth, logController.createLog);
router.get('/logs', auth, logController.getLogs);
router.put('/log/:id', auth, logController.updateLog);
router.delete('/log/:id', auth, logController.deleteLog);

// Analytics, Patterns & Utilities (Protected)
router.get('/analytics', auth, logController.getAnalytics);
router.get('/patterns', auth, aiController.detectPatterns);
router.get('/notifications', auth, logController.getNotifications);
router.get('/search', auth, logController.searchLogs);

// Projects (Protected)
router.get('/projects', auth, projectController.getProjects);
router.post('/projects', auth, projectController.createProject);
router.put('/projects/:id', auth, projectController.updateProject);
router.delete('/projects/:id', auth, projectController.deleteProject);

// Tasks (Protected)
router.post('/projects/:projectId/tasks', auth, projectController.addTask);
router.put('/projects/:projectId/tasks/:taskId/toggle', auth, projectController.toggleTask);
router.delete('/projects/:projectId/tasks/:taskId', auth, projectController.deleteTask);

// AI Simulation & Coaching (Protected)
router.post('/simulate', auth, aiController.runSimulation);
router.post('/coach', auth, aiController.generateCoach);

module.exports = router;
