'use client';

import Link from "next/link";
import { useState } from "react";
import { useForm, Controller } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Eye, EyeOff } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from 'next/navigation';
import { login, loginWithMobile, socialAuth } from '@/lib/auth-helpers';
import Swal from 'sweetalert2';

const Login = () => {

    const router = useRouter();
    const { control, register, handleSubmit, formState: { errors }, reset } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState('email');

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
        <div
            className="w-full text-center py-10 md:py-20 px-4 flex items-center justify-center relative max-h-screen"
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
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold  text-white mb-12">
                    Welcome To Dazzling Diva, Please Sign in!
                </h1>

                <div className="flex flex-col lg:flex-row overflow-hidden">
                    {/* Login Form Section */}
                    <div className="bg-white p-5 md:px-8 md:py-14 lg:w-1/2">
                        <h4 className="text-lg font-medium mb-2">
                            I Am Already a Registered Dazzling Diva User
                        </h4>
                        <p className="text-gray-700 mb-6 text-xs">
                            Enter your {loginMethod === 'email' ? 'email' : 'mobile number'} and password to sign in
                        </p>

                        {/* Login Method Toggle */}
                        <div className="flex gap-10 mb-6 mx-7">
                            <button
                                type="button"
                                onClick={() => handleLoginMethodChange('email')}
                                disabled={isLoading}
                                className={`flex-1 py-2 px-4  text-sm font-medium transition-all ${loginMethod === 'email'
                                    ? 'border border-primary text-primary bg-primary/10 hover:bg-primary hover:text-white'
                                    : 'border border-gray-300 text-gray-600 bg-transparent hover:bg-primary hover:text-white hover:border-primary'
                                    } disabled:opacity-50`}
                            >
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => handleLoginMethodChange('phone')}
                                disabled={isLoading}
                                className={`flex-1 py-2 px-4  text-sm font-medium transition-all ${loginMethod === 'phone'
                                    ? 'border border-primary text-primary bg-primary/10 hover:bg-primary hover:text-white'
                                    : 'border border-gray-300 text-gray-600 bg-transparent hover:bg-primary hover:text-white hover:border-primary'
                                    } disabled:opacity-50`}
                            >
                                Phone
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6 mx-7">
                            {/* Phone or Email Input - Conditional */}
                            {loginMethod === 'phone' ? (
                                // Phone Input
                                <div>
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
                                                inputClass="!w-full !py-4 md:!py-5 ! !bg-white !pl-12 !text-sm"
                                                buttonClass="!"
                                                disabled={isLoading}
                                            />
                                        )}
                                    />
                                    {errors.mobile && (
                                        <p className="mt-2 text-sm text-red-600">{errors.mobile.message}</p>
                                    )}
                                </div>
                            ) : (
                                // Email Input
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
                                        className="block w-full pl-3 pr-10 py-2 md:py-3 bg-gray-50/70  border border-stone-300 leading-5 placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>
                            )}

                            {/* Password */}
                            <div>
                                <div className="relative ">
                                    <input
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: { value: 6, message: "Password must have at least 6 characters" }
                                        })}
                                        type={showPassword ? "text" : "password"}
                                        className="block w-full pl-3 pr-10 py-2 md:py-3 bg-gray-50/70  border border-stone-300 leading-5 placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="Enter password"
                                        disabled={isLoading}
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
                            </div>

                            <div className="flex items-center justify-end">
                                <Link href="/forgot-password" className="text-xs text-secound hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative w-full flex justify-center py-2 md:py-3 px-4 border border-transparent text-sm font-medium  text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out uppercase cursor-pointer disabled:bg-primary/50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Signup Section */}
                    <div className="bg-secound/95  p-5 md:p-8 lg:w-1/2 flex flex-col justify-center">
                        <h4 className="text-lg md:text-2xl font-semibold mb-2  text-white">New to Dazzling Diva?</h4>
                        <p className="text-gray-200 mb-6">
                            Sign up for an account to enjoy faster checkout, track orders, and more!
                        </p>
                        <Link
                            href="/sign-up"
                            className="mt-4 mx-10 bg-white text-primary font-semibold py-2 md:py-3 px-4  hover:bg-gray-100 transition duration-150 ease-in-out uppercase cursor-pointer text-center"
                        >
                            Create an Account
                        </Link>

                        {/* Divider - Uncomment if you want to use social login */}
                        {/* <div className="relative flex items-center my-6">
                            <div className="flex-grow border-t border-gray-400"></div>
                            <span className="flex-shrink mx-4 text-gray-500 text-[10px]">Or continue with</span>
                            <div className="flex-grow border-t border-gray-400"></div>
                        </div> */}

                        {/* Social Login Buttons - Uncomment if you want to use social login */}
                        {/* <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={isLoading}
                            className="flex gap-2 items-center justify-center px-8 py-2.5 mx-10  border border-gray-200 bg-white hover:bg-gray-50 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <FcGoogle className="w-6 h-6" />
                            <span className="uppercase">SIGN IN WITH GOOGLE</span>
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;