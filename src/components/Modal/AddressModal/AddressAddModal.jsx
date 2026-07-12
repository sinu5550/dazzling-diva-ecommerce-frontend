'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import Swal from 'sweetalert2';
import { divisions, districts, upazilas } from "@/lib/data";
import { useUser } from "@/hooks/useUser";

const AddressAddModal = ({ isOpen, onClose, onSuccess, customerId }) => {
    const { user, loading } = useUser();

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

        // Clear error for this field
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

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate new fields
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

        // Validate existing fields
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.division) newErrors.division = 'Division is required';
        if (!formData.district) newErrors.district = 'District is required';
        if (!formData.upazila) newErrors.upazila = 'Upazila is required';
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

        // Check if customerId is provided
        if (!customerId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Customer ID not found. Please refresh the page.',
                confirmButtonColor: '#14b8a6'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare address data
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

            console.log('Submitting address data:', addressData);
            console.log('Customer ID:', customerId);

            // Add address to the customer
            const addResult = await apiClient(`/api/customer/${customerId}/addresses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(addressData),
            });

            console.log('Add address result:', addResult);

            // Handle different response formats
            if (addResult && (addResult.success || addResult.message === 'Address added successfully')) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Address added successfully',
                    confirmButtonColor: '#14b8a6',
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
                confirmButtonColor: '#14b8a6'
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 font-philosopher">Add New Address</h2>
                            <p className="text-gray-500 text-sm mt-1">Add a new shipping address for deliveries</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={isSubmitting}
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* User Info */}
                        {user && user.email && (
                            <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-100">
                                <p className="text-sm text-purple-700 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Adding address for: <strong>{user.email}</strong>
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Recipient Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recipient Name <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="recipientName"
                                        value={formData.recipientName}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-10 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
                                        placeholder="Full name of recipient"
                                    />
                                </div>
                                {errors.recipientName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-10 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                                )}

                            </div>

                            {/* Division */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Division <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="division"
                                    value={formData.division}
                                    onChange={(e) => handleSelectChange('division', e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
                                >
                                    <option value="">Select Division</option>
                                    {divisions.map((division) => (
                                        <option key={division.id} value={division.name}>
                                            {division.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.division && (
                                    <p className="mt-1 text-sm text-red-600">{errors.division}</p>
                                )}
                            </div>

                            {/* District */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    District <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="district"
                                    value={formData.district}
                                    onChange={(e) => handleSelectChange('district', e.target.value)}
                                    disabled={!formData.division || isSubmitting}
                                    className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
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
                                    <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                                )}
                            </div>

                            {/* Upazila */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upazila/Thana <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="upazila"
                                    value={formData.upazila}
                                    onChange={(e) => handleSelectChange('upazila', e.target.value)}
                                    disabled={!formData.district || isSubmitting}
                                    className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
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
                                    <p className="mt-1 text-sm text-red-600">{errors.upazila}</p>
                                )}
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
                                    placeholder="Enter city name"
                                />
                            </div>

                            {/* Postal Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Postal Code <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
                                    placeholder="1216"
                                    maxLength="4"
                                />
                                {errors.postalCode && (
                                    <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                                )}
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    readOnly
                                    className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
                                />
                            </div>

                            {/* Address */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Address <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    disabled={isSubmitting}
                                    className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
                                    placeholder="House no, Road no, Area, Building name"
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                )}
                            </div>

                            {/* Address Type */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Address Type <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    {[
                                        { value: 'Home', label: 'Home', icon: '🏠' },
                                        { value: 'Office', label: 'Office', icon: '🏢' },
                                        { value: 'Other', label: 'Other', icon: '📍' }
                                    ].map(({ value, label, icon }) => (
                                        <label
                                            key={value}
                                            className={`cursor-pointer border rounded-full p-1 pl-3 transition-all duration-200 ${formData.type === value ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="type"
                                                value={value}
                                                checked={formData.type === value}
                                                onChange={handleInputChange}
                                                disabled={isSubmitting}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center gap-5">
                                                <span className="text-2xl">{icon}</span>
                                                <span className="block font-medium text-gray-800">{label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Set as Default */}
                            <div className="col-span-2 mt-3">
                                <label className={`inline-flex items-center transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={formData.isDefault}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-stone-300"
                                    />
                                    <span className="ml-3 text-gray-700 font-medium italic">
                                        Set as default shipping address
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-5">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 border border-stone-300 rounded text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !customerId}
                                className="px-8 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded hover:from-teal-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Address'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddressAddModal;