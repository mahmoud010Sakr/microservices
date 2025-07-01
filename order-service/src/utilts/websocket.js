import { Server } from "socket.io";
import chatModel from "../database/model/room.model.js";
import mongoose from "mongoose";
import ticketModel from "../database/model/tickets/ticket.model.js";
import ticketMessageModel from "../database/model/tickets/ticket.message.model.js";
import ticketAttachmentModel from "../database/model/tickets/ticketAttachment.model.js";

// Track online users and their socket connections
const onlineUsers = new Map(); // userId -> socketId
const socketRooms = new Map(); // socketId -> Set of roomIds

export function getReceiverSocketId(userId) {
  return onlineUsers.get(userId);
}

export default (io) => {
  io.on("connection", (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user authentication and initial connection
    socket.on("join", ({ userId }) => {
      if (!userId) {
        console.error("No userId provided for socket connection");
        return;
      }
      
      // Store user's socket ID
      onlineUsers.set(userId, socket.id);
      socketRooms.set(socket.id, new Set());
      
      console.log(`User ${userId} connected with socket ${socket.id}`);
      updateOnlineUsers(io);
    });

    // Handle joining a specific room
    socket.on("joinRoom", (roomId) => {
      if (!roomId) {
        console.error("No roomId provided for joinRoom");
        return;
      }
      
      // Leave any existing rooms
      const userRooms = socketRooms.get(socket.id) || new Set();
      userRooms.forEach(room => {
        socket.leave(room);
      });
      
      // Join the new room
      socket.join(roomId);
      userRooms.add(roomId);
      socketRooms.set(socket.id, userRooms);
      
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Handle ticket creation
    socket.on("newTicket", async (data) => {
      console.log("New ticket created:", data);
      try {
        // 1. Create the ticket
        const ticket = new ticketModel(data);
        const savedTicket = await ticket.save();

        // 2. Handle attachments if any
        let attachmentIds = [];
        if (data.attachments && Array.isArray(data.attachments) && data.attachments.length > 0) {
          const attachmentsToSave = data.attachments.map(att => ({
            attachment: att.attachment, // assuming att.attachment is the file path or URL
            ticketId: savedTicket._id,
            senderId: data.userId // assuming the sender is the ticket creator
          }));
          const savedAttachments = await ticketAttachmentModel.insertMany(attachmentsToSave);
          attachmentIds = savedAttachments.map(att => att._id);
        }

        // 3. Save the ticket message
        const messagePayload = {
          complaint: data.complaint, // assuming the ticket message is in data.complaint
          senderId: data.userId, // assuming the ticket creator is the sender
          ticketId: savedTicket._id,
          attachments: attachmentIds,
          metadata: data.metadata || {}
        };
        const savedMessage = await ticketMessageModel.create(messagePayload);

        // 4. Respond with all created data
        socket.emit("ticketCreated", {
          success: true,
          ticket: savedTicket,
          message: savedMessage,
          attachments: attachmentIds
        });
      } catch (err) {
        console.error("Error saving ticket:", err);
        socket.emit("ticketCreated", { success: false, error: err.message });
      }
    });  

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Clean up user tracking
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      socketRooms.delete(socket.id);
      
      updateOnlineUsers(io);
    });

    socket.on("sendMessage", async ({ senderId, userName, receiverId, message }) => {
      console.log("Received sendMessage event with data:", { senderId, userName, receiverId, message });
      if (!senderId || !receiverId || !message) {
        console.error("Missing required fields!");
        return;
      }
      try {
        io.to(senderId).emit("newMessage", {
          senderId,
          receiverId,
          message,
          userName,
          timestamp: chatMessage.timestamp,
          isSender: true,
        });
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", {
            senderId,
            receiverId,
            message,
            userName,
            timestamp: chatMessage.timestamp,
            isSender: false,
          });
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });
  });
};

function updateOnlineUsers(io) {
  io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
}