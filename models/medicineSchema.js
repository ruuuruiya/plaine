import { nanoid } from "@/lib/utils";
import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true,
    },
    med_id: {
        type: String,
        required: true,
        default: () => nanoid(),
    },

    image: {
        type: String,
        default: "",
    },
    name: {
        type: String,
        default: "",
    },
    frequency: {
        type: String,
        default: "",
    },
    indications: {
        type: Array,
        default: [],
    },
    contraindications: {
        type: Array,
        default: [],
    },
    side_effects: {
        type: Array,
        default: [],
    },
    notes: {
        type: String,
        default: "",
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const Medicine = mongoose?.models?.Medicine || mongoose.model('Medicine', medicineSchema);

export default Medicine;
