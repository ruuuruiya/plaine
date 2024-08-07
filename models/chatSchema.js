import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true,
    },
    chat_id: {
        type: String,
        required: true,
    },

    title: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        default: "",
    },

    messages: {
        type: Array,
        default: [],
    },
    files: {
        type: Array,
        default: [],
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const Chat = mongoose?.models?.Chat || mongoose.model('Chat', chatSchema);

export default Chat;
