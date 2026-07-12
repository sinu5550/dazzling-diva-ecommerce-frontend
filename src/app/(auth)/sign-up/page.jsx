'use client';

import Image from "next/image";
import logo from '../../../../public/assects/signUp.png';
import Link from "next/link";
import { useState } from "react";
import { useForm, Controller } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-helpers.js';
import Swal from 'sweetalert2';
import { apiClient } from "@/lib/apiClient";
import toast from "react-hot-toast";

const SignUp = () => {

    const router = useRouter();
    const { control, register, handleSubmit, formState: { errors }, reset } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    // Function to create customer in database
    const createCustomerInDatabase = async (userData, authUserId) => {
        try {

            const formattedPhone = userData.phone.replace(/\D/g, '');

            // Format data for API
            const customerData = {
                fullName: userData.fullName,
                email: userData.email,
                phone: formattedPhone,
                status: true,
                authUserId: authUserId || null
            };

            const response = await apiClient("/api/customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customerData),
            });

            if (response.success) {
                toast.success(response.message || "Customer added successfully!");
                reset();
            } else {
                throw new Error(response.message || "Failed to add customer");
            }
        } catch (error) {
            console.error("Error adding customer:", error);
            toast.error(error.message || "Failed to add customer");
        }
    };


    // Main onSubmit function
    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Step 1: Create auth account in Supabase
            const authResult = await signUp(
                data.email,
                data.password,
                data.phone,
                data.fullName
            );

            if (authResult.success) {
                // Step 2: Create customer in your database
                try {
                    await createCustomerInDatabase(data, authResult.data?.user?.id);

                    // Store email for verification
                    sessionStorage.setItem('verificationEmail', data.email);
                    sessionStorage.setItem('isPasswordReset', 'false');

                    // Success message
                    await Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Account created! Please check email for verification code.',
                        confirmButtonColor: '#14b8a6',
                        showConfirmButton: true
                    });

                    // Redirect to OTP verification
                    router.push('/verify-otp');

                } catch (dbError) {
                    // If database fails but auth succeeded, show specific error
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Partial Success',
                        html: `
                            <div class="text-left">
                                <p>Authentication successful but profile creation failed.</p>
                                <p class="text-sm mt-2">Please verify your email first, then contact support to complete your profile.</p>
                            </div>
                        `,
                        confirmButtonColor: '#14b8a6'
                    });

                    // Still allow verification
                    sessionStorage.setItem('verificationEmail', data.email);
                    sessionStorage.setItem('isPasswordReset', 'false');
                    router.push('/verify-otp');
                }
            }
        } catch (error) {
            // Handle auth errors
            let errorMessage = error.message || 'Failed to create account';

            if (errorMessage.includes('already registered')) {
                errorMessage = 'This email is already registered. Please login instead.';
            }

            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMessage,
                confirmButtonColor: '#14b8a6',
                footer: errorMessage.includes('already registered')
                    ? '<a href="/login" style="color: #14b8a6">Go to Login</a>'
                    : ''
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="w-full text-center py-10 lg:py-20 px-4 flex items-center justify-center relative max-h-screen"
            style={{
                backgroundImage: "url('https://res.cloudinary.com/dh34eqbhu/image/upload/v1781151577/cover24325_xrjcc3.svg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay background color */}
            <div className="absolute inset-0 bg-black/60"></div>

            {/* Content wrapper */}
            <div className="relative w-full max-w-4xl mx-auto text-gray-900 font-poppins z-10">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-12">
                    Create Your Account
                </h1>

                <div className="flex flex-col lg:flex-row overflow-hidden shadow-2xl">
                    {/* Left Section - Welcome & Info */}
                    <div className="bg-secound/95 p-5 md:p-8 lg:w-1/2 flex flex-col justify-center">
                        <h4 className="text-lg md:text-2xl font-semibold mb-2 text-white">
                            Welcome to Dazzling Diva!
                        </h4>
                        <p className="text-gray-200 mb-6">
                            Already have an account? Sign in to enjoy faster checkout, track orders, and more!
                        </p>
                        
                        <div className="mt-4 mb-6">
                            <Image
                                src={logo}
                                alt="Illustration"
                                width={300}
                                height={250}
                                className="w-full max-w-sm mx-auto opacity-90"
                                priority
                            />
                        </div>
                        
                        <Link
                            href="/login"
                            className="mt-4 mx-10 bg-white text-primary font-semibold py-2 md:py-3 px-4 hover:bg-gray-100 transition duration-150 ease-in-out uppercase cursor-pointer text-center"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Right Section - Form */}
                    <div className="bg-white p-5 md:px-8 md:py-14 lg:w-1/2">
                        <h4 className="text-lg font-medium mb-2">
                            Join Dazzling Diva Today
                        </h4>
                        <p className="text-gray-700 mb-6 text-xs">
                            Please provide your details to get started
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6 mx-7">
                            {/* Full Name */}
                            <div>
                                <input
                                    {...register("fullName", {
                                        required: "Full name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Name must be at least 2 characters"
                                        }
                                    })}
                                    type="text"
                                    placeholder="Full Name"
                                    disabled={isLoading}
                                    className="block w-full pl-3 pr-10 py-2 md:py-3 bg-gray-50/70  border border-stone-300 leading-5 placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                                {errors.fullName && (
                                    <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>
                                )}
                            </div>

                            {/* Phone Input */}
                            <div>
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{
                                        required: "Phone number is required"
                                    }}
                                    render={({ field }) => (
                                        <PhoneInput
                                            {...field}
                                            country={'bd'}
                                            enableSearch={true}
                                            inputClass="!w-full !py-4 md:!py-5 !bg-white !pl-12 !text-sm !"
                                            buttonClass="!"
                                            disabled={isLoading}
                                        />
                                    )}
                                />
                                {errors.phone && (
                                    <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Email Input */}
                            <div>
                                <input
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    type="email"
                                    placeholder="Email Address"
                                    disabled={isLoading}
                                    className="block w-full pl-3 pr-10 py-2 md:py-3 bg-gray-50/70  border border-stone-300 leading-5 placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <div className="relative ">
                                    <input
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must have at least 6 characters"
                                            }
                                        })}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        disabled={isLoading}
                                        className="block w-full pl-3 pr-10 py-2 md:py-3 bg-gray-50/70  border border-stone-300 leading-5 placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-secound"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500 text-left">
                                    Must be at least 6 characters
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative w-full flex justify-center py-2 md:py-3 px-4 border border-transparent text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out uppercase cursor-pointer disabled:bg-primary/50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;