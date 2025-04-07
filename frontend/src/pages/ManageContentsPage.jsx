import { useState, useEffect } from 'react';
import API from '../services/api';
import AdminLayout from '../components/Admin/AdminLayout';
import { updateContentById } from '../services/contentsApi';
import { toast } from "react-toastify";
import Swal from 'sweetalert2';

const ManageContents = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await API.get('/courses/'); // adjust endpoint if needed
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);
  

  useEffect(() => {
    const selectedCourse = courses.find(course => course.id == selectedCourseId);
    setContents(selectedCourse ? selectedCourse.contents : []);
  }, [selectedCourseId]);

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
  };

  const handleContentChange = (index, e) => {
    const { name, value } = e.target;
    setContents(prevContents =>
      prevContents.map((content, i) =>
        i === index ? { ...content, [name]: value } : content
      )
    );
  };

  const handleUpdateContents = async (e) => {
	e.preventDefault();
  
	try {
	  for (const content of contents) {
		const updatedContent = {
		  title: content.title,
		  content_type: content.content_type,
		  url: content.url,
		  text_content: content.text_content,
		};
  		const res = await updateContentById(content.id, updatedContent)
		console.log(res)
	  }
  	  toast.success("All contents updated successfully!");
    
	} catch (error) {
	  console.error("Error updating contents:", error);
	  toast.error("Failed to update contents. Please try again.");
	}
  };

  const handleDeleteContent = (contentId) => {
    Swal.fire({
      background: '#1f2937', // dark background
      color: '#fff',
      title: 'Are you sure?',
      text: 'Think twice before you delete!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        API.delete(`/courses/content/delete/${contentId}/`)
          .then(() => {
            setContents(prevContents => prevContents.filter(content => content.id !== contentId));
            toast.success('Content deleted successfully!');
          })
          .catch((error) => {
            console.error('Error deleting content:', error);
            toast.error('Failed to delete content. Please try again.');
          });
      }
    });
  };
  

  return (
	<AdminLayout>
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Contents</h1>

      <select 
        value={selectedCourseId}
        onChange={handleCourseChange}
        className="p-2 border rounded mb-6"
      >
        <option value="">Select a course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>

      {contents?.length > 0 ? (
          <form onSubmit={handleUpdateContents}>
            {contents.map((content, index) => (
              <div key={content.id} className="mb-6 border p-4 rounded shadow">
                <label className="block font-semibold mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={content.title || ''}
                  onChange={(e) => handleContentChange(index, e)}
                  className="p-2 border rounded w-full"
                />

                <label className="block font-semibold mt-4 mb-1">Content Type</label>
                <input
                  type="text"
                  name="content_type"
                  value={content.content_type || ''}
                  onChange={(e) => handleContentChange(index, e)}
                  className="p-2 border rounded w-full"
                  disabled
                />

                <label className="block font-semibold mt-4 mb-1">URL (optional)</label>
                <input
                  type="url"
                  name="url"
                  value={content.url || ''}
                  onChange={(e) => handleContentChange(index, e)}
                  className="p-2 border rounded w-full"
                />

                <label className="block font-semibold mt-4 mb-1">Text Content (optional)</label>
                <textarea
                  name="text_content"
                  value={content.text_content || ''}
                  onChange={(e) => handleContentChange(index, e)}
                  className="p-2 border rounded w-full"
                  rows="4"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteContent(content.id)}
                    className="mt-4 bg-red-500 text-white p-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
              Save Changes
            </button>
          </form>
        ) : (
          <h2 className="text-center text-xl">No contents available. Add contents first.</h2>
        )}
      </div>
	</AdminLayout>
  );
};

export default ManageContents;