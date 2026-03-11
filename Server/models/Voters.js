// const mongoose = require('mongoose');

// const voterSchema = new mongoose.Schema({
//     parbhag: String,
//     yadi_bhag: String,
//     srNo: Number,
//     epic_id: { type: String, unique: true },
//     part: String,
//     relative_type: String,
//     house: String,
//     age: Number,
//     gender: String,
//     name: String,
//     voter_name_eng: String,
//     relative_name_eng: String,
//     mobile: { type: String, default: null },
//     colorCode: { type: String, default: null }, // Store #00C8C8, #1EB139, etc.
//     isVoted: { type: Boolean, default: false }
// });

// module.exports = mongoose.model('Voter', voterSchema, 'Voters');

const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema(
    {
        // --- BASIC DATA FROM OFFICIAL RECORDS ---
        mahanagarpalika: {
            type: String,
            trim: true,
        },
        parbhag: {
            type: String,
            trim: true,
        },
        yadi_bhag: {
            type: String,
            trim: true,
        },
        srNo: {
            type: Number,
        },
        epic_id: {
            type: String,
            unique: true,
            required: true,
            uppercase: true,
            trim: true,
        },
        part: {
            type: String,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        voter_name: {
            type: String,
            trim: true,
        },
        age: {
            type: Number,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other", "M", "F"],
        },
        fatherName: {
            type: String,
            trim: true,
        },
        relative_type: {
            type: String,
            trim: true,
        },
        voter_name_eng: {
            type: String,
            trim: true,
        },
        relative_name_eng: {
            type: String,
            trim: true,
        },

        // --- SURVEY & FIELD MANAGEMENT FIELDS ---
        mobile: {
            type: String,
            trim: true,
            default: "",
        },
        mobile2: {
            type: String,
            trim: true,
            default: "",
        },
        colorCode: {
            type: String,
            default: "#ddd", // Default color for unassigned category
        },
        caste: {
            type: String,
            trim: true,
            default: "",
        },
        designation: {
            type: String,
            trim: true,
            default: "",
        },
        isWorker: {
            type: Boolean,
            default: false,
        },
        newAddress: {
            type: String,
            trim: true,
            default: "",
        },
        society: {
            type: String,
            trim: true,
            default: "",
        },
        flatNo: {
            type: String,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        dob: {
            type: String,
            default: "",
        },
        demands: {
            type: String,
            trim: true,
            default: "",
        },

        // Additional Info fields (अधिक माहिती १-५ from UI)
        extra1: { type: String, default: "" },
        extra2: { type: String, default: "" },
        extra3: { type: String, default: "" },
        extra4: { type: String, default: "" },
        extra5: { type: String, default: "" },

        // Additional Check fields (अधिक चेक १-२ from UI)
        check1: { type: Boolean, default: false },
        check2: { type: Boolean, default: false },

        // --- STATUS TOGGLES ---
        isDead: {
            type: Boolean,
            default: false,
        },
        isStar: {
            type: Boolean,
            default: false,
        },
        isVoted: {
            type: Boolean,
            default: false,
        },

        // --- TRACKING & METADATA ---
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true, // Automatically creates createdAt and updatedAt fields
    },
);

// Indexing for faster searches by EPIC ID and Name
voterSchema.index({ epic_id: 1 });
voterSchema.index({ name: "text" });

module.exports = mongoose.model("Voter", voterSchema, "Voters");
