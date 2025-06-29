import directMessageModel from "../../database/model/directMessage.model.js";



export const sendMessage = async (req, res) => {
    try {
        const { userName, email, phone, message } = req.body;
        if (!userName || !email || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newMessage = new directMessageModel({
            userName,
            email,
            phone,
            message
        });
        await newMessage.save();
        return res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const getAllMessages = async (req, res) => {
    try {
        const messages = await directMessageModel.find();
        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await directMessageModel.findByIdAndDelete(id);
        return res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteAllMessages = async (req, res) => {
    try {
        await directMessageModel.deleteMany();
        return res.status(200).json({ message: "All messages deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
