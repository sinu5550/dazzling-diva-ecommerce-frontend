'use client';

import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ChevronRight, Home, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { updatePassword } from "@/lib/auth-helpers";

const MyAccount = () => {
  return (
    <ProtectedRoute redirectTo="/login" loadingComponent={<LoadingSpinner />}>
      {(user) => <AccountContent user={user} />}
    </ProtectedRoute>
  );
};

// Separate component for the actual content
const AccountContent = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }

    setIsLoading(true);

    try {
      // Call the updatePassword function from auth-helpers
      const result = await updatePassword(newPassword, currentPassword);

      if (result.success) {
        toast.success("Password updated successfully!");

        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow p-6 text-gray-800">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
          <Home className="w-4 h-4" />
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span>My Account</span>
      </div>

      {/* Header */}
      <div className="flex justify-between gap-5">
        <h1 className="text-2xl md:text-3xl font-bold font-philosopher text-gray-800">
          My Account
        </h1>
        <div className="">
          {user?.email_confirmed_at ? (
            <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-50 border border-green-500 rounded-full">
              ✓ Verified
            </span>
          ) : (
            <span className="text-orange-600 text-xs font-medium px-2 py-1 bg-orange-50 border border-orange-500 rounded-full">
              ⚠ Not Verified
            </span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-10">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-6">
              Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Full Name
                </label>
                <div className="p-3 bg-gray-50 rounded text-gray-900 font-medium">
                  {user?.user_metadata?.full_name || "Not provided"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Contact Number
                </label>
                <div className="p-3 bg-gray-50 rounded text-gray-500">
                  {user?.user_metadata?.phone || user?.phone || "N/A"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email
                </label>
                <div className="p-3 bg-gray-50 rounded text-gray-900 font-medium">
                  {user?.email || "N/A"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Account Created
                </label>
                <div className="p-3 bg-gray-50 rounded text-gray-500">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Last Sign In
                </label>
                <div className="p-3 bg-gray-50 rounded text-gray-500">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change My Password
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter current password"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 p-3 hasib-rounded text-xs text-gray-600">
                <p className="font-medium mb-1">Password must contain:</p>
                <ul className="space-y-1">
                  <li>• At least 6 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One lowercase letter</li>
                  <li>• One number</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-600 text-white font-semibold rounded hover:bg-teal-700 transition-colors duration-200 disabled:bg-teal-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;