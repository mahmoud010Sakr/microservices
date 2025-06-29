import express from "express";
import { auth } from "../../utilts/midlleware/auth.js";
import { upload } from "../../utilts/multer.js";
import { uploadToCloudinary } from "../../utilts/multer.js";
import { validation } from "../../utilts/validation.js";
import { ticketSchema, updateTicketStatus } from "./tickets.validation.js";
import { addTicket, getUserTickets, getAllTicketsForAdmin, getTicketById, getUserTicketById , updateTheStatus} from "./tickets.service.js";
import {checkRole} from "../../utilts/midlleware/role.js"
import { replyfromAdmin } from "./tickets.service.js";
const router = express.Router()

// --------------------- user ---------------------
router.post('/add-ticket', auth, upload.single('attachment'), uploadToCloudinary(false, "single"), validation({ body: ticketSchema }), addTicket)
router.get("/get-tickets-for-user", auth, getUserTickets)
router.get('/get-user-ticket-by-id/:ticketId', auth, getUserTicketById) 


// --------------------- admin ---------------------
router.get('/get-tickets-for-admin' , auth , checkRole("Admin"), getAllTicketsForAdmin)
router.get('/get-ticket-by-id/:ticketId', auth, checkRole("Admin"), getTicketById)
router.post('/reply-on-ticket/:ticketId', auth,upload.single('attachment'), uploadToCloudinary(false, "single"),validation({ body: ticketSchema.reply }) , replyfromAdmin) // 
router.patch('/update-ticket-status/:ticketId', auth, checkRole("Admin"), validation({ body: updateTicketStatus }), updateTheStatus)
export default router