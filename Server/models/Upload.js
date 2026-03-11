const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Reference to the User model
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String, // Where the file is stored locally
    required: true
  },
  fileType: {
    type: String, // e.g., 'application/pdf'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Upload', UploadSchema);