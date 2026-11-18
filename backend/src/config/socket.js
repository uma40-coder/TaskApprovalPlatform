const socketUserMap = {}; // userId -> socketId

const configureSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Register user to their socket
    socket.on('register', (userId) => {
      if (userId) {
        socketUserMap[userId] = socket.id;
        socket.join(userId); // join a room named after userId
        console.log(`👤 User ${userId} registered with socket ${socket.id}`);
      }
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('disconnect', () => {
      // Remove user from map
      for (const [uid, sid] of Object.entries(socketUserMap)) {
        if (sid === socket.id) {
          delete socketUserMap[uid];
          break;
        }
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

const getSocketId = (userId) => socketUserMap[userId];

module.exports = { configureSocket, getSocketId };
