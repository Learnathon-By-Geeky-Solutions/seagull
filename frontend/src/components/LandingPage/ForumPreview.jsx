import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faHeart,
	faComment,
	faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import API from "../../services/api";

const ForumPreview = () => {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchRecentPosts = async () => {
			try {
				setLoading(true);
				const response = await API.get("/forum/posts/", {
					params: {
						limit: 3,
						ordering: "-created_at", // Order by creation date descending
					},
				});
				setPosts(response.data.slice(0, 3)); // Ensure only 3 posts
			} catch (error) {
				console.error("Error fetching forum posts:", error);
				setError("Failed to load recent posts");
			} finally {
				setLoading(false);
			}
		};

		fetchRecentPosts();
	}, []);

	return (
		<section className="py-10 bg-white">
			<div className="container mx-auto px-4">
				{/* Section Header */}
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Latest From Our <span className="text-blue-600">Forum</span>
					</h2>
					<p className="text-gray-600 text-lg max-w-2xl mx-auto">
						Stay updated with the latest discussions from our community
					</p>
				</div>

				{/* Posts Grid */}
				<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{loading ? (
						// Loading skeletons with fixed height
						[...Array(3)].map((_, index) => (
							<div
								key={index}
								className="animate-pulse h-[320px] flex flex-col"
							>
								<div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
								<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
								<div className="h-4 bg-gray-200 rounded w-1/2"></div>
							</div>
						))
					) : error ? (
						// Error state
						<div className="col-span-3 text-center text-red-600 py-8">
							{error}
						</div>
					) : posts.length === 0 ? (
						// Empty state
						<div className="col-span-3 text-center text-gray-500 py-8">
							No forum posts available
						</div>
					) : (
						// Actual posts with fixed heights
						posts.map((post) => (
							<div
								className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6 
                                         flex flex-col h-[280px] justify-between"
								key={post.id}
							>
								<div className="space-y-4 flex-1 overflow-hidden">
									<h3
										className="text-xl font-semibold text-gray-900 hover:text-blue-600 
                                               transition-colors line-clamp-2"
									>
										{post.title}
									</h3>

									<p className="text-gray-600 line-clamp-3">{post.content}</p>

									{/* Tags with overflow handling */}
									<div className="flex flex-wrap gap-2 max-h-[40px] overflow-hidden">
										{post.tags?.map((tag) => (
											<span
												key={tag.id}
												className="text-xs font-medium text-blue-600 bg-blue-50 
                                                         px-2 py-1 rounded-full whitespace-nowrap"
											>
												#{tag.name}
											</span>
										))}
									</div>
								</div>

								{/* Metrics - Always at bottom */}
								<div
									className="flex items-center justify-between text-sm text-gray-500 pt-4 
                                            border-t border-gray-100 mt-4"
								>
									<div className="flex items-center space-x-4">
										<span className="flex items-center">
											<FontAwesomeIcon
												icon={faHeart}
												className="mr-1 text-red-600"
											/>
											{post.total_votes}
										</span>
										<span className="flex items-center">
											<FontAwesomeIcon
												icon={faComment}
												className="mr-1 text-gray-500"
											/>
											{post.comments_count || 0}
										</span>
									</div>
									<span className="text-gray-400">
										{new Date(post.created_at).toLocaleDateString()}
									</span>
								</div>
							</div>
						))
					)}
				</div>

				{/* View All Link */}
				<div className="text-center mt-12">
					<Link
						to="/forum"
						className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group"
					>
						View All Posts
						<FontAwesomeIcon
							icon={faArrowRight}
							className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
						/>
					</Link>
				</div>
			</div>
		</section>
	);
};

export default ForumPreview;
