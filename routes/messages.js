const express = require('express');
const router = express.Router();
const Message = require('../schemas/messages');
const { CheckLogin } = require('../utils/authHandler');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Lấy toàn bộ message giữa 2 user
router.get('/:userID', CheckLogin, async (req, res) => {
  const currentUser = req.user.id;
  const otherUser = req.params.userID;
  try {
    const messages = await Message.find({
      $or: [
        { from: currentUser, to: otherUser },
        { from: otherUser, to: currentUser }
      ]
    }).sort({ createdAt: 1 }); 
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', CheckLogin, upload.single('file'), async (req, res) => {
  const currentUser = req.user.id;
  const { to, text } = req.body;
  let messageType = 'text';
  let messageText = text;

 
  if (req.file) {
    messageType = 'file';
    messageText = req.file.path;
  }

  if (!messageText) {
    return res.status(400).json({ error: 'No message content provided' });
  }

  try {
    const message = new Message({
      from: currentUser,
      to,
      messageContent: {
        type: messageType,
        text: messageText
      }
    });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/', CheckLogin, async (req, res) => {
  const currentUser = req.user.id;
  try {
    const messages = await Message.find({
      $or: [{ from: currentUser }, { to: currentUser }]
    }).sort({ createdAt: -1 });
    const lastMessages = {};
    messages.forEach(msg => {
      const otherUser = msg.from === currentUser ? msg.to : msg.from;
      if (!lastMessages[otherUser]) {
        lastMessages[otherUser] = msg;
      }
    });
    res.json(Object.values(lastMessages));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 module.exports = router;