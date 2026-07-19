import Image from "next/image";
import React from 'react';

const PaymentLogo = () => {

    const paymentMethods = [
        { name: 'VISA', icon: 'https://i.postimg.cc/zD2RWMqs/Frame-53.png' },
        { name: 'Master card', icon: 'https://i.postimg.cc/GpRBdnjy/Frame-58.png' },
        { name: 'bKash', icon: 'https://i.postimg.cc/9MJwLgZq/Frame-51.png' },
        { name: 'Nagod', icon: 'https://i.postimg.cc/J00Dv35Y/Frame-52.png' },
        { name: 'Rocket', icon: 'https://i.postimg.cc/zXLHkjBV/Frame-55.png' },
        { name: 'uPay', icon: 'https://i.postimg.cc/9FvRg7R1/Frame-56.png' },
        { name: 'Sure', icon: 'https://i.postimg.cc/kgKV0gWC/Frame-57.png' },
        { name: 'DBBL', icon: 'https://i.postimg.cc/tJcZj1rq/Frame-54.png' },
        { name: 'City', icon: 'https://i.postimg.cc/1tC4Gn1G/Frame-61.png' },
        { name: 'Brac Bank', icon: 'https://i.postimg.cc/gj1J7CJr/Frame-63.png' },
        { name: 'Islami', icon: 'https://i.postimg.cc/FzYzDrh2/Frame-62.png' },
        { name: 'UCB', icon: 'https://i.postimg.cc/BZzXtKgs/Frame-64.png' }
    ]

    return (
        <div className="mb-7">
            <h3 className="text-xs font-bold font-geist uppercase text-center tracking-wider text-gray-500 mb-5 flex items-center justify-center gap-2">
                Guarantee Safe Checkout
            </h3>
            <div className="flex flex-wrap gap-5 lg:gap-3 justify-center">
                {paymentMethods.map((method, index) => (
                    <div key={index} className="transition-shadow duration-300 border border-gray-100">
                        <Image
                            src={method.icon}
                            alt={method.name}
                            width={120}
                            height={40}
                            className="object-contain bg-white w-20 h-10 rounded shadow-sm hover:shadow-md"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentLogo;
