import express from "express";
import { sendMessage, getAllMessages, deleteMessage, deleteAllMessages } from "./message.service.js";
import { checkRole } from "../../utilts/midlleware/role.js";
import { auth } from "../../utilts/midlleware/auth.js";

const router = express.Router();

import { validateMessage } from "./message.validation.js";

router.post("/add-message", validateMessage, sendMessage);
router.get("/get-all-messages", auth, checkRole("Admin"), getAllMessages);
router.delete("/delete-message/:id", auth, checkRole("Admin"), deleteMessage);
router.delete("/delete-all-messages", auth, checkRole("Admin"), deleteAllMessages);

export default router;