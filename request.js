const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("request", requestSchema);