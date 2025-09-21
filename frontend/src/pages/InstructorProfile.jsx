import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { FaChalkboardTeacher, FaStar } from "react-icons/fa";

export default function InstructorProfile() {
    const { id } = useParams();
    const location = useLocation();
    const passedInstructor = location.state.courseInstructor;
    const [instructor, setInstructor] = useState(passedInstructor || null);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        if (!passedInstructor) {
          API.get(`/users/instructors/${id}/`)
            .then(res => setInstructor(res.data))
            .catch(err => console.error(err));
        }
    }, [id, passedInstructor]);
    
    useEffect(() => {
        const allCourses = JSON.parse(localStorage.getItem("courses"));
        const instructorsCourses = allCourses.filter(
            (c) => c.created_by_details.id == passedInstructor.id
        );
        setCourses(instructorsCourses);
    }, [id]);

  if (!instructor) return <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl" />
    </div>
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-base-100 rounded-box shadow-md">
      {/* Instructor Info */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="p-4 bg-primary text-white rounded-full shadow-md">
          <FaChalkboardTeacher className="text-5xl" />
        </div>

        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-bold text-blue-800">{instructor.name}</h2>
          <p className="text-sm text-gray-500">{instructor.email}</p>
          <div className="text-base-content space-y-1">
            <p><span className="font-semibold">Designation:</span> {instructor.designation}</p>
            <p><span className="font-semibold">University:</span> {instructor.university}</p>
            <p><span className="font-semibold">Bio:</span>{" "}{instructor.bio || "No bio provided."}</p>
          </div>
        </div>
      </div>

      {/* Instructor Courses */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-base-300">Courses by {instructor.name}</h3>

        {courses.length > 0 ? (
          <div className="space-y-6">
            {courses.map(course => (
              <div key={course.id} className="flex flex-col sm:flex-row items-start bg-base-200 p-4 rounded-box shadow-sm hover:shadow-md transition duration-200">
                {/* Course Image */}
                <img
                  src={course.image || "/default-course.jpg"} // fallback if image missing
                  alt={course.title}
                  className="w-full sm:w-40 h-28 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-4"
                />

                {/* Course Details */}
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-blue-800">{course.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.description?.slice(0, 100)}...
                  </p>
                  <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500 gap-4">
                    <div className="flex items-center gap-1 mt-4">
                      <FaStar className="text-yellow-400" />
                      {course.ratings ? course.ratings.toFixed(1) : "No rating"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No courses published yet.</p>
        )}
      </div>
    </div>
  );
}
