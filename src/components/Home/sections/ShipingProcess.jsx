import Container from "@/components/Container/Container";
import { HiOutlineShieldCheck, HiOutlineTruck } from "react-icons/hi";
import { HiOutlineArrowPath } from "react-icons/hi2";
import { IoHeadsetOutline } from "react-icons/io5";

const ShipingProcess = () => {

    const trustBadges = [
        { icon: HiOutlineShieldCheck, title: "Secure Checkout", sub: "SSL encrypted" },
        { icon: HiOutlineArrowPath, title: "Easy Returns", sub: "30-day policy" },
        { icon: HiOutlineTruck, title: "Fast Delivery", sub: "Dhaka 24h" },
        { icon: IoHeadsetOutline, title: "24/7 Support", sub: "Always here" },
    ];

    return (
        < div className="bg-secound/70 text-white" >
            <Container>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10">
                    {trustBadges.map(({ icon: Icon, title, sub }) => (
                        <div
                            key={title}
                            className="flex items-center gap-3 py-5 px-4 md:px-6 first:pl-0 last:pr-0"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <Icon size={18} className="text-white/90" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white/95">{title}</div>
                                <div className="text-xs text-white/50">{sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div >
    );
};

export default ShipingProcess;
