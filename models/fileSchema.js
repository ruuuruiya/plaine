import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true,
    },
    file_id: {
        type: String,
        required: true,
    },

    name: {
        type: String,
        default: "",
    },
    total_page: {
        type: Number,
        default: 0,
    },
    label: {
        type: String,
        default: "",
    },
    summary: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        default: "",
    },

    file_url: {
        type: String,
        default: "",
    },
    cover_url: {
        type: String,
        default: "",
    },
    vision_urls: {
        type: Array,
        default: [],
    },

    messages: Array,
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const File = mongoose?.models?.File || mongoose.model('File', fileSchema);

export default File;
