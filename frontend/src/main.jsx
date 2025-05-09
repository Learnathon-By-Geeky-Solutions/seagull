// React and Router
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
	createBrowserRouter,
	RouterProvider,
	useRouteError,
} from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
// Context
import { AuthProvider } from "./context/AuthContext.jsx";


// Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import App from "./App.jsx";
import CoursePage from "./pages/CoursePage.jsx";
import ForumPage from "./pages/ForumPage.jsx";
import AboutUsPage from "./pages/AboutUsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import Register from "./pages/Register.jsx";
import QuizHome from "./pages/QuizHome.jsx";
import Dashboard from "./pages/Admin/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import AddContentPage from "./pages/Admin/AddContentPage.jsx";
import ModifyCoursePage from "./pages/Admin/ModifyCoursePage.jsx";
import AddCoursesPage from "./pages/Admin/AddCoursesPage.jsx";
import AddQuizPage from "./pages/Admin/AddQuizPage.jsx";
import ManageContentsPage from "./pages/Admin/ManageContentsPage.jsx";
import ManageQuiz from "./pages/Admin/ManageQuiz.jsx";
import UpdateQuizPage from "./pages/Admin/UpdateQuizPage.jsx";
import UpdateQuestionsPage from "./pages/Admin/UpdateQuestionsPage.jsx";

// Components
import ProtectedRoute from "./components/Shared/ProtectedRoute.jsx";
import CourseDetails from "./components/Courses/CourseDetails.jsx";
import CourseContent from "./components/Courses/CourseContent.jsx";
import AdminRoute from "./components/Shared/AdminRoute.jsx";
import Result from "./components/Quiz/Result.jsx";
import Quizzes from "./components/Quiz/Quizzes.jsx";

// Styles
import { ToastContainer } from "react-toastify";
import "./index.css";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import InstructorProfile from "./pages/InstructorProfile.jsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <NotFoundPage />,
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/login",
				element: <Login />,
			},
			{
				path: "/register",
				element: <Register />,
			},
			{
				path: "/forum",
				element: <ForumPage />,
			},
			{
				path: "/aboutus",
				element: <AboutUsPage />,
			},
			{
				path: "/instructors/:id",
				element: <InstructorProfile />,
			},
			{
				path: "/quiz",
				element: <QuizHome />,
			},
			{
				path: "/quiz/:categoryId",
				element: <Quizzes />,
			},
			{
				path: "/result",
				element: <Result />,
			},
			{
				path: "/courses",
				element: <CoursePage />,
			},
			{
				path: "/verify-email/:uid/:token",
				element: <VerifyEmail />,
			},
			{
				path: "/forgot-password",
				element: <ForgotPassword />,
			},
			{
				path: "/reset-password/:uid/:token",
				element: <ResetPassword />,
			},
			{
				element: <ProtectedRoute />,
				children: [
					{
						path: "/profile",
						element: <Profile />,
					},
					{
						path: "/courses/:id",
						element: <CourseDetails />,
					},
					{
						path: "/CourseContents/:id",
						element: <CourseContent />,
					},
					{
						path: "/add-courses",
						element: <AddCoursesPage />,
					},
					{
						path: "/manage-courses",
						element: <ModifyCoursePage />,
					},
					{
						path: "/manage-contents",
						element: <ManageContentsPage />,
					},
					{
						path: "/add-contents",
						element: <AddContentPage />,
					},
					{
						element: <AdminRoute />,
						children: [
							{
								path: "/admin/dashboard",
								element: <Dashboard />,
							},
							{
								path: "/add-quiz",
								element: <AddQuizPage />,
							},
							{
								path: "/manage-quiz",
								element: <ManageQuiz />,
							},
							{
								path: "/update-quiz/:categoryId",
								element: <UpdateQuizPage />,
							},
							{
								path: "/update-questions/:categoryId",
								element: <UpdateQuestionsPage />,
							},
						],
					},
				],
			},
		],
	},
]);

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<HelmetProvider>
			<AuthProvider>
					<RouterProvider router={router} />
					<ToastContainer
						position="bottom-right"
						autoClose={2000}
						hideProgressBar={false}
						newestOnTop
						closeOnClick
						pauseOnHover
						draggable
					/>
			</AuthProvider>
		</HelmetProvider>
	</StrictMode>
);

// ErrorBoundary Component
export default function ErrorBoundary() {
	const error = useRouteError();
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-2xl font-bold text-red-600">Oops!</h1>
			<p className="text-gray-600">{error.message}</p>
		</div>
	);
}
