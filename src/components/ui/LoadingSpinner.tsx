// A reusable loading spinner with smooth animation
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      {/* Spinning circle animation */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default LoadingSpinner;
