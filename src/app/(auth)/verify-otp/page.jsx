'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyOtp } from '@/lib/auth-helpers';
import Swal from 'sweetalert2';

const VerifyOtp = () => {
    const router = useRouter();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [isPasswordReset, setIsPasswordReset] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        // Get email from session storage
        const storedEmail = sessionStorage.getItem('verificationEmail');
        const resetFlag = sessionStorage.getItem('isPasswordReset') === 'true';

        if (!storedEmail) {
            router.push('/sign-up');
            return;
        }

        setEmail(storedEmail);
        setIsPasswordReset(resetFlag);
    }, [router]);

    useEffect(() => {
        // Countdown timer
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input - changed from 7 to 5 for 6-digit OTP
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        // Changed from 8 to 6
        if (otpCode.length !== 6) {
            await Swal.fire({
                icon: 'error',
                title: 'Invalid OTP',
                text: 'Please enter all 6 digits',
                confirmButtonColor: '#14b8a6'
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await verifyOtp(email, otpCode, isPasswordReset);

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Verified!',
                    text: isPasswordReset
                        ? 'Email verified! You can now reset your password.'
                        : 'Email verified successfully!',
                    timer: 1500,
                    showConfirmButton: false
                });

                // Clear session storage
                sessionStorage.removeItem('verificationEmail');
                sessionStorage.removeItem('isPasswordReset');

                // Redirect
                if (isPasswordReset) {
                    router.push('/reset-password');
                } else {
                    router.push('/my-account');
                }
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Verification Failed',
                text: error.message || 'Invalid OTP. Please try again.',
                confirmButtonColor: '#14b8a6'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        try {
            // Call your resend OTP API here
            await Swal.fire({
                icon: 'success',
                title: 'Code Resent!',
                text: 'A new verification code has been sent to your email.',
                timer: 1500,
                showConfirmButton: false
            });

            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']); // Reset to 6 empty strings
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: 'Failed to resend code. Please try again.',
                confirmButtonColor: '#14b8a6'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-teal-600/70 flex items-center justify-center  px-4 py-20 lg:py-32"
            style={{
                backgroundImage: "url('https://res.cloudinary.com/du04p5ikw/image/upload/v1758617485/4352509_845_2_bb6o5z.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-philosopher">
                        Verify Your Email
                    </h1>
                    <p className="text-gray-600 text-sm">
                        We've sent a 6-digit verification code to {/* Updated message */}
                    </p>
                    <p className="text-teal-600 font-medium mt-1">{email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* OTP Input Fields - Now 6 digits */}
                    <div className="flex justify-center space-x-2 md:space-x-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading}
                                className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border border-stone-300 diva-rounded focus:border-teal-500 focus:outline-none transition disabled:bg-gray-100 text-gray-700"
                            />
                        ))}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-700 text-white font-medium rounded transition duration-150 ease-in-out disabled:bg-teal-300 disabled:cursor-not-allowed uppercase cursor-pointer"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    {/* Resend Code */}
                    <div className="text-center">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isLoading}
                                className="text-teal-600 hover:text-teal-700 font-medium text-sm disabled:text-gray-400"
                            >
                                Resend Code
                            </button>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                Resend code in {timer}s
                            </p>
                        )}
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Wrong email?{' '}
                        <button
                            onClick={() => router.push('/sign-up')}
                            className="text-teal-600 hover:underline font-medium"
                        >
                            Go back
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
