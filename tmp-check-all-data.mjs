import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('e:/zubizo_website', '.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

const AdminSchema = new mongoose.Schema({
    name: String, email: String, role: String
}, { strict: false });

const InquirySchema = new mongoose.Schema({ assignedAdmin: mongoose.Schema.Types.ObjectId }, { strict: false });
const DesignSchema = new mongoose.Schema({ adminId: mongoose.Schema.Types.ObjectId }, { strict: false });
const MaterialSchema = new mongoose.Schema({ adminId: mongoose.Schema.Types.ObjectId }, { strict: false });
const CategorySchema = new mongoose.Schema({ adminId: mongoose.Schema.Types.ObjectId }, { strict: false });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
const Design = mongoose.models.Design || mongoose.model('Design', DesignSchema);
const Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI);
        const oldAdmin = await Admin.findOne({ email: 'admin@zubizo.com' });
        if (oldAdmin) {
            const inqCount = await Inquiry.countDocuments({ assignedAdmin: oldAdmin._id });
            const pInqCount = await Inquiry.countDocuments({ adminId: oldAdmin._id }); // sometimes adminId is used
            const desCount = await Design.countDocuments({ adminId: oldAdmin._id });
            const matCount = await Material.countDocuments({ adminId: oldAdmin._id });
            const catCount = await Category.countDocuments({ adminId: oldAdmin._id });
            
            console.log(`Inquiries attached (assignedAdmin): ${inqCount}`);
            console.log(`Inquiries attached (adminId): ${pInqCount}`);
            console.log(`Designs attached: ${desCount}`);
            console.log(`Materials attached: ${matCount}`);
            console.log(`Categories attached: ${catCount}`);
        } else {
            console.log('Old admin not found');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkData();
