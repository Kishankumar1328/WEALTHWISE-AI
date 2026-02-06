import React, { useState } from 'react';
import api from '../../api/api';

const PaymentButton = ({ amount, description = "WealthWise Premium Subscription", onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Load Script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                alert('Failed to load payment gateway. Please check your internet connection.');
                setLoading(false);
                return;
            }

            // 2. Create Order on Backend
            const orderResponse = await api.post('/payment/create-order', {
                amount: amount, // Amount in decimal (e.g. 100.00)
                description: description,
                currency: "INR"
            });

            const { orderId, amount: amountPaise, currency, keyId } = orderResponse.data;

            // 3. Initialize Razorpay Checkout
            const options = {
                key: keyId,
                amount: amountPaise,
                currency: currency,
                name: "WealthWise AI",
                description: description,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment on Backend
                        await api.post('/payment/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        // Success Callback
                        if (onSuccess) onSuccess(response);
                        alert('Payment Successful!');
                    } catch (err) {
                        console.error("Payment Verification Failed", err);
                        alert('Payment verification failed. Please contact support.');
                        if (onError) onError(err);
                    }
                },
                prefill: {
                    name: "WealthWise User", // You can pass actual user details here
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#6366f1" // WealthWise Brand Color
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error("Payment Error", err);
            const errorMessage = err.response?.data || err.message || "Something went wrong while initiating payment";
            alert(`Payment Initialization Failed: ${errorMessage}`);
            if (onError) onError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? 'Processing...' : `Pay ₹${amount}`}
        </button>
    );
};

export default PaymentButton;
