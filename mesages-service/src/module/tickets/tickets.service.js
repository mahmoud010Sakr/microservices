import ticketMessageModel from "../../database/model/tickets/ticket.message.model.js";
import ticketModel from "../../database/model/tickets/ticket.model.js";
import ticketAttachmentModel from "../../database/model/tickets/ticketAttachment.model.js";
import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";
import { Server } from "socket.io"
import router from "./ticket.controller.js";
import { auth } from "../../utilts/midlleware/auth.js";
import { AppError } from "../../utilts/errorHandling/AppError.js";
import { v4 as uuidv4 } from 'uuid';
export const addTicket = handleAsyncError(async (req, res) => {
    let { name, email, phone, city, assignedTo, complaint, title } = req.body
    let ticketNumber = uuidv4()
    let shortTicket = ticketNumber.replace(/-/g, '').slice(0, 6);
    let userId = req.user
    let attachment = ""
    let addedAttachment = ""
    let addedMessage = ""
    let ticketsData = ""
    let addedTicket = await ticketModel.create({ name, email, phone, city, assignedTo, title, userId, shortTicket })
    if (addedTicket) {
        addedMessage = await ticketMessageModel.create({ complaint, ticketId: addedTicket._id, senderId: userId })
        addedTicket.comlaintId.push(addedMessage._id)
    }
    if (req.file) {
        attachment = req.file.cloudinaryResult.secure_url;
        addedAttachment = await ticketAttachmentModel.create({ attachment, ticketId: addedTicket._id, senderId: userId })
        addedTicket.ticketAttachmentId.push(addedAttachment._id)
    }
    addedTicket.save()
    ticketsData = {
        addedTicket,
        addedMessage,
        addedAttachment
    }
    const io = req.app.get('io');
    io.emit("newTicket", ticketsData);
    res.json({ message: "Ticket added successfully", ticketsData })
})



export const getUserTickets = handleAsyncError(async (req, res) => {
    let { id } = req.user
    let userTickets = await ticketModel.find({ userId: id }).populate("comlaintId").populate("ticketAttachmentId")
    if (userTickets) {
        return res.status(200).json({ message: "success", userTickets })
    }
    throw new AppError("No tickets found", 400)
})

export const getAllTicketsForAdmin = handleAsyncError(async (req, res) => {
    let ticketData = await ticketModel.find().populate("comlaintId").populate("ticketAttachmentId")
    if (ticketData) {
        return res.status(200).json({ message: "success", ticketData })
    }
    throw new AppError("No tickets found", 400)
})

export const getTicketById = handleAsyncError(async (req, res) => {
    let { ticketId } = req.params
    let ticketData = await ticketModel.findById(ticketId).populate("comlaintId").populate("ticketAttachmentId")
    if (ticketData) {
        return res.status(200).json({ message: "success", ticketData })
    }
    throw new AppError("No tickets found", 400)
})

export const replyfromAdmin = handleAsyncError(async (req, res) => {
    try {
        const { reply } = req.body;
        const { ticketId } = req.params;
        const senderId = req.user._id;
        const ticket = await ticketModel.findById(ticketId);
        if (!ticket) {
            throw new AppError("Ticket not found", 404);
        }
        const addedMessage = await ticketMessageModel.create({
            complaint: reply,
            ticketId,
            senderId
        });
        const updatedTicket = await ticketModel.findByIdAndUpdate(
            ticketId,
            { $push: { comlaintId: addedMessage._id } },
            { new: true }
        ).populate('comlaintId').populate('ticketAttachmentId');
        if (updatedTicket) {
            const io = req.app.get('io');
            if (req.user.role === 'Admin') {
                io.to(`user_${ticket.userId.id}`).emit("replyMessage", {
                    message: "New reply received",
                    ticket: updatedTicket,
                    reply: addedMessage,
                    senderRole: req.user.role
                });
            } else {
                io.to('admins').emit("replyMessage", {
                    message: "New reply received",
                    ticket: updatedTicket,
                    reply: addedMessage,
                    senderRole: req.user.role
                });
            }
            return res.status(200).json({
                message: "Reply sent successfully",
                data: {
                    ticket: updatedTicket,
                    reply: addedMessage,
                    senderRole: req.user.role
                }
            });
        }
        throw new AppError("Failed to update ticket", 500);
    } catch (error) {
        console.error('Error in replyfromAdmin:', error);
        throw error;
    }
})

export const getUserTicketById = handleAsyncError(async (req, res) => {
    let { ticketId } = req.params
    let ticketData = await ticketModel.findById(ticketId).populate("comlaintId").populate("ticketAttachmentId")
    if (ticketData) {
        return res.status(200).json({ message: "success", ticketData })
    }
    throw new AppError("No tickets found", 400)
})

export const updateTheStatus = handleAsyncError(async (req, res) => {
    let {ticketId} = req.params 
    let {status} = req.body
    if (!status) {
        throw new AppError("Status is required", 400);
    }
    let CheckTicket = await ticketModel.findById(ticketId)
    if (!CheckTicket) {
        throw new AppError("Ticket not found", 404);
    }
    if (CheckTicket.status === status) {
        throw new AppError("Ticket status is already updated", 400);
    }
    let updatedStatus = await ticketModel.updateOne({ _id: ticketId }, { status })
    if (updatedStatus) {
        return res.status(200).json({ message: "Status updated successfully" })
    }
    throw new AppError("Failed to update ticket", 500)
}) 