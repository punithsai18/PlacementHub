const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getChatHistory, saveMessage } = require('../services/chatService');
const { getWebPubSubClient } = require('../config/azure');

const router = express.Router();

// GET /api/chat/history/:userId
router.get('/history/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    // Users can only view their own chat history
    if (parseInt(req.user.id) !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const messages = await getChatHistory(userId);
    res.json(messages);
  } catch (err) {
    console.error('Chat history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chat history', details: err.message });
  }
});

// POST /api/chat/token - get Web PubSub access token for client
router.post('/token', authMiddleware, async (req, res) => {
  try {
    const hub = process.env.AZURE_WEB_PUBSUB_HUB || 'chat';
    const pubSubClient = getWebPubSubClient(hub);
    const userId = req.user.id.toString();
    const token = await pubSubClient.getClientAccessToken({
      userId,
      roles: ['webpubsub.joinLeaveGroup', 'webpubsub.sendToGroup']
    });
    res.json({ url: token.url, token: token.token });
  } catch (err) {
    console.error('PubSub token error:', err.message);
    res.status(500).json({ error: 'Failed to get chat token', details: err.message });
  }
});

// POST /api/chat/message - save a message (called by Web PubSub event handler or client)
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { toUserId, message, groupId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message content is required' });

    const savedMessage = await saveMessage({
      fromUserId: req.user.id.toString(),
      toUserId: toUserId || null,
      groupId: groupId || null,
      message,
      timestamp: new Date().toISOString()
    });
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Save message error:', err.message);
    res.status(500).json({ error: 'Failed to save message', details: err.message });
  }
});

module.exports = router;
