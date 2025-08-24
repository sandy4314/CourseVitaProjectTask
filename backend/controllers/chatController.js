// controllers/chatController.js
const Message = require('../models/Message');
const User = require('../models/User');

// Get messages for a room or private conversation
exports.getMessages = async (req, res) => {
  try {
    const { room, recipientId, limit = 50 } = req.query;
    let query = {};

    if (room) {
      query.room = room;
      query.isPrivate = false;
    } else if (recipientId) {
      query.$or = [
        { sender: req.user.id, recipient: recipientId },
        { sender: recipientId, recipient: req.user.id }
      ];
      query.isPrivate = true;
    } else {
      return res.status(400).json({ message: 'Room or recipient ID required' });
    }

    const messages = await Message.find(query)
      .populate('sender', 'username')
      .populate('recipient', 'username')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a new message
// controllers/chatController.js - Updated sendMessage function
exports.sendMessage = async (req, res) => {
  try {
    const { content, room } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (!room) {
      return res.status(400).json({ message: 'Room is required' });
    }

    const messageData = {
      content,
      room,
      sender: req.user.id,
      timestamp: new Date()
    };

    const message = new Message(messageData);
    await message.save();

    // Populate sender info for real-time emission
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username');

    // Emit to Socket.IO if available
    if (req.app.get('io')) {
      // Emit to everyone in the room
      req.app.get('io').to(room).emit('newMessage', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get available chat rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Message.distinct('room', { isPrivate: false });
    res.json(rooms.filter(room => room !== null));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};