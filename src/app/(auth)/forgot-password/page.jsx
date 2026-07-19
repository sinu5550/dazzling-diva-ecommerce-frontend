'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { requestPasswordReset } from '@/lib/auth-helpers';
import Swal from 'sweetalert2';
import Link from 'next/link';

const ForgotPassword = () => {

    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const result = await requestPasswordReset(data.email);

            if (result.success) {
                // Store email for OTP verification
                sessionStorage.setItem('verificationEmail', data.email);
                sessionStorage.setItem('isPasswordReset', 'true');

                await Swal.fire({
                    icon: 'success',
                    title: 'Email Sent!',
                    text: 'Password reset code has been sent to your email.',
                    confirmButtonColor: '#14b8a6'
                });

                router.push('/verify-otp');
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: error.message || 'Failed to send reset code. Please try again.',
                confirmButtonColor: '#14b8a6'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className=" bg-teal-600/70 flex items-center justify-center px-4 py-20 lg:py-40"
            style={{
                backgroundImage: "url('https://res.cloudinary.com/dh34eqbhu/image/upload/v1781151577/cover24325_xrjcc3.svg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
            <div className="bg-white shadow-xl p-8 md:p-12 max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Enter your email address and we'll send you a code to reset your password
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                            placeholder="Enter your email"
                            disabled={isLoading}
                            className="w-full px-4 py-3  border border-stone-300 bg-stone-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium  transition duration-150 ease-in-out disabled:bg-primary/50 disabled:cursor-not-allowed uppercase cursor-pointer"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Remember your password?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
