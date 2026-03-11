// const mongoose = require('mongoose');

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect('mongodb://localhost:27017/voting');
//         console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`❌ Error: ${error.message}`);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;

const mongoose = require('mongoose');

// const ATLAS_URI = "mongodb+srv://bharatsharma:India%406427@users.zhyvuoo.mongodb.net/voterApp?retryWrites=true&w=majority";
// mongodb://localhost:27017/voting
const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://bharatsharma:India%406427@users.zhyvuoo.mongodb.net/purna_full?retryWrites=true&w=majority');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
