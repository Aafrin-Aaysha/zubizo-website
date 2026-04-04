import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Admin'
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        enum: ['admin', 'super-admin'],
        default: 'admin',
    },
    // For Super Admins to toggle between private and global views
    showGlobalData: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
