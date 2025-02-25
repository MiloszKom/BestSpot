const mongoose = require("mongoose");
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const Chat = require("./models/chatModel");
const User = require("./models/userModel");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful!");
});

const port = process.env.PORT || 5000;
const hostname = "0.0.0.0";

const server = http.createServer(app);

app.set("trust proxy", 1);

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

    activeUsers.push({
      user: userId,
      chatRooms: [...chatRooms],
      currentlyInChatRoom: null,
    });

    chatRooms.forEach((chat) => socket.join(chat));
  });

  socket.on("enter-chat-room", async (room) => {
    if (!currentUser) return;

    const activeUser = activeUsers.find(
      (user) => user.user === currentUser._id.toString()
    );
    if (activeUser) {
      activeUser.currentlyInChatRoom = room;
      if (!activeUser.chatRooms.includes(room)) {
        activeUser.chatRooms.push(room);
        socket.join(room);
      }
    }

    const targetChat = await Chat.findById(room);
    if (!targetChat) return;

    const unreadMessages = targetChat.messages.filter(
      (msg) =>
        !msg.isRead && msg.senderId.toString() !== currentUser._id.toString()
    );

    if (unreadMessages.length > 0) {
      targetChat.messages = targetChat.messages.map((msg) => ({
        ...msg,
        isRead: true,
      }));
      await targetChat.save();
    }

    const otherParticipantId = targetChat.participants.find(
      (user) => user.toString() !== currentUser._id.toString()
    );

    socket.emit("update-notifications", otherParticipantId);
    socket.to(room).emit("update-read-state", targetChat.messages);
  });

  socket.on("leave-chat-room", () => {
    if (currentUser) {
      const activeUser = activeUsers.find(
        (user) => user.user === currentUser._id.toString()
      );
      if (activeUser) {
        activeUser.currentlyInChatRoom = null;
      }
    }
  });

  socket.on("send-message", async (newMessage, room, receiverId) => {
    if (!currentUser) return;

    const targetChat = await Chat.findById(room);
    if (!targetChat) return;

    if (!targetChat.isApproved && targetChat.messages.length > 0) {
      const lastMessageSender = targetChat.messages.at(-1).senderId.toString();
      targetChat.isApproved = lastMessageSender !== newMessage.senderId;
    }

    const receiverIsActive = activeUsers.find(
      (user) =>
        user.user === receiverId.toString() && user.currentlyInChatRoom === room
    );

    if (receiverIsActive) {
      newMessage.isRead = true;
      newMessage.isInChatRoom = true;
      socket.emit("receiver-online");
    }

    targetChat.messages.unshift(newMessage);
    await targetChat.save();

    socket.to(room).emit("receive-message", newMessage, targetChat.isApproved);
    socket.emit("update-recent-chats", targetChat);
  });

  socket.on("user-is-typing", (room, userId) => {
    socket.to(room).emit("user-is-typing", userId);
  });

  socket.on("user-no-longer-typing", (room, userId) => {
    socket.to(room).emit("user-no-longer-typing", userId);
  });

  socket.on("disconnect", async () => {
    if (currentUser) {
      activeUsers = activeUsers.filter(
        (user) => user.user !== currentUser._id.toString()
      );
      currentUser.isOnline = false;
      await currentUser.save({ validateBeforeSave: false });
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Listening to requests on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💣 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
