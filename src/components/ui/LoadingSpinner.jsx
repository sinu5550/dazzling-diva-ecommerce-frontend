

const LoadingSpinner = ({ smallHeight }) => {
    return (
        <div className={`flex justify-center items-center text-orange-500 ${smallHeight ? 'h-64' : 'h-screen'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ambir-500"></div>
        </div>
    );
};

export default LoadingSpinner;