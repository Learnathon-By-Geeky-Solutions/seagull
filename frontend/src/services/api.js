import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/', // Your Django backend URL
});

// ----------------------- COURSES -----------------------------------
// Fetch all courses
export const getAllCourses = async () => {
  const response = await API.get('/courses/');
  return response.data;
};

// Fetch course details by ID
export const getCourseDetailsById = async (id) => {
  const response = await API.get(`/courses/${id}/`);
  return response.data;
};

// Add a new course
export const addCourse = async (courseData) => {
  const response = await API.post("/courses/add/", courseData);
  return response.data;
}

// ----------------------- CONTENTS -----------------------------------
// Edit contents
export const updateContentById = async (contentId, updatedContent) => {
  try {
    const response = await API.put(`/courses/content/${contentId}/`, updatedContent);
    return response.data;
  } catch (error) {
    console.error(`Error updating content with ID ${contentId}:`, error.response?.data || error.message);
    throw error;
  }
};



// ----------------------- INSTRUCTORS -----------------------------------
// fetch all instructors
export const getAllInstructors = async () => {
  const response = await API.get('/instructors/');
  return response.data;
};

export default API;
