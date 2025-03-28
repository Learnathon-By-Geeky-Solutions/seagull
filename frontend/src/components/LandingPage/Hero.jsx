import { useState } from "react";
import HeroImge from "../../assets/herobg.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const Hero = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = (e) => {
		e.preventDefault();
		console.log("Searching for:", searchQuery);
	};

	return (
		<section className="relative md:h-[70vh] h-[50vh]">
			{/* Background image with overlay */}
			<div className="absolute inset-0 z-0">
				<img
					src={HeroImge}
					alt="Learning background"
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-black/50" /> {/* Dark overlay */}
			</div>

			{/* Content */}
			<div className="relative z-10 flex flex-col items-center justify-center min-h-96 px-4 text-center text-white">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-4xl font-bold mb-4">
						Professional and Lifelong Learning
					</h1>
					<p className="text-lg mb-8">
						Discover thousands of courses from top instructors around the world
					</p>

					{/* Search form */}
					<form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
						<div className="flex gap-2">
							<input
								type="text"
								placeholder="Search for courses..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-6 py-4 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<button
								type="submit"
								className="px-8 py-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
							>
								<FontAwesomeIcon icon={faMagnifyingGlass} />
							</button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
};

export default Hero;
