/**
 * Socket.IO handler for real-time communication
 */
const socketHandler = (io) => (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Handle joining a breakout room
  socket.on('joinRoom', ({ roomId, userId, userName }) => {
    socket.join(`room:${roomId}`);
    
    // Notify others in the room
    socket.to(`room:${roomId}`).emit('userJoined', { 
      userId, 
      userName,
      timestamp: new Date()
    });
    
    console.log(`User ${userId} joined room ${roomId}`);
  });
  
  // Handle leaving a room
  socket.on('leaveRoom', ({ roomId, userId, userName }) => {
    socket.leave(`room:${roomId}`);
    
    // Notify others in the room
    socket.to(`room:${roomId}`).emit('userLeft', { 
      userId, 
      userName,
      timestamp: new Date()
    });
    
    console.log(`User ${userId} left room ${roomId}`);
  });
  
  // Handle sending messages in a room
  socket.on('sendMessage', ({ roomId, message, sender }) => {
    const timestamp = new Date();
    
    // Broadcast to everyone in the room including sender
    io.to(`room:${roomId}`).emit('newMessage', { 
      message, 
      sender,
      timestamp 
    });
  });
  
  // Handle "user is typing" indicator
  socket.on('typing', ({ roomId, userId, userName }) => {
    socket.to(`room:${roomId}`).emit('userTyping', { userId, userName });
  });
  
  // Handle "user stopped typing" indicator
  socket.on('stopTyping', ({ roomId, userId }) => {
    socket.to(`room:${roomId}`).emit('userStoppedTyping', { userId });
  });
  
  // Handle media sharing permissions
  socket.on('toggleMedia', ({ roomId, userId, mediaType, isEnabled }) => {
    socket.to(`room:${roomId}`).emit('mediaToggled', { userId, mediaType, isEnabled });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
};

module.exports = socketHandler;