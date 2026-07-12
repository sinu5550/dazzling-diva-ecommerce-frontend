// components/products/PaymentMethods.jsx
import Image from 'next/image';
import { FaCreditCard } from 'react-icons/fa6';

export default function PaymentMethods() {
    return (
        <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3 mb-3">
                <FaCreditCard className="text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">
                    Guarantee Safe Checkout
                </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
                <div className="border border-gray-200 rounded px-3 py-2">
                    <span className="text-blue-600 font-bold text-lg">VISA</span>
                </div>
                <div className="border border-gray-200 rounded px-3 py-2">
                    <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <div className="w-4 h-4 rounded-full bg-orange-500 -ml-2"></div>
                    </div>
                </div>
                <div className="border border-gray-200 rounded px-3 py-2">
                    <span className="text-orange-500 font-bold text-sm">bKash</span>
                </div>
                <div className="border border-gray-200 rounded px-3 py-2">
                    <span className="text-gray-700 font-semibold text-xs">Cash on Delivery</span>
                </div>
                <button className="text-blue-600 text-sm hover:underline">
                    EMI Bank Details
                </button>
            </div>
        </div>
    );
}