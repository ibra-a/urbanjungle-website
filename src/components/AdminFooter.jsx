// Simple footer component for admin and driver pages
// Shows "Powered by GABAISOLUTIONS" signature

const AdminFooter = () => {
  return (
    <footer className="mt-auto pt-8 pb-6 border-t border-gray-800">
      <div className="flex justify-center items-center">
        <p className="text-gray-500 text-sm font-light">
          Powered by{' '}
          <span className="text-gray-400 font-medium hover:text-gray-300 transition-colors duration-300">
            GABAISOLUTIONS
          </span>
        </p>
      </div>
    </footer>
  );
};

export default AdminFooter;


