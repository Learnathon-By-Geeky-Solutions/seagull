import Hero from "../components/LandingPage/Hero";
import FeaturedCourses from "../components/LandingPage/FeaturedCourses";
import WhyChooseUs from "../components/LandingPage/WhyChooseUs";
import ForWhome from "../components/LandingPage/ForWhom";
import Statistics from "../components/LandingPage/Statistics";

const Home = () => {
	return (
		<div>
			<Hero />
			<FeaturedCourses />
			<WhyChooseUs />
			<ForWhome />
			<Statistics />
		</div>
	);
};

export default Home;
