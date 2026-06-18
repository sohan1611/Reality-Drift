const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const logController = require('../controllers/logController');
const aiController = require('../controllers/aiController');
const projectController = require('../controllers/projectController');
const userController = require('../controllers/userController');
const supportController = require('../controllers/supportController');
const goalController = require('../controllers/goalController');
const reviewController = require('../controllers/reviewController');
const replayController = require('../controllers/replayController');
const auth = require('../middlewares/authMiddleware');

// Auth Routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/google', authController.googleLogin);
router.get('/auth/me', auth, authController.getMe);
router.delete('/auth/account', auth, authController.deleteAccount);
router.post('/auth/link-google', auth, authController.linkGoogleAccount);

// User Routes (Protected)
router.get('/user/me', auth, userController.getMe);
router.put('/user/password', auth, userController.updatePassword);
router.put('/user/preferences', auth, userController.updatePreferences);
router.get('/user/export', auth, userController.exportData);
router.delete('/user', auth, userController.deleteAccount);

// Logging Routes (Protected)
router.get('/logs', auth, logController.getLogs);
router.post('/logs', auth, logController.createLog);
router.patch('/logs/:id', auth, logController.updateLog);
router.delete('/log/:id', auth, logController.deleteLog);

// Goals (Protected)
router.get('/goals', auth, goalController.getGoals);
router.post('/goals', auth, goalController.createGoal);
router.patch('/goals/:id', auth, goalController.updateGoal);
router.delete('/goals/:id', auth, goalController.deleteGoal);

// Analytics, Patterns & Utilities (Protected)
router.get('/analytics', auth, logController.getAnalytics);
router.get('/patterns', auth, aiController.detectPatterns);
router.get('/notifications', auth, logController.getNotifications);
router.patch('/notifications/read-all', auth, logController.markAllNotificationsRead);
router.patch('/notifications/:id/read', auth, logController.markNotificationRead);
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
router.post('/simulate-decision', auth, aiController.simulateDecision);
router.post('/coach', auth, aiController.generateCoach);
router.post('/report', auth, aiController.generateWeeklyReport);

// Support & Feedback (Protected)
router.post('/support/issue', auth, supportController.submitIssueReport);
router.post('/support/feature', auth, supportController.submitFeatureRequest);

// AI Chat Companion (Protected)
const chatController = require('../controllers/chatController');
router.post('/chat', auth, chatController.chat);
router.get('/chat/history', auth, chatController.getHistory);

// Review & Replay Routes
router.get('/reviews', auth, reviewController.getReviews);
router.get('/replay', auth, replayController.getReplay);

module.exports = router;
