import Container from "@/components/Container/Container";
import Sidebar from "@/components/Shared/Sidebar/Sidebar";
import { Philosopher, Poppins } from "next/font/google";

const PoppinsFont = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"]
});


const philosopher = Philosopher({
    variable: "--font-philosopher",
    subsets: ["latin"],
    weight: ["400", "700"]
});



export default function DashboardLayout({ children }) {
    return (
        <div className={`${PoppinsFont.variable} ${philosopher.variable} font-sans`}
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, rgba(176, 114, 16, 0.10) 0.19%, rgba(255, 255, 255, 0.10) 70.81%)'
            }}>
            <Container>
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 py-10 font-poppins">
                    {/* Sidebar - Mobile: full width, Desktop: 30% */}
                    <div className="w-full lg:w-[30%]">
                        <Sidebar />
                    </div>

                    {/* Main Content - Mobile: full width, Desktop: 70% */}
                    <div className="w-full lg:w-[70%]  text-gray-800">
                        {children}
                    </div>
                </div>
            </Container>
        </div>
    );
}