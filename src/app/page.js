
import Home from "@/components/Home/Home";
import DelayedModal from "@/components/ui/DelayedModal";

const MainLayout = () => {

  return (
    <div>
      <Home />
      <div className="hidden md:flex">
        <DelayedModal />
      </div>
    </div>
  )
}

export default MainLayout;