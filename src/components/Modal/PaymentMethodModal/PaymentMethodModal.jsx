// components/Modal/PaymentMethodModal/PaymentMethodModal.jsx
"use client";

import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Wallet, Shield, Clock } from 'lucide-react';

const PaymentMethodModal = ({ isOpen, onClose, onSelectPayment, totalAmount }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({});

    const paymentMethods = [
        {
            id: 'bkash',
            name: 'bKash',
            icon: <Smartphone className="w-6 h-6 text-pink-500" />,
            description: 'Pay with bKash Mobile Banking',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200',
            fields: [
                { name: 'bkashNumber', label: 'bKash Number', type: 'tel', placeholder: '01XXXXXXXXX', required: true },
                { name: 'transactionId', label: 'Transaction ID', type: 'text', placeholder: '8 digit transaction ID', required: true }
            ]
        },
        {
            id: 'nagad',
            name: 'Nagad',
            icon: <Smartphone className="w-6 h-6 text-orange-500" />,
            description: 'Pay with Nagad Mobile Banking',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            fields: [
                { name: 'nagadNumber', label: 'Nagad Number', type: 'tel', placeholder: '01XXXXXXXXX', required: true },
                { name: 'transactionId', label: 'Transaction ID', type: 'text', placeholder: '10 digit transaction ID', required: true }
            ]
        },
        {
            id: 'rocket',
            name: 'Rocket',
            icon: <Wallet className="w-6 h-6 text-green-500" />,
            description: 'Pay with Rocket Digital Banking',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            fields: [
                { name: 'rocketNumber', label: 'Rocket Number', type: 'tel', placeholder: '01XXXXXXXXX', required: true },
                { name: 'transactionId', label: 'Transaction ID', type: 'text', placeholder: 'Transaction reference', required: true }
            ]
        },
        {
            id: 'card',
            name: 'Credit / Debit Card',
            icon: <CreditCard className="w-6 h-6 text-blue-500" />,
            description: 'Visa, Mastercard, Amex, etc.',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            fields: [
                { name: 'cardNumber', label: 'Card Number', type: 'text', placeholder: '1234 5678 9012 3456', required: true },
                { name: 'expiryDate', label: 'Expiry Date', type: 'text', placeholder: 'MM/YY', required: true },
                { name: 'cvv', label: 'CVV', type: 'password', placeholder: '123', required: true },
                { name: 'cardName', label: 'Name on Card', type: 'text', placeholder: 'As on card', required: true }
            ]
        }
    ];

    const handlePaymentSelect = (methodId) => {
        setSelectedMethod(methodId);
        setPaymentDetails({});
    };

    const handleInputChange = (field, value) => {
        setPaymentDetails(prev => ({ ...prev, [field]: value }));
    };

    const validatePaymentDetails = () => {
        const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
        if (!selectedMethodData) return false;

        for (const field of selectedMethodData.fields) {
            if (field.required && !paymentDetails[field.name]) {
                alert(`Please enter ${field.label}`);
                return false;
            }
        }
        return true;
    };

    const handleConfirmPayment = async () => {
        if (!selectedMethod) {
            alert('Please select a payment method');
            return;
        }

        if (!validatePaymentDetails()) return;

        setIsProcessing(true);

        // Simulate payment processing - Replace with actual payment gateway integration
        try {
            // Here you would integrate with actual payment APIs
            // Example: await processPayment(selectedMethod, paymentDetails, totalAmount);

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Pass the payment method and details to parent
            onSelectPayment(selectedMethod, paymentDetails);
            onClose();
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 bg-white border-b border-stone-300 p-5 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 font-philosopher">Select Payment Method</h2>
                            <p className="text-gray-600 mt-1">Total Amount: ৳{totalAmount.toFixed(2)}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-3">
                    {paymentMethods.map((method) => (
                        <div
                            key={method.id}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${selectedMethod === method.id
                                ? 'border-teal-500 bg-teal-50'
                                : `border-gray-200 hover:border-teal-300 hover:bg-gray-50`
                                }`}
                            onClick={() => handlePaymentSelect(method.id)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {method.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">{method.name}</h3>
                                        <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${selectedMethod === method.id ? 'border-teal-500' : 'border-stone-300'
                                            }`}>
                                            {selectedMethod === method.id && (
                                                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Details Form */}
                {selectedMethodData && selectedMethodData.fields && (
                    <div className="px-5 pb-5">
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-800 mb-3">
                                Enter {selectedMethodData.name} Details
                            </h3>
                            <div className="space-y-3">
                                {selectedMethodData.fields.map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type={field.type}
                                            value={paymentDetails[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2 border border-stone-300 diva-rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            required={field.required}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="sticky bottom-0 bg-white border-t p-5 rounded-b-2xl">
                    <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>15:00 remaining</span>
                        </div>
                    </div>
                    <button
                        onClick={handleConfirmPayment}
                        disabled={!selectedMethod || isProcessing}
                        className="w-full py-3 bg-secound text-white rounded font-semibold hover:bg-secound-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Processing...
                            </div>
                        ) : (
                            `Pay ৳${totalAmount.toFixed(2)}`
                        )}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                        <span>🔒</span> Your payment information is secure and encrypted
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodModal;
