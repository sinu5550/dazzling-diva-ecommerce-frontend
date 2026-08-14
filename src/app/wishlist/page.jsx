import Container from "@/components/Container/Container";
import WishlistClient from "@/components/Wishlist/Wishlist";

export const metadata = {
    title: "My Wishlist || Dazzling Diva",
    description: "View and manage your wishlist items"
};

export default function WishlistPage() {
    return (
        <WishlistClient />
    );
}
