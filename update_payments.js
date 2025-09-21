const mongoose = require('mongoose');

async function updatePayments() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nhattin_software');
    
    const PaymentSchema = new mongoose.Schema({}, { strict: false });
    const Payment = mongoose.model('PaymentDetail', PaymentSchema);
    
    const result = await Payment.updateMany(
      { _id: { $in: ['68cf9fc39a5b13f64da7b6e7', '68cf9fc39a5b13f64da7b6e9'] } },
      { id_order: '68cfa00c9a5b13f64da7b746' }
    );
    
    console.log('Updated payments:', result);
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
}

updatePayments();
