import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Bank Account', 'Credit Card', 'Debit Card', 'Cash Wallet'],
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

const Account = mongoose.model('Account', accountSchema);

export default Account;
