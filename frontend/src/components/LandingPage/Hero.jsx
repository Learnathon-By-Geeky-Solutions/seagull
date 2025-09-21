import HeroImage from "../../assets/herobg.jpg";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Hero = () => {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);

	const handleGetStarted = () => {
		if (user) {
			navigate("/courses");
		} else {
			navigate("/login");
		}
	};

	return (
		<section className="relative w-full min-h-screen flex items-center justify-center -mt-16 pt-20">
  {/* Background image with gradient overlay */}
  <div className="absolute inset-0 z-0">
    <img
      src={HeroImage}
      alt="Learning background"
      className="w-full h-full object-cover"
    />
    {/* Stronger gradient overlay for better text readability on mobile */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/50 z-10" />
  </div>

  {/* Centered Content */}
  <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6 text-center text-white">
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
        Unlock Your Learning Potential
        <span className="block mt-3 sm:mt-4">
          at{" "}
          <span className="text-blue-400 hover:text-blue-300 transition-colors">
            KUETx
          </span>
        </span>
      </h1>

      <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto px-2 sm:px-0">
        Where Learning Connects — Explore expert-led courses, join vibrant
        communities, and take control of your education.
      </p>

      <button
        onClick={handleGetStarted}
        className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 
                   text-sm sm:text-base font-medium text-white 
                   bg-gradient-to-r from-blue-600 to-blue-500 rounded-full 
                   hover:from-blue-700 hover:to-blue-600 
                   transition-all duration-300 transform hover:scale-105 mt-6"
      >
        <span>{user ? "Browse Courses" : "Get Started"}</span>
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </button>
    </div>
  </div>
</section>

	);
};

export default Hero;
