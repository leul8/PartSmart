const express = require('express');
const { Chapa } = require('chapa-nodejs');
const router = express.Router();

const chapa = new Chapa({
  secretKey: 'CHAPUBK_TEST-8pjUE6KdChcaMvWjS34VDOZgDftu7DHz', // Replace with your actual secret key
});

// Endpoint to initialize payment
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, email, phone_number, currency } = req.body;

    const tx_ref = await chapa.genTxRef(); // Generate unique transaction reference

    const response = await chapa.initialize({
      first_name: 'John',
      last_name: 'Doe',
      email: email,
      phone_number: phone_number,
      currency: currency,
      amount: amount,
      tx_ref: tx_ref,
      callback_url: 'https://your-callback-url.com',
      return_url: 'https://your-return-url.com',
      customization: {
        title: 'Test Title',
        description: 'Test Description',
      },
    });

    res.json({
      message: 'Transaction initialized successfully!',
      checkout_url: response.data.checkout_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while initializing the payment.' });
  }
});

// Endpoint to verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { tx_ref } = req.body;

    const response = await chapa.verify({ tx_ref });

    if (response.status === 'success') {
      res.json({
        message: 'Payment verified successfully!',
        payment_details: response.data,
      });
    } else {
      res.status(400).json({ message: 'Payment verification failed.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while verifying the payment.' });
  }
});

module.exports = router;
