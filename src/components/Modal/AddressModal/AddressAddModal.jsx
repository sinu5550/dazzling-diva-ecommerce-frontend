'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Building, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/apiClient';
import Swal from 'sweetalert2';
import { divisions, districts, upazilas } from "@/lib/data";
import { useUser } from "@/hooks/useUser";

const AddressAddModal = ({ isOpen, onClose, onSuccess, customerId }) => {
    const { user } = useUser();

    const [formData, setFormData] = useState({
        recipientName: '',
        phoneNumber: '',
        address: '',
        upazila: '',
        postalCode: '',
        district: '',
        division: '',
        city: '',
        country: 'Bangladesh',
        type: 'Home',
        isDefault: false
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);

    // Filter districts based on selected division
    useEffect(() => {
        if (formData.division) {
            const divisionData = divisions.find((div) => div.name === formData.division);
            if (divisionData) {
                const districtList = districts.filter(
                    (dist) => dist.division_id === divisionData.id
                );
                setFilteredDistricts(districtList);

                // Auto-set city to division name
                setFormData(prev => ({
                    ...prev,
                    city: formData.division,
                    district: '',
                    upazila: ''
                }));
            }
            setFilteredUpazilas([]);
        }
    }, [formData.division]);

    // Filter upazilas based on selected district
    useEffect(() => {
        if (formData.district) {
            const districtData = districts.find((dist) => dist.name === formData.district);
            if (districtData) {
                const upazilaList = upazilas.filter(
                    (upazila) => upazila.district_id === districtData.id
                );
                setFilteredUpazilas(upazilaList);
            }
            setFormData(prev => ({
                ...prev,
                upazila: ''
            }));
        }
    }, [formData.district]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.recipientName?.trim()) {
            newErrors.recipientName = 'Recipient name is required';
        } else if (formData.recipientName.trim().length < 2) {
            newErrors.recipientName = 'Recipient name must be at least 2 characters';
        }

        if (!formData.phoneNumber?.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^(?:\+88|01)?\d{9,11}$/.test(formData.phoneNumber.trim().replace(/\s+/g, ''))) {
            newErrors.phoneNumber = 'Invalid Bangladeshi phone number format';
        }

        if (!formData.address.trim()) newErrors.address = 'Full address is required';
        if (!formData.division) newErrors.division = 'Division is required';
        if (!formData.district) newErrors.district = 'District is required';
        if (!formData.upazila) newErrors.upazila = 'Upazila/Thana is required';
        if (!formData.postalCode.trim()) {
            newErrors.postalCode = 'Postal code is required';
        } else if (!/^\d{4}$/.test(formData.postalCode)) {
            newErrors.postalCode = 'Must be 4 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!customerId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Customer ID not found. Please refresh the page.',
                confirmButtonColor: '#5A0C3D'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const addressData = {
                recipientName: formData.recipientName.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                address: formData.address.trim(),
                upazila: formData.upazila,
                postalCode: formData.postalCode.trim(),
                district: formData.district,
                division: formData.division,
                city: formData.city.trim() || formData.division,
                country: formData.country,
                type: formData.type,
                isDefault: formData.isDefault
            };

            const addResult = await apiClient(`/api/customer/${customerId}/addresses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(addressData),
            });

            if (addResult && (addResult.success || addResult.message === 'Address added successfully' || addResult.data)) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Address added successfully',
                    confirmButtonColor: '#5A0C3D',
                    timer: 1500,
                    showConfirmButton: false
                });

                if (onSuccess) {
                    onSuccess();
                }

                resetForm();
                onClose();
            } else {
                throw new Error(addResult?.message || 'Failed to add address');
            }
        } catch (error) {
            console.error('Add address error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to add address',
                confirmButtonColor: '#5A0C3D'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            recipientName: '',
            phoneNumber: '',
            address: '',
            upazila: '',
            postalCode: '',
            district: '',
            division: '',
            city: '',
            country: 'Bangladesh',
            type: 'Home',
            isDefault: false
        });
        setErrors({});
        setFilteredDistricts([]);
        setFilteredUpazilas([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', duration: 0.4 }}
                    className="relative bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100 z-10 font-outfit flex flex-col"
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="absolute top-5 right-5 text-gray-400 hover:text-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all cursor-pointer z-20"
                    >
                        <X size={18} />
                    </button>

                    {/* Scrollable Container */}
                    <div className="overflow-y-auto max-h-[90vh] p-6 md:p-8">
                        {/* Header */}
                        <div className="mb-6 pb-4 border-b border-gray-100">
                        <span className="text-[10px] uppercase tracking-widest text-[#5A0C3D] font-bold opacity-90">
                            Shipping Details
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mt-0.5">
                            Add New Address
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-1 font-light">
                            Enter recipient details and delivery location
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* User Account Info Banner */}
                        {user?.email && (
                            <div className="p-3 bg-[#5A0C3D]/5 rounded-xl border border-[#5A0C3D]/15 flex items-center gap-2.5 text-xs md:text-sm text-[#5A0C3D] font-medium">
                                <User className="w-4 h-4 text-[#5A0C3D] flex-shrink-0" />
                                <span>Adding shipping address for: <strong>{user.email}</strong></span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Recipient Name */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                                    Recipient Name <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        name="recipientName"
                                        value={formData.recipientName}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#5A0C3D] focus:ring-2 focus:ring-[#5A0C3D]/15 transition-all"
                                        placeholder="Full name of recipient"
                                    />
                                </div>
                                {errors.recipientName && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.recipientName}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                                    Phone Number <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Phone size={16} />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#5A0C3D] focus:ring-2 focus:ring-[#5A0C3D]/15 transition-all"
                                        placeholder="01XXXXXXXXX"
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.phoneNumber}</p>
                                )}
                            </div>

                            {/* Division */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                                    Division <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="division"
                                    value={formData.division}
                                    onChange={(e) => handleSelectChange('division', e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#5A0C3D] focus:ring-2 focus:ring-[#5A0C3D]/15 transition-all cursor-pointer"
                                >
                                    <option value="">Select Division</option>
                                    {divisions.map((division) => (
                                        <option key={division.id} value={division.name}>
                                            {division.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.division && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.division}</p>
                                )}
                            </div>

                            {/* District */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                                    District <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="district"
                                    value={formData.district}
                                    onChange={(e) => handleSelectChange('district', e.target.value)}
                                    disabled={!formData.division || isSubmitting}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#5A0C3D] focus:ring-2 focus:ring-[#5A0C3D]/15 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">
                                        {formData.division ? "Select District" : "Select Division First"}
                                    </option>
                                    {filteredDistricts.map((district) => (
                                        <option key={district.id} value={district.name}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.district && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.district}</p>
                                )}
                            </div>

                            {/* Upazila */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                                    Upazila/Thana <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="upazila"
                                    value={formData.upazila}
                                    onChange={(e) => handleSelectChange('upazila', e.target.value)}
                                    disabled={!formData.district || isSubmitting}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#5A0C3D] focus:ring-2 focus:ring-[#5A0C3D]/15 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">
                                        {formData.district ? "Select Upazila" : "Select District First"}
                                    </option>
                                    {filteredUpazilas.map((upazila) => (
                                        <option key={upazila.id} value={upazila.name}>
                                            {upazila.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.upazila && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.upazila}</p>
                                )}
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#5A0C3D] focus:ring-2 focus:ring-[#5A0C3D]/15 transition-all"
                                    placeholder="City name"
                                />
                            </div>

                            {/* Postal Code */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                                    Postal Code <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#5A0C3D] focus:ring-2 focus:ring-[#5A0C3D]/15 transition-all"
                                    placeholder="1216"
                                    maxLength="4"
                                />
                                {errors.postalCode && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.postalCode}</p>
                                )}
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    readOnly
                                    className="w-full px-3.5 py-2.5 bg-gray-100/70 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                                />
                            </div>

                            {/* Address */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                                    Full Address <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    disabled={isSubmitting}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#5A0C3D] focus:ring-2 focus:ring-[#5A0C3D]/15 transition-all"
                                    placeholder="House No, Road No, Area, Apartment Details"
                                />
                                {errors.address && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.address}</p>
                                )}
                            </div>

                            {/* Address Type */}
                            <div className="col-span-1 md:col-span-2 mt-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                                    Address Type
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'Home', label: 'Home', icon: Home },
                                        { value: 'Office', label: 'Office', icon: Building },
                                        { value: 'Other', label: 'Other', icon: MapPin }
                                    ].map(({ value, label, icon: Icon }) => {
                                        const isSelected = formData.type === value;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => handleSelectChange('type', value)}
                                                disabled={isSubmitting}
                                                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-[#5A0C3D] bg-[#5A0C3D]/5 text-[#5A0C3D] font-bold shadow-sm'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Icon size={16} className={isSelected ? 'text-[#5A0C3D]' : 'text-gray-400'} />
                                                <span className="text-xs md:text-sm font-outfit">{label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Set as Default */}
                            <div className="col-span-1 md:col-span-2 pt-1">
                                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={formData.isDefault}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-4 h-4 rounded text-[#5A0C3D] focus:ring-[#5A0C3D] border-gray-300 transition-colors cursor-pointer"
                                    />
                                    <span className="text-xs md:text-sm text-gray-700 font-medium font-outfit">
                                        Set as default shipping address
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-semibold text-xs md:text-sm hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 font-outfit"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !customerId}
                                className="px-6 py-2.5 bg-[#5A0C3D] hover:bg-[#450322] text-white font-semibold text-xs md:text-sm rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer uppercase tracking-wider font-outfit"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Address'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddressAddModal;
