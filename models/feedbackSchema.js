import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    feedback: {
        type: String,
        default: "",
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const Feedback = mongoose?.models?.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback;
