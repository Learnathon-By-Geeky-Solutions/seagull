import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import PropTypes from 'prop-types';


const EditPostModal = ({ post, onClose, refreshPost }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(post.tags || []);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await API.get('/forum/tags/');
        setAllTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  const handleTagSelect = (e) => {
    const tagId = parseInt(e.target.value);
    const tag = allTags.find((t) => t.id === tagId);
    if (tag && selectedTags.length < 3 && !selectedTags.some((t) => t.id === tagId)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleSave = async () => {

    if (selectedTags.length === 0) {
        alert("Please select at least one tag.");
        return;
      }
    console.log("Attempting to update post:", post.id);
    try {
      const response = await API.put(
        `/forum/posts/${post.id}/`, 
        { 
          title,  // Ensure the updated title is sent
          content,  // Ensure the updated content is sent
          tag_ids: selectedTags.map(tag => tag.id)  // Send updated tag IDs
        },  
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Post updated successfully:", response.data);
      refreshPost(response.data);  // Update the UI with the new post data
      onClose();  // Close the modal after saving
    } catch (error) {
      console.error("Error updating post:", error.response ? error.response.data : error.message);
    }
  };
  
  

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Edit Post</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <input
            type="text"
            placeholder="Enter your post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
            required
          />
          <textarea
            placeholder="Write your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
            rows="6"
            required
          />
          {/* Tag Selection */}
          <div>
            <label htmlFor="tag-select" className="block font-medium text-gray-700 mb-2">
              Select Tags (1–3):
            </label>
            <select
              id="tag-select"
              onChange={handleTagSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>
                Choose a tag...
              </option>
              {allTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            {/* Display Selected Tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span key={tag.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-lg"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            type="button"
            className="w-full text-center text-gray-500 hover:underline pt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
   
  );
};
EditPostModal.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    )
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refreshPost: PropTypes.func.isRequired
};


export default EditPostModal;
