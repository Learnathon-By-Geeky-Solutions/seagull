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
        setIsEnrolled(enrolledCourses.some((c) => c.id === parseInt(id)));
      } catch (error) {
        console.error("Error loading course or enrollment info:", error);
      }
    };

    fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    console.log('enfi')
    setLoading(true);
    try {
      const response = await enroll(id);
      console.log(response)
      toast.success(response?.data?.message || "Enrolled successfully!");
      setIsEnrolled(true);
    } catch (error) {
      console.log('dsfkaslfk', error)
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
        <Link to={`/courseContents/${course.id}`} className="mt-8 btn btn-primary flex items-center gap-2">
          Go to Course <FaArrowRight />
        </Link>
      );
    }
    return (
      <button
        onClick={handleEnroll}
        className="mt-8 btn btn-accent flex items-center gap-2"
        disabled={loading}
      >
        {loading ? <FaSpinner className="animate-spin" /> : "Enroll Now"}
      </button>
    );
  };

  return (
    <div className="py-8">
      <section className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="max-w-xl">
          <h1 className="text-5xl mb-6">{course.title}</h1>
          <p className="text-lg text-gray-600 mb-2">{course.description}</p>
          <p className="text-lg mb-2">Subject: {course.subject}</p>
          <p className="text-lg mb-2">Instructor: {course.created_by}</p>
          <p className="text-lg mb-2">Difficulty: {course.difficulty.toUpperCase()}</p>
          <p className="text-lg mb-2">Duration: {course.duration} hours</p>
          <p className="text-lg mb-2">Ratings: {course.ratings}/5</p>
          {renderActionButton()}
        </div>
        <div>
          <img
            src={course.image}
            alt="Course Preview"
            className="rounded-lg shadow-lg w-full max-w-md"
          />
        </div>
      </section>
      <ToastContainer />
    </div>
  );
};

export default CourseDetails;
