import Container from "@/components/Container/Container";
import { HiOutlineShieldCheck, HiOutlineTruck } from "react-icons/hi";
import { HiOutlineArrowPath } from "react-icons/hi2";
import { IoHeadsetOutline } from "react-icons/io5";

const ShipingProcess = () => {

    const trustBadges = [
        { icon: HiOutlineTruck, title: "Fast Delivery", sub: "Free shipping on all US orders" },
        { icon: HiOutlineShieldCheck, title: "Safe Payment", sub: "We ensure secure payment with PEV" },
        { icon: IoHeadsetOutline, title: "24/7 Online Support", sub: "24 hours a day, 7 days a week" },
        { icon: HiOutlineArrowPath, title: "Free Returns", sub: "Simply return it within 30 days" },
    ];

    return (
        <div className="bg-white border-b border-gray-100 py-10  w-full">
            <Container>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6">
                    {trustBadges.map(({ icon: Icon, title, sub }) => (
                        <div
                            key={title}
                            className="flex flex-col items-center text-center px-4"
                        >
                            <div className="w-12 h-12 flex items-center justify-center shrink-0 mb-1 text-stone-800">
                                <Icon size={42} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[16px] font-semibold text-stone-900 font-outfit">{title}</h4>
                                <p className="text-xs text-stone-500 font-outfit max-w-[200px] leading-relaxed">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default ShipingProcess;
