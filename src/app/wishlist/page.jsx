import Container from "@/components/Container/Container";
import WishlistClient from "@/components/Wishlist/Wishlist";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";

export const metadata = {
    title: "My Wishlist || Dazzling Diva",
    description: "View and manage your wishlist items"
};

export default function WishlistPage() {
    return (
        <Container>
            <div className="flex items-center gap-2 text-gray-700 mt-10 text-sm md:text-base">
                <Link
                    href="/"
                    className="hover:underline hover:text-secound flex items-center gap-1 transition"
                >
                    Home <IoIosArrowForward />
                </Link>
                <p className="font-semibold text-gray-900">Wishlist</p>
            </div>

            <WishlistClient />
        </Container>
    );
}
