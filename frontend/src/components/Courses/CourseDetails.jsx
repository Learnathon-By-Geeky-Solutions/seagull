import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEnrolledCourses, enroll, getCourseDetailsById } from "../../services/coursesApi";
import { toast, ToastContainer } from "react-toastify";
import { FaArrowRight, FaSpinner } from "react-icons/fa";

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseData, enrolledData] = await Promise.all([
          getCourseDetailsById(id),
          getEnrolledCourses(),
        ]);

        setCourse(courseData);
        const enrolledCourses = enrolledData.data || [];
        console.log(courseData);
        setIsEnrolled(enrolledCourses.some((c) => c.id === parseInt(id)));
      } catch (error) {
        console.error("Error loading course or enrollment info:", error);
      }
    };

    fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const response = await enroll(id);
      toast.success(response?.data?.message || "Enrolled successfully!");
      setIsEnrolled(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl" />
      </div>
    );
  }

  const renderActionButton = () => {
    if (isEnrolled) {
      return (
        <Link
          to={`/courseContents/${course.id}`}
          className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md"
        >
          Go to Course <FaArrowRight className="ml-2" />
        </Link>
      );
    }
    return (
      <button
      onClick={handleEnroll}
      disabled={loading}
      className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md disabled:opacity-50"
    >
      {loading ? <FaSpinner className="animate-spin mr-2" /> : "Enroll Now"}
    </button>
    );
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-10 px-4">
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
      {/* Grid for Image on right and Content on left */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Content Area */}
        <div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{course.description}</p>

          <div className="space-y-4 text-sm text-gray-700">
            <p><span className="font-medium text-gray-900">Subject:</span> {course.subject}</p>
            <div className="mt-4">
              <p className="text-base font-semibold text-gray-800">{course.created_by?.name}</p>
              <p className="text-sm text-gray-600 font-light">{course.created_by?.designation}</p>
              <p className="text-sm text-gray-500">{course.created_by?.university}</p>
            </div>
            <p><span className="font-medium text-gray-900">Difficulty:</span> {course.difficulty.toUpperCase()}</p>
            <p><span className="font-medium text-gray-900">Duration:</span> {course.duration} hours</p>
            <p><span className="font-medium text-gray-900">Ratings:</span> {course.ratings}/5</p>
          </div>

          {/* Action Button */}
          {renderActionButton()}
        </div>

        {/* Right Image Area */}
        <div className="flex justify-center items-start">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-auto max-w-md object-contain rounded-xl shadow-lg"
          />
        </div>
      </div>

      <ToastContainer />
    </div>
  </div>
  );
};

export default CourseDetails;
