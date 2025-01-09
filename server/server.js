const mongoose = require("mongoose");
const app = require("./app");
const http = require("http"); // Import HTTP module
const { Server } = require("socket.io"); // Import Socket.IO
const Chat = require("./models/chatModel");
const User = require("./models/userModel");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💣💣 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful!");
});

const port = process.env.PORT;
const hostname = "0.0.0.0";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  let currentUser;

  socket.on("user-online", async (userId, chatRooms) => {
    currentUser = await User.findById(userId);

    if (!currentUser) return;

    currentUser.isOnline = true;
    await currentUser.save({ validateBeforeSave: false });

    chatRooms.forEach((chat) => socket.join(chat));

    activeUsers.push({
      user: userId,
      chatRooms,
      currentlyInChatRoom: null,
    });
  });

  socket.on("enter-chat-room", async (room) => {
    console.log(
      `User ${currentUser._id.toString()} joined the chat room ${room}`
    );

    const activeUser = activeUsers.find(
      (user) => user.user === currentUser._id.toString()
    );

    if (activeUser) {
      activeUser.currentlyInChatRoom = room;
    }

    if (!activeUser.chatRooms.includes(room)) {
      activeUser.chatRooms.push(room);
      socket.join(room);
    }

    const targetChat = await Chat.findById(room);

    if (!targetChat) return;

    const unreadMessages = targetChat.messages.filter(
      (message) =>
        !message.isRead && message.senderId != currentUser._id.toString()
    );

    if (unreadMessages.length > 0) {
      targetChat.messages.forEach((message) => {
        if (!message.isRead) {
          message.isRead = true;
        }
      });
      await targetChat.save();
    }

    const otherParticipantId = targetChat.participants.find((user) => {
      return user.toString() !== activeUser.user.toString();
    });

    socket.emit("update-notifications", otherParticipantId);

    socket.to(room).emit("update-read-state", targetChat.messages);
  });

  socket.on("leave-chat-room", () => {
    const activeUser = activeUsers.find(
      (user) => user.user === currentUser._id.toString()
    );
    if (activeUser) {
      activeUser.currentlyInChatRoom = null;
    }
  });

  socket.on("send-message", async (newMessage, room, recieverId) => {
    const targetChat = await Chat.findById(room);
    const reciever = activeUsers.find(
      (user) => user.user === recieverId.toString()
    );

    if (!targetChat.isApproved && targetChat.messages.at(-1)?.senderId) {
      targetChat.messages.at(-1).senderId.toString() === newMessage.senderId
        ? (targetChat.isApproved = false)
        : (targetChat.isApproved = true);
    }

    const recieverIsActive = activeUsers.find(
      (user) => user.user === recieverId && user.currentlyInChatRoom === room
    );

    if (recieverIsActive) {
      newMessage.isRead = true;
      socket.emit("reciever-online");
      newMessage.isInChatRoom = reciever.currentlyInChatRoom === room;
    }

    targetChat.messages.unshift(newMessage);
    await targetChat.save();
    socket.to(room).emit("receive-message", newMessage, targetChat.isApproved);
  });

  socket.on("user-is-typing", (room, userId) => {
    socket.to(room).emit("user-is-typing", userId);
  });

  socket.on("user-no-longer-typing", (room, userId) => {
    socket.to(room).emit("user-no-longer-typing", userId);
  });

  socket.on("disconnect", async () => {
    activeUsers = activeUsers.filter(
      (user) => user.user !== currentUser._id.toString()
    );
    currentUser.isOnline = false;
    await currentUser.save({ validateBeforeSave: false });
  });
});

server.listen(port, hostname, () => {
  console.log(`Listening to requests on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💣💣 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
