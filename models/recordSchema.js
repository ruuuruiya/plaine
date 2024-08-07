import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true,
    },

    // Step 1
    username: {
        type: String,
        default: "",
    },
    birthdate: {
        type: String,
        default: "",
    },
    gender: {
        type: String,
        default: "",
    },
    height: {
        type: String,
        default: "",
    },
    weight: {
        type: String,
        default: "",
    },
    blood_pressure: {
        type: String,
        default: "",
    },
    blood_sugar_level: {
        type: String,
        default: "",
    },

    // Step 2
    allergies: {
        type: Array,
        default: [],
    },
    medications: [{
        _id: false,
        name: String,
        frequency: String,
    }],
    medical_conditions: {
        type: Array,
        default: [],
    },
    surgical_history: [{
        _id: false,
        name: String,
        date: String,
    }],

    // Step 3
    exercise: {
        type: String,
        default: "",
    },
    dietary: {
        type: String,
        default: "",
    },
    habits: {
        type: String,
        default: "",
    },
    occupation: {
        type: String,
        default: "",
    },
    location: {
        name: {
            type: String,
            default: "",
        },
        coordinate: {
            lat: Number,
            lng: Number,
        },
    },

    // Step 4
    goals: {
        type: Array,
        default: [],
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const Record = mongoose?.models?.Record || mongoose.model('Record', recordSchema);

export default Record;
