"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Briefcase,
  Edit,
  Plus,
  Check,
  Trash2,
  MapPin,
  Mail,
  Phone,
  Star,
  User,
  HomeIcon,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import Swal from "sweetalert2";
import AddressAddModal from "@/components/Modal/AddressModal/AddressAddModal";
import AddressEditModal from "@/components/Modal/AddressModal/AddressEditModal";
import { useUser } from "@/hooks/useUser";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

const AddressBookPage = () => {
  const { user, loading: userLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState(null);

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

        const result = await apiClient(
          `/api/customer/email/${encodeURIComponent(user.email)}`
        );

        let customerData = null;

        if (result && result.success !== undefined) {
          customerData = result.data;
        } else if (result && result.id) {
          customerData = result;
        } else if (result && result.customer) {
          customerData = result.customer;
        }

        if (customerData && customerData.id) {
          console.log("Customer found with ID:", customerData.id);
          setCustomerId(customerData.id);
          setAddresses(customerData.customerAddresses || []);
        } else {
          console.log("No customer data found in response");
          setCustomerId(null);
          setAddresses([]);
          setError("Customer profile not found");
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
        setError(error.message || "Failed to load customer data");
        setCustomerId(null);
        setAddresses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [user?.email]);

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
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const result = await Swal.fire({
      title: "Delete Address?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded",
        confirmButton: "hasib-rounded px-6 py-2.5",
        cancelButton: "hasib-rounded px-6 py-2.5",
      },
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await apiClient(
          `/api/customer/addresses/${addressId}`,
          {
            method: "DELETE",
          }
        );

        if (
          deleteResult &&
          (deleteResult.success ||
            deleteResult.message === "Address deleted successfully")
        ) {
          Swal.fire({
            icon: "success",
            title: "Deleted Successfully",
            text: "Address has been removed",
            confirmButtonColor: "#14b8a6",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "rounded",
            },
          });
          await fetchAddresses();
        } else {
          throw new Error(deleteResult?.message || "Failed to delete address");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.message || "Failed to delete address",
          confirmButtonColor: "#14b8a6",
          customClass: {
            popup: "rounded",
          },
        });
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const address = addresses.find((addr) => addr.id === addressId);
      if (!address) {
        throw new Error("Address not found");
      }

      const result = await apiClient(`/api/customer/addresses/${addressId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...address,
          isDefault: true,
        }),
      });

      if (
        result &&
        (result.success || result.message === "Address updated successfully")
      ) {
        Swal.fire({
          icon: "success",
          title: "Default Address Updated",
          confirmButtonColor: "#14b8a6",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded",
          },
        });
        await fetchAddresses();
      } else {
        throw new Error(result?.message || "Failed to set default address");
      }
    } catch (error) {
      console.error("Set default error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to set default address",
        confirmButtonColor: "#14b8a6",
        customClass: {
          popup: "rounded",
        },
      });
    }
  };

  const openEditModal = (address) => {
    setSelectedAddress(address);
    setShowEditModal(true);
  };

  const getIcon = (type) => {
    switch (type) {
      case "Home":
        return <Home className="w-5 h-5" />;
      case "Office":
        return <Briefcase className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Home":
        return {
          bg: "bg-gradient-to-br from-blue-50 to-blue-100",
          text: "text-blue-700",
          border: "border-blue-200",
        };
      case "Office":
        return {
          bg: "bg-gradient-to-br from-purple-50 to-purple-100",
          text: "text-purple-700",
          border: "border-purple-200",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-gray-50 to-gray-100",
          text: "text-gray-700",
          border: "border-gray-200",
        };
    }
  };

  if (userLoading || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className=" bg-stone-50 py-8 hasib-rounded">
      <div className="max-w-6xl mx-auto px-4 space-y-5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link
            href="/"
            className="hover:text-teal-600 flex items-center gap-1"
          >
            <HomeIcon className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/my-account" className="hover:text-teal-600">
            My Account
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>My Address</span>
        </div>
        {/* Header Section */}
        <div className="bg-white p-4 hasib-rounded shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-700 font-philosopher">
                Shipping Addresses
              </h1>
              <p className="text-gray-600 font-medium">
                Manage and organize your delivery locations
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="group flex items-center justify-center gap-3 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded shadow-md hover:shadow-lg transition-all duration-300 transform cursor-pointer w-full md:w-auto"
            >
              <div className="w-7 h-7 bg-white/20 hasib-rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-semibold">Add New Address</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          {addresses.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                <MapPin className="w-12 h-12 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Addresses Yet
              </h3>
              <p className="text-gray-500 mb-8 text-center max-w-md">
                Get started by adding your first shipping address for seamless
                deliveries
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Your First Address
              </button>
            </div>
          ) : (
            /* Address Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2  gap-6">
              {addresses.map((item) => {
                const typeColors = getTypeColor(item.type);

                return (
                  <div
                    key={item.id}
                    className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                      item.isDefault
                        ? "border-teal-400 shadow-lg shadow-teal-100/50"
                        : "border-gray-200 hover:border-teal-300"
                    }`}
                  >
                    {/* Default Badge */}
                    {item.isDefault && (
                      <div className="absolute -top-3 left-6 px-4 py-1.5 bg-gradient-to-r from-rose-500 to-rose-700 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        DEFAULT ADDRESS
                      </div>
                    )}

                    <div className="p-6 space-y-5">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`${typeColors.bg} w-12 h-12 hasib-rounded flex items-center justify-center shadow-sm border ${typeColors.border}`}
                          >
                            <span className={typeColors.text}>
                              {getIcon(item.type)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {item.type}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-semibold">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-amber-600 hover:bg-amber-50 hasib-rounded transition-colors border border-transparent hover:border-amber-200"
                            title="Edit Address"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 hasib-rounded transition-colors border border-transparent hover:border-red-200"
                            title="Delete Address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100"></div>

                      {/* Address Details */}
                      <div className="space-y-3">
                        {/* Recipient Name */}
                        {item.recipientName && (
                          <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-900 font-semibold">
                              {item.recipientName}
                            </p>
                          </div>
                        )}

                        {/* Phone Number */}
                        {item.phoneNumber && (
                          <div className="flex items-start gap-3">
                            <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 font-medium">
                              {item.phoneNumber}
                            </p>
                          </div>
                        )}

                        {/* Address */}
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700 font-medium leading-relaxed">
                            {item.address}
                          </p>
                        </div>

                        <div className="pl-7 space-y-1.5 text-sm text-gray-600">
                          <p className="font-medium">
                            {item.upazila}, {item.district}
                          </p>
                          <p>
                            {item.division} - {item.postalCode}
                          </p>
                          {item.city && (
                            <p className="text-gray-500">City: {item.city}</p>
                          )}
                          <p className="font-semibold text-gray-700 pt-1">
                            {item.country}
                          </p>
                        </div>
                      </div>

                      {/* Set Default Button */}
                      {!item.isDefault && (
                        <>
                          <div className="border-t border-gray-100"></div>
                          <button
                            onClick={() => handleSetDefault(item.id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-teal-50 hover:to-teal-100 text-gray-700 hover:text-teal-700 rounded border border-gray-200 hover:border-teal-300 transition-all duration-300 font-semibold group"
                          >
                            <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Set as Default
                          </button>
                        </>
                      )}
                    </div>

                    {/* Hover Effect Gradient */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/0 to-amber-500/0 group-hover:from-teal-500/5 group-hover:to-amber-500/5 transition-all duration-300 pointer-events-none"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modals */}
        <AddressAddModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchAddresses}
          customerId={customerId}
        />

        <AddressEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAddress(null);
          }}
          address={selectedAddress}
          onSuccess={fetchAddresses}
        />
      </div>
    </div>
  );
};

export default AddressBookPage;
