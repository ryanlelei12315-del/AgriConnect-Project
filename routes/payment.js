// routes/payment.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const Buffer = require('buffer').Buffer;
require('dotenv').config();

// 1. Middleware to generate Daraja Access Token
const generateToken = async (req, res, next) => {
  const secret = process.env.MPESA_CONSUMER_KEY + ':' + process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(secret).toString('base64');

  try {
    const response = await axios.get('https://safaricom.co.ke', {
      headers: { Authorization: `Basic ${auth}` },
    });
    req.token = response.data.access_token;
    next();
  } catch (error) {
    console.error('Token Generation Failed', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate M-Pesa token' });
  }
};

// 2. Route to initiate STK Push
router.post('/stk-push', generateToken, async (req, res) => {
  const { phone, amount } = req.body;

  // Format phone number to 2547XXXXXXXX
  const formattedPhone = phone.startsWith('0') ? '254' + phone.slice(1) : phone;

  const shortCode = '174379'; // Sandbox default
  const passkey = process.env.MPESA_PASSKEY;

  // Generate Timestamp (YYYYMMDDHHmmss)
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);

  // Generate Password
  const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

  const stkData = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: 'https://your-public-domain.com', // MUST be HTTPS
    AccountReference: 'AgriProductsKE',
    TransactionDesc: 'Payment for Farm Inputs',
  };

  try {
    const response = await axios.post('https://safaricom.co.ke', stkData, {
      headers: { Authorization: `Bearer ${req.token}` },
    });
    res.status(200).json({ success: true, message: 'STK Push initiated!', data: response.data });
  } catch (error) {
    console.error('STK Push Failed', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to trigger STK Push' });
  }
});

// 3. Callback Route (Safaricom calls this silently in the background)
router.post('/callback', (req, res) => {
  const callbackData = req.body.Body.stkCallback;
  console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));
  // Inside routes/payment.js -> router.post('/callback', ...)
  if (callbackData.ResultCode === 0) {
    const metadata = callbackData.CallbackMetadata.Item;
    const mpesaReceipt = metadata.find((item) => item.Name === 'MpesaReceiptNumber').Value;
    const amountPaid = metadata.find((item) => item.Name === 'Amount').Value;

    // Test update: Find our pending test order and update it
    // In production, pass the Order ID via the 'AccountReference' field to match them up
    const order = global.mockOrdersDB.find((o) => o.price === Number(amountPaid));
    if (order) {
      order.status = 'Paid & Processing Shipment';
      order.receipt = mpesaReceipt;
    }
    console.log(`Success! Order updated with receipt ${mpesaReceipt}`);
  }

  if (callbackData.ResultCode === 0) {
    // Success! Extract item metadata like Receipt Number
    const metadata = callbackData.CallbackMetadata.Item;
    const mpesaReceipt = metadata.find((item) => item.Name === 'MpesaReceiptNumber').Value;
    const amountPaid = metadata.find((item) => item.Name === 'Amount').Value;

    console.log(`Payment Successful! Receipt: ${mpesaReceipt}, Amount: KES ${amountPaid}`);
    // TODO: Update your database here (e.g., mark order as Paid)
  } else {
    console.log(`Payment failed or cancelled. Reason: ${callbackData.ResultDesc}`);
  }

  // Safaricom expects a standard JSON acknowledgement back
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
});

module.exports = router;
