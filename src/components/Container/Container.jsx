

const Container = ({ children, className = '' }) => {
    return (
        <div className={`mx-[1%] ${className}`}>
            {children}
        </div>
    );
};

export default Container;