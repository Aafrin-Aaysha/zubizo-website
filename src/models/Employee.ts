import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    empId: {
        type: String,
        required: [true, 'Please provide an Employee ID'],
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        default: 'employee',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: Date,
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
