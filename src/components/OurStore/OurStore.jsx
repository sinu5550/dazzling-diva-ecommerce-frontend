import Link from "next/link";
const { default: Container } = require("../Container/Container");

const OurStore = ({storeData}) => {
 

    return (
        <Container>
            <div className="my-16 text-gray-800">
                {/* Breadcrumb */}
                <div className="flex gap-2 text-gray-700 text-sm md:text-base mb-6">
                    <Link
                        href="/"
                        className="hover:underline hover:text-teal-600 transition-colors"
                    >
                        Home
                    </Link>{" "}
                    /
                    <p className="font-semibold">Find Stores</p>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-5xl font-bold mb-10 text-gray-800 text-center font-philosopher">
                    Our Store
                </h2>

                <div className="py-10 px-6 grid grid-cols-1 gap-16">
                    {storeData.map((store, index) => (
                        <div
                            key={store.id}
                            className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center lg:items-stretch"
                        >
                            {/* Image Section */}
                            <div
                                className={`${index % 2 === 0 ? "md:order-1" : "md:order-2"
                                    } h-full`}
                            >
                                <img
                                    src={store.image.trim()} // Trim whitespace
                                    alt={store.name}
                                    className="w-full h-full object-cover hasib-rounded shadow-md min-h-[300px]"
                                />
                            </div>

                            {/* Text & Info Section */}
                            <div
                                className={`${index % 2 === 0 ? "md:order-2" : "md:order-1"
                                    } h-full flex flex-col justify-center`}
                            >
                                <h2 className="text-2xl font-semibold mb-4">
                                    {store.name}
                                </h2>

                                <p className="font-semibold">Address</p>
                                <p className="mb-4">{store.address}</p>

                                <p className="font-semibold">Phone Number</p>
                                <p className="mb-4">{store.phone_number}</p>

                                <p className="font-semibold">Email</p>
                                <p className="mb-4">{store.email}</p>

                                <p className="font-semibold">Notice</p>
                                <p className="mb-4">{store.notice}</p>

                                <p className="font-semibold">Open Time</p>
                                <p className="mb-4">{store.open_time}</p>

                                {/* Map */}
                                <iframe
                                    src={store.google_mapLink}
                                    width="100%"
                                    height="200"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    className="rounded-md mb-4"
                                ></iframe>

                                {/* Button */}
                                <button className="bg-primary hover:bg-primary-hover text-black px-6 py-2 rounded font-medium shadow self-start cursor-pointer">
                                    Get Direction
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default OurStore;