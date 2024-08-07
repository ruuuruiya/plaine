import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    is_first_login: {
        type: Boolean,
        required: true,
    },

    // Dashboard - Overview
    health_issues: {
        type: Array,
        default: [],
    },
    recommendations: {
        food: {
            type: Array,
            default: [],
        },
        exercise: {
            type: Array,
            default: [],
        },
        activity: {
            type: Array,
            default: [],
        },
    },
    health_status: {
        status: {
            type: String,
            default: "0",
        },
        description: {
            type: String,
            default: "",
        },
    },
    last_login: {
        type: Date,
        default: () => new Date(),
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const User = mongoose?.models?.User || mongoose.model('User', userSchema);

export default User;
