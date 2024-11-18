import { Router } from 'express';
import { ChatController } from '../controller/chatController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const chatController = new ChatController

// Apply auth middleware to all chat routes
router.use(authMiddleware);

// Chat room management routes
router.get('/chats', chatController.getUserChats);
router.post('/chats/personal', chatController.startPersonalChat);
router.post('/chats/group', chatController.createGroupChat);

// Message routes
router.post('/messages', chatController.sendMessage);
router.get('/messages/:chatRoomId', chatController.getChatHistory);

// Group management routes
router.post('/group/add', chatController.addToGroup);
router.post('/group/remove', chatController.removeFromGroup);

export default router;