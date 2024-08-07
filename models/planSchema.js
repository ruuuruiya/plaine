import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true,
    },
    plan_list: [{
        _id: false,
        plan_id: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        deadline: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            default: "1",
        },
        column: {
            type: String,
            default: "0",
        },
        created_at: {
            type: Date,
            default: () => new Date(),
        },
    }]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const Plan = mongoose?.models?.Plan || mongoose.model('Plan', planSchema);

export default Plan;
