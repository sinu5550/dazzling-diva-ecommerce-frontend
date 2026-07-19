'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm, Controller } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Eye, EyeOff } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from 'next/navigation';
import { login, loginWithMobile, socialAuth } from '@/lib/auth-helpers';
import { useUser } from '@/hooks/useUser';
import Swal from 'sweetalert2';

const Login = () => {
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    const { control, register, handleSubmit, formState: { errors }, reset } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState('email');

    useEffect(() => {
        if (!userLoading && user) {
            router.replace('/my-account');
        }
    }, [user, userLoading, router]);

    if (userLoading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5A0C3D]"></div>
            </div>
        );
    }

    // Handle login method toggle
    const handleLoginMethodChange = (method) => {
        setLoginMethod(method);
        reset(); // Reset form when switching methods
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            let result;

            // Login based on selected method
            if (loginMethod === 'email') {
                console.log('🔐 Logging in with email:', data.email);
                result = await login(data.email, data.password);
            } else {
                console.log('🔐 Logging in with mobile:', data.mobile);
                result = await loginWithMobile(data.mobile, data.password);
            }

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Welcome Back!',
                    text: 'Login successful!',
                    timer: 1500,
                    showConfirmButton: false
                });

                // Redirect to account/dashboard
                router.push('/checkout');
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.message || 'Invalid credentials. Please try again.',
                confirmButtonColor: '#14b8a6'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            await socialAuth(provider);
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Social login failed. Please try again.',
                confirmButtonColor: '#14b8a6'
            });
        }
    };

    return (
        <div className="min-h-[calc(100vh-160px)] bg-gray-50/50 flex flex-col justify-start md:justify-center py-8 md:py-16 px-4 sm:px-6 lg:px-8 font-outfit">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-extrabold text-gray-900 font-outfit">
                    Welcome Back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in to your account to continue shopping
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-sm border border-gray-100 rounded-xl sm:px-10">
                    
                    {/* Login Method Toggle */}
                    <div className="flex gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => handleLoginMethodChange('email')}
                            disabled={isLoading}
                            className={`flex-1 py-2 px-4 rounded-[6px] text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                                loginMethod === 'email'
                                    ? 'bg-[#5A0C3D] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } disabled:opacity-50`}
                        >
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLoginMethodChange('phone')}
                            disabled={isLoading}
                            className={`flex-1 py-2 px-4 rounded-[6px] text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                                loginMethod === 'phone'
                                    ? 'bg-[#5A0C3D] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } disabled:opacity-50`}
                        >
                            Phone
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Phone or Email Input - Conditional */}
                        {loginMethod === 'phone' ? (
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Phone Number
                                </label>
                                <Controller
                                    name="mobile"
                                    control={control}
                                    rules={{
                                        required: "Mobile number is required",
                                        minLength: { value: 10, message: "Number too short" }
                                    }}
                                    render={({ field }) => (
                                        <PhoneInput
                                            {...field}
                                            country={'bd'}
                                            enableSearch={true}
                                            inputClass="!w-full !py-5 !bg-gray-50/50 !border-gray-200 !rounded-[6px] !pl-12 !text-sm !text-gray-900 focus:!border-[#5A0C3D] focus:!ring-[#5A0C3D]"
                                            buttonClass="!bg-transparent !border-r-0 !border-gray-200 !rounded-l-[6px]"
                                            dropdownClass="!text-gray-900"
                                            searchClass="!text-gray-900"
                                            disabled={isLoading}
                                        />
                                    )}
                                />
                                {errors.mobile && (
                                    <p className="mt-2 text-xs text-red-600">{errors.mobile.message}</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Email Address
                                </label>
                                <input
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    type="email"
                                    placeholder="yourname@example.com"
                                    disabled={isLoading}
                                    className="block w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-[6px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5A0C3D] focus:border-[#5A0C3D] transition-colors"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>
                                )}
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-xs font-medium text-[#5A0C3D] hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Password must have at least 6 characters" }
                                    })}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="block w-full pl-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-[6px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5A0C3D] focus:border-[#5A0C3D] transition-colors"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-xs text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-[6px] text-white bg-[#5A0C3D] hover:bg-[#450322] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A0C3D] transition duration-150 ease-in-out uppercase cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 border-t border-gray-100 pt-6 text-center">
                        <p className="text-sm text-gray-600">
                            New customer?{' '}
                            <Link href="/sign-up" className="font-semibold text-[#5A0C3D] hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;