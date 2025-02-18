const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getChat = catchAsync(async (req, res, next) => {
  const user1 = await User.findById(req.query.user1);
  const user2 = await User.findById(req.query.user2).select(
    "_id name isOnline photo handle chatsJoined"
  );

  if (!user2) {
    return next(new AppError("This user doesn't exist", 400));
  }

  if (user1._id.toString() === user2._id.toString()) {
    return next(new AppError("You can't message yourself", 403));
  }

  const chat = await Chat.findOne({
    participants: { $all: [user1._id, user2._id] },
  });

  if (chat) {
    return res.status(200).json({
      status: "success",
      message: "Chat found",
      chat: chat,
      user: user2,
    });
  }

  const isApproved = user1.friends.includes(user2._id.toString());

  const newChat = await Chat.create({
    participants: [user1._id, user2._id],
    isApproved: isApproved,
  });

  user1.chatsJoined.push(newChat._id);
  user2.chatsJoined.push(newChat._id);

  await user1.save({ validateBeforeSave: false });
  await user2.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Chat created",
    chat: newChat,
    user: user2,
  });
});

exports.getChats = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: "chatsJoined",
      options: { sort: { "messages.timestamp": -1 } },
      populate: {
        path: "participants",
        select: "name photo isOnline",
      },
    })
    .lean();

  const filteredChats = await Promise.all(
    user.chatsJoined.map(async (chat) => {
      const otherParticipant = chat.participants.find(
        (participant) => participant._id.toString() !== user._id.toString()
      );

      const otherParticipantData = await User.findById(otherParticipant).select(
        "name photo _id isOnline"
      );

      const unreadMessages = chat.messages.filter(
        (message) =>
          message.senderId.toString() === otherParticipant._id.toString() &&
          !message.isRead
      );

      const isApproved = chat.isApproved;

      const userSentFirstMessage =
        chat.messages.length > 0 &&
        chat.messages[chat.messages.length - 1].senderId.toString() ===
          user._id.toString();

      if (isApproved || userSentFirstMessage) {
        return {
          otherParticipantData,
          lastMessage: chat.messages[0] || null,
          unreadMessages: unreadMessages.length,
          isApproved: isApproved,
        };
      }
      return null;
    })
  );

  const filteredResults = filteredChats.filter((chat) => chat !== null);

  res.status(200).json({
    status: "success",
    data: filteredResults,
  });
});

exports.getContactRequests = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: "chatsJoined",
      options: { sort: { "messages.timestamp": -1 } },
      populate: {
        path: "participants",
        select: "name photo isOnline",
      },
    })
    .lean();

  const filteredChats = await Promise.all(
    user.chatsJoined.map(async (chat) => {
      const otherParticipant = chat.participants.find(
        (participant) => participant._id.toString() !== user._id.toString()
      );

      const otherParticipantData = await User.findById(otherParticipant).select(
        "name photo _id isOnline"
      );

      const unreadMessages = chat.messages.filter(
        (message) =>
          message.senderId.toString() === otherParticipant._id.toString() &&
          !message.isRead
      );

      const isApproved = chat.isApproved;

      const userSentFirstMessage =
        chat.messages.length > 0 &&
        chat.messages[0].senderId.toString() === user._id.toString();

      if (!isApproved && !userSentFirstMessage) {
        return {
          otherParticipantData,
          lastMessage: chat.messages[0] || null,
          unreadMessages: unreadMessages.length,
        };
      }
      return null;
    })
  );

  const filteredResults = filteredChats.filter((chat) => chat !== null);

  res.status(200).json({
    status: "success",
    data: filteredResults,
  });
});
