// components/Checkout/BillingDetails.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { divisions, districts, upazilas } from '@/lib/data';
import Link from 'next/link';
import { Home, Briefcase, MapPin, Plus, Star, X } from 'lucide-react';
import Swal from 'sweetalert2';
import AddressAddModal from "../Modal/AddressModal/AddressAddModal";
import { FaLongArrowAltRight } from "react-icons/fa";
import PaymentMethodModal from "../Modal/PaymentMethodModal/PaymentMethodModal";

const BillingDetails = ({
    user,
    register,
    errors,
    watch,
    setValue,
    handleSubmit,
    onCheckoutSubmit,
    loading,
    totalAmount = 0,
    placeOrderRef
}) => {
    const [customerId, setCustomerId] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [showAllAddresses, setShowAllAddresses] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [tempCheckoutData, setTempCheckoutData] = useState(null);

    const watchDivision = watch("division");
    const watchDistrict = watch("district");
    const watchPayment = watch("payment");
    const watchShipping = watch("shipping");
    const watchNote = watch("note");

    // Fetch customer data and addresses
    useEffect(() => {
        const fetchCustomerData = async () => {
            if (!user?.email) {
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                setError(null);
                const result = await apiClient(`/api/customer/email/${encodeURIComponent(user.email)}`);
                let customerData = null;
                if (result && result.success !== undefined) {
                    customerData = result.data;
                } else if (result && result.id) {
                    customerData = result;
                } else if (result && result.customer) {
                    customerData = result.customer;
                }

                if (customerData && customerData.id) {
                    setCustomerId(customerData.id);
                    setAddresses(customerData.customerAddresses || []);
                    const defaultAddr = customerData.customerAddresses?.find(addr => addr.isDefault);
                    if (defaultAddr) {
                        setSelectedAddress(defaultAddr.id);
                        prefillForm(defaultAddr);
                    }
                } else {
                    setCustomerId(null);
                    setAddresses([]);
                    setError('Customer profile not found');
                }
            } catch (error) {
                console.error('Error fetching customer data:', error);
                setError(error.message || 'Failed to load customer data');
                setCustomerId(null);
                setAddresses([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomerData();
    }, [user?.email]);

    // Refetch addresses after adding new one
    const fetchAddresses = async () => {
        if (!customerId) return;
        try {
            const result = await apiClient(`/api/customer/${customerId}/addresses`);
            let addressData = null;
            if (result && result.success !== undefined) {
                addressData = result.data;
            } else if (Array.isArray(result)) {
                addressData = result;
            }
            setAddresses(addressData || []);
            const defaultAddr = addressData?.find(addr => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr.id);
                prefillForm(defaultAddr);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    // Filter districts based on division
    useEffect(() => {
        if (watchDivision) {
            const divisionData = divisions.find((div) => div.name === watchDivision);
            if (divisionData) {
                const districtList = districts.filter((dist) => dist.division_id === divisionData.id);
                setFilteredDistricts(districtList);
                setValue("city", watchDivision);
            }
            setValue("district", "");
            setValue("upazila", "");
            setFilteredUpazilas([]);
        }
    }, [watchDivision, setValue]);

    // Filter upazilas based on district
    useEffect(() => {
        if (watchDistrict) {
            const districtData = districts.find((dist) => dist.name === watchDistrict);
            if (districtData) {
                const upazilaList = upazilas.filter((upazila) => upazila.district_id === districtData.id);
                setFilteredUpazilas(upazilaList);
            }
            setValue("upazila", "");
        }
    }, [watchDistrict, setValue]);

    const getIcon = (type) => {
        switch (type) {
            case 'Home': return <Home className="w-3 h-3 text-secound" />;
            case 'Office': return <Briefcase className="w-3 h-3 text-secound" />;
            default: return <MapPin className="w-3 h-3 text-secound" />;
        }
    };

    const prefillForm = (address) => {
        setValue("recipientName", address.recipientName || user?.fullName || "");
        setValue("phoneNumber", address.phoneNumber || user?.phone || "");
        setValue("address", address.address);
        setValue("upazila", address.upazila);
        setValue("postalCode", address.postalCode);
        setValue("district", address.district);
        setValue("division", address.division);
        setValue("city", address.city);
        setValue("country", address.country);
        setValue("type", address.type);
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address.id);
        prefillForm(address);
        setShowAllAddresses(false);
    };

    const handleAddressAdded = () => {
        fetchAddresses();
        setIsAddModalOpen(false);
    };

    // Handle payment selection from modal
    const handlePaymentSelect = async (paymentMethod, paymentDetails) => {
        if (!tempCheckoutData) return;

        // Update checkout data with selected payment method and details
        const checkoutData = {
            ...tempCheckoutData,
            paymentMethod: paymentMethod,
            paymentDetails: paymentDetails
        };

        // Proceed with checkout
        await onCheckoutSubmit(checkoutData);
        setTempCheckoutData(null);
    };

    // Handle place order when address is selected
    const handlePlaceOrder = async () => {
        if (!customerId) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Customer information is missing.', confirmButtonColor: '#14b8a6' });
            return;
        }
        if (!selectedAddress) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Please select a shipping address', confirmButtonColor: '#14b8a6' });
            return;
        }

        const paymentMethod = watchPayment;
        const checkoutData = {
            customerId: customerId,
            customerAddressId: selectedAddress,
            note: watchNote || '',
            shippingMethod: watchShipping,
            paymentMethod: paymentMethod
        };

        // If online payment is selected, show payment modal
        if (paymentMethod === 'online') {
            setTempCheckoutData(checkoutData);
            setIsPaymentModalOpen(true);
        } else {
            await onCheckoutSubmit(checkoutData);
        }
    };

    // Handle save new address and checkout
    const handleSaveAndCheckout = async (formData) => {
        try {
            if (user && !customerId) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Customer info missing. Refresh page.', confirmButtonColor: '#14b8a6' });
                return;
            }

            if (user && customerId) {
                const addressData = {
                    recipientName: formData.recipientName.trim(),
                    phoneNumber: formData.phoneNumber.trim(),
                    address: formData.address.trim(),
                    upazila: formData.upazila,
                    postalCode: formData.postalCode?.trim(),
                    district: formData.district,
                    division: formData.division,
                    city: formData.city?.trim() || formData.division,
                    country: formData.country || 'Bangladesh',
                    type: formData.type || 'Home',
                    isDefault: formData.isDefault || false
                };

                const addResult = await apiClient(`/api/customer/${customerId}/addresses`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addressData),
                });

                if (addResult && (addResult.success || addResult.data)) {
                    const newAddress = addResult.data || addResult;
                    const checkoutData = {
                        customerId: customerId,
                        customerAddressId: newAddress.id,
                        note: formData.note || '',
                        shippingMethod: formData.shipping,
                        paymentMethod: formData.payment
                    };

                    // If online payment is selected, show payment modal
                    if (formData.payment === 'online') {
                        setTempCheckoutData(checkoutData);
                        setIsPaymentModalOpen(true);
                    } else {
                        await onCheckoutSubmit(checkoutData);
                    }
                } else {
                    throw new Error('Failed to save address');
                }
            } else {
                // Guest checkout
                const guestCustomerData = {
                    fullName: formData.recipientName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phoneNumber.trim(),
                };

                const customerResult = await apiClient('/api/customer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(guestCustomerData),
                });

                if (!customerResult || !customerResult.data?.id) {
                    throw new Error('Failed to create customer profile');
                }

                const newCustomerId = customerResult.data.id;
                const addressData = {
                    recipientName: formData.recipientName.trim(),
                    phoneNumber: formData.phoneNumber.trim(),
                    address: formData.address.trim(),
                    upazila: formData.upazila,
                    postalCode: formData.postalCode?.trim(),
                    district: formData.district,
                    division: formData.division,
                    city: formData.city?.trim() || formData.division,
                    country: 'Bangladesh',
                    type: 'Home',
                    isDefault: true
                };

                const addResult = await apiClient(`/api/customer/${newCustomerId}/addresses`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addressData),
                });

                if (addResult && (addResult.success || addResult.data)) {
                    const newAddress = addResult.data || addResult;
                    const checkoutData = {
                        customerId: newCustomerId,
                        customerAddressId: newAddress.id,
                        note: formData.note || '',
                        shippingMethod: formData.shipping,
                        paymentMethod: formData.payment
                    };

                    // If online payment is selected, show payment modal
                    if (formData.payment === 'online') {
                        setTempCheckoutData(checkoutData);
                        setIsPaymentModalOpen(true);
                    } else {
                        await onCheckoutSubmit(checkoutData);
                    }
                } else {
                    throw new Error('Failed to save address');
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to process checkout',
                confirmButtonColor: '#14b8a6'
            });
        }
    };

    // Assign placeOrderRef handler for OrderSummary's Place Order button
    if (placeOrderRef) {
        placeOrderRef.current = () => {
            if (user && customerId && addresses.length > 0 && selectedAddress && !isAddingNewAddress) {
                handlePlaceOrder();
            } else {
                handleSubmit(handleSaveAndCheckout)();
            }
        };
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 2
        }).format(price);
    };

    // Render shipping and payment options (common for both flows)
    const renderShippingAndPayment = () => (
        <>
            {/* Shipping Method */}
            <div className="mb-6">
                <p className="font-medium mb-3">Shipping Method</p>
                <div className="space-y-2">
                    {/* <label className="flex items-center gap-3 p-3 border border-stone-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            value="local"
                            {...register("shipping")}
                            className="h-4 w-4 text-secound"
                        />
                        <div className="flex-1">
                            <p className="font-medium">Local Pickup</p>
                        </div>
                        <p className="font-semibold">{formatPrice(0)}</p>
                    </label> */}
                    <label className="flex items-center gap-3 p-3 border border-stone-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            value="dhaka-city"
                            {...register("shipping")}
                            className="h-4 w-4 text-secound"
                            defaultChecked
                        />
                        <div className="flex-1">
                            <p className="font-medium">Dhaka City</p>
                        </div>
                        <p className="font-semibold">{formatPrice(0)}</p>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-stone-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            value="outside"
                            {...register("shipping")}
                            className="h-4 w-4 text-secound"
                        />
                        <div className="flex-1">
                            <p className="font-medium">Outside Dhaka</p>
                        </div>
                        <p className="font-semibold">{formatPrice(0)}</p>
                    </label>
                </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
                <p className="font-medium mb-3">Payment Method</p>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-stone-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            value="cod"
                            {...register("payment")}
                            className="h-4 w-4 text-secound"
                            defaultChecked
                        />
                        <div>
                            <p className="font-medium">Cash on Delivery</p>
                        </div>
                    </label>
                    {/* <label className="flex items-center gap-3 p-3 border border-stone-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            value="online"
                            {...register("payment")}
                            className="h-4 w-4 text-secound"
                        />
                        <div>
                            <p className="font-medium">Online Payment</p>
                        </div>
                    </label> */}
                </div>
            </div>

            {/* Order Notes */}
            <div className="mb-6">
                <label className="block mb-1 font-medium">Order Notes (Optional)</label>
                <textarea
                    {...register("note")}
                    placeholder="Special instructions for delivery..."
                    className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all h-24"
                    rows={3}
                />
            </div>
        </>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secound"></div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>

            {/* User Info Display */}
            {user && (
                <div className="mb-6 p-4 bg-white border border-neutral-100 rounded shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Logged in as: {user.fullName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <Link
                            href="/my-account"
                            className="text-sm text-secound hover:text-secound-hover hover:underline"
                        >
                            Edit Profile
                        </Link>
                    </div>
                </div>
            )}

            {user && !customerId && !isLoading && (
                <div className="mb-6 p-4 bg-red-50 rounded border border-red-200">
                    <p className="text-red-800 font-medium">
                        Customer profile not found. Please contact support or try logging in again.
                    </p>
                </div>
            )}

            {/* Address Book View - When user has saved addresses */}
            {user && customerId && addresses.length > 0 && !isAddingNewAddress ? (
                <div className="space-y-6">
                    {/* Selected Address Display */}
                    <div className="bg-white border border-gray-200 diva-rounded p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-md font-bold text-gray-800">Selected Shipping Address</h3>
                            <button
                                type="button"
                                onClick={() => setShowAllAddresses(true)}
                                className="text-sm text-secound hover:text-secound-hover font-medium hover:underline flex items-center gap-1"
                            >
                                Change Address <FaLongArrowAltRight className="text-xs" />
                            </button>
                        </div>
                        {selectedAddress && addresses.find(a => a.id === selectedAddress) && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <p className="text-gray-800 font-medium">
                                        {addresses.find(a => a.id === selectedAddress).recipientName}
                                    </p>
                                </div>
                                <p className="text-gray-700">
                                    📞 {addresses.find(a => a.id === selectedAddress).phoneNumber}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    📍 {addresses.find(a => a.id === selectedAddress).address}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {addresses.find(a => a.id === selectedAddress).upazila}, {addresses.find(a => a.id === selectedAddress).postalCode}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {addresses.find(a => a.id === selectedAddress).district}, {addresses.find(a => a.id === selectedAddress).division}
                                </p>
                                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                    {getIcon(addresses.find(a => a.id === selectedAddress).type)}
                                    <span className="text-gray-700 font-semibold">
                                        {addresses.find(a => a.id === selectedAddress).type}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add Address Button */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-secound border border-secound diva-rounded hover:bg-secound/5 transition-colors font-medium cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Address
                        </button>
                        {addresses.length > 1 && (
                            <button
                                type="button"
                                onClick={() => setShowAllAddresses(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-stone-300 diva-rounded hover:bg-gray-200 transition-colors font-medium cursor-pointer"
                            >
                                View All Addresses <FaLongArrowAltRight />
                            </button>
                        )}
                    </div>

                    {/* Shipping and Payment Options */}
                    {renderShippingAndPayment()}

                    {/* Place Order Button - Moved to OrderSummary section */}
                    {/*
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handlePlaceOrder}
                            disabled={loading || !selectedAddress}
                            className="w-full py-3 bg-secound text-white rounded font-bold hover:bg-secound-hover cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? "Processing..." : "Place Order"}
                        </button>
                    </div>
                    */}
                </div>
            ) : (
                /* Manual Address Form - For guest users or users without addresses */
                <form onSubmit={handleSubmit(handleSaveAndCheckout)}>
                    <div className="space-y-4 mb-6">
                        <div>
                            <h3 className="font-medium mb-3 text-lg">
                                {user ? "Add New Shipping Address" : "Shipping Details"}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">
                                    Recipient Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("recipientName", {
                                        required: "Recipient Name is required",
                                        minLength: { value: 2, message: "At least 2 characters" }
                                    })}
                                    placeholder="Full Name"
                                    className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all"
                                    defaultValue={user?.fullName}
                                />
                                {errors.recipientName && <p className="text-red-500 text-sm mt-1">{errors.recipientName.message}</p>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    {...register("phoneNumber", {
                                        required: "Phone number is required",
                                        pattern: { value: /^(?:\+88|01)?\d{9,11}$/, message: "Valid BD number" }
                                    })}
                                    placeholder="01XXXXXXXXX"
                                    className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all"
                                    defaultValue={user?.phone}
                                />
                                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                            </div>
                        </div>
                        {!user && (
                            <div>
                                <label className="block mb-1 font-medium">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                                    })}
                                    placeholder="your@email.com"
                                    className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">Country <span className="text-red-500">*</span></label>
                                <input
                                    {...register("country")}
                                    className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all"
                                    value="Bangladesh"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Division <span className="text-red-500">*</span></label>
                                <select {...register("division", { required: "Division is required" })}
                                    className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all">
                                    <option value="">Select Division</option>
                                    {divisions.map((division) => (
                                        <option key={division.id} value={division.name}>{division.name}</option>
                                    ))}
                                </select>
                                {errors.division && <p className="text-red-500 text-sm mt-1">{errors.division.message}</p>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">District <span className="text-red-500">*</span></label>
                                <select {...register("district", { required: "District is required" })} className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all disabled:bg-gray-100" disabled={!watchDivision}>
                                    <option value="">{watchDivision ? "Select District" : "Select Division First"}</option>
                                    {filteredDistricts.map((district) => (
                                        <option key={district.id} value={district.name}>{district.name}</option>
                                    ))}
                                </select>
                                {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Upazila <span className="text-red-500">*</span></label>
                                <select {...register("upazila", { required: "Upazila is required" })} className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all disabled:bg-gray-100" disabled={!watchDistrict}>
                                    <option value="">{watchDistrict ? "Select Upazila" : "Select District First"}</option>
                                    {filteredUpazilas.map((upazila) => (
                                        <option key={upazila.id} value={upazila.name}>{upazila.name}</option>
                                    ))}
                                </select>
                                {errors.upazila && <p className="text-red-500 text-sm mt-1">{errors.upazila.message}</p>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">City</label>
                                <input {...register("city")} placeholder="City" className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all" />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Postal Code <span className="text-red-500">*</span></label>
                                <input
                                    {...register("postalCode", {
                                        required: "Postal code is required",
                                        pattern: { value: /^\d{4}$/, message: "Must be 4 digits" }
                                    })}
                                    placeholder="1230"
                                    maxLength="4"
                                    className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all"
                                />
                                {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Street Address <span className="text-red-500">*</span></label>
                            <textarea
                                {...register("address", {
                                    required: "Address is required",
                                    minLength: { value: 10, message: "At least 10 characters" }
                                })}
                                placeholder="House No, Road No, Area"
                                className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all h-24"
                                rows={3}
                            />
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Address Type</label>
                            <select {...register("type")} className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all">
                                <option value="Home">Home</option>
                                <option value="Office">Office</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {user && customerId && (
                            <div className="flex items-center">
                                <input type="checkbox" {...register("isDefault")} className="h-4 w-4 text-secound rounded" defaultChecked={addresses.length === 0} />
                                <label className="ml-2 text-gray-700">Set as default shipping address</label>
                            </div>
                        )}
                    </div>

                    {/* Shipping and Payment Options in Form */}
                    {renderShippingAndPayment()}

                    {/* Submit Button - Moved to OrderSummary section */}
                    {/*
                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-secound text-white diva-rounded font-bold hover:bg-secound-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? "Processing..." : user ? "Place Order" : "Continue to Payment"}
                        </button>
                    </div>
                    */}
                </form>
            )}

            {/* Modals */}
            <AddressAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddressAdded}
                customerId={customerId}
            />

            {/* Payment Method Modal */}
            <PaymentMethodModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setTempCheckoutData(null);
                }}
                onSelectPayment={handlePaymentSelect}
                totalAmount={totalAmount}
            />

            {/* Modal for existing address showing */}
            {showAllAddresses && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <h2 className="text-2xl font-bold text-gray-800">Select Shipping Address</h2>
                                <button onClick={() => setShowAllAddresses(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((address) => {
                                    const isSelected = selectedAddress === address.id;
                                    return (
                                        <div
                                            key={address.id}
                                            className={`relative bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${isSelected ? 'border-secound shadow-lg' : 'border-gray-200 hover:border-secound/40'}`}
                                            onClick={() => handleAddressSelect(address)}
                                        >
                                            {address.isDefault && (
                                                <div className="absolute -top-2 left-4 px-3 py-1 bg-gradient-to-r from-secound to-secound-hover text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5">
                                                    <Star className="w-3 h-3 fill-current" /> DEFAULT
                                                </div>
                                            )}
                                            <div className="p-5 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    {getIcon(address.type)}
                                                    <span className="font-bold text-gray-900">{address.type}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{address.recipientName}</p>
                                                    <p className="text-gray-700">📞 {address.phoneNumber}</p>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <p>{address.address}</p>
                                                    <p>{address.upazila}, {address.district}</p>
                                                    <p>{address.division} - {address.postalCode}</p>
                                                    <p className="font-semibold">{address.country}</p>
                                                </div>
                                                <div className="flex items-center justify-center pt-2">
                                                    <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${isSelected ? 'border-secound bg-secound' : 'border-stone-300'}`}>
                                                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setShowAllAddresses(false)}
                                    disabled={!selectedAddress}
                                    className="flex-1 py-3 bg-secound text-white diva-rounded font-bold hover:bg-secound-hover transition-colors disabled:opacity-50"
                                >
                                    Use Selected Address
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingDetails;
