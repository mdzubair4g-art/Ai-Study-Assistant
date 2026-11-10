import { FaBookOpen } from "react-icons/fa";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      
      <div className="flex items-center gap-2">
        <FaBookOpen className="text-blue-600 text-2xl" />
        
        <h1 className="text-xl font-bold">
          AI Study Assistant
        </h1>
      </div>

      <div className="flex gap-4">
        <button className="text-gray-600 hover:text-blue-600">
          Login
        </button>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Get Started
        </button>
      </div>

    </nav>
  );
}

export default Navbar;