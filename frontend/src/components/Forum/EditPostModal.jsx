// EditPostModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import { createTag, getTags, updatePost } from '../../services/forumApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MarkdownEditor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'react-markdown-editor-lite/lib/index.css';

const EditPostModal = ({ post, onClose, refreshPost }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(post.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await getTags();
        setAllTags(data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  const handleSave = async () => {
    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedPost = await updatePost(
        post.id,
        {
          title,
          content,
          tag_ids: selectedTags.map((tag) => tag.id),
        },
        token
      );

      toast.success("Post updated successfully!");
      refreshPost(updatedPost);
      onClose();
    } catch (error) {
      const data = error.response?.data;
      let errorMessage;

      if (Array.isArray(data)) {
        errorMessage = data[0];
      } else if (typeof data === 'object' && data !== null) {
        errorMessage = data.error || Object.values(data)[0];
      } else {
        errorMessage = error.message || 'An unknown error occurred.';
      }

      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom render function for Markdown preview to include syntax highlighting
  const renderMarkdown = (text) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                showLineNumbers
                wrapLines
                customStyle={{
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  backgroundColor: '#1e1e1e',
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59,130,246,0.5)' : 'none',
      padding: '2px',
      fontSize: '0.875rem',
      minHeight: '42px',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      borderRadius: '9999px',
      padding: '2px 6px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#1e40af',
      fontWeight: '500',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#1e40af',
      ':hover': {
        backgroundColor: '#bfdbfe',
        color: '#1e3a8a',
      },
    }),
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl mx-4 sm:mx-6 my-4 sm:my-6 p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
          Edit Post
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-3 sm:space-y-4">
          <input
            type="text"
            placeholder="Enter your post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
            required
            disabled={isSubmitting}
          />
          <div>
            <label className="block font-medium text-gray-700 mb-1 text-sm sm:text-base">
              Content (Use Markdown for formatting):
            </label>
            <div className="relative border border-gray-300 rounded-xl shadow-sm p-2">
              <style>
                {`
                  .rc-md-editor .editor-container .toolbar {
                    top: 0 !important;
                    padding: 4px 0 !important;
                    background: #fff !important;
                    border-bottom: 1px solid #d1d5db !important;
                    border-radius: 12px 12px 0 0 !important;
                  }
                  .rc-md-editor .editor-container .section-container {
                    overflow-y: auto !important;
                  }
                `}
              </style>
              <MarkdownEditor
                value={content}
                style={{ height: '250px' }}
                className="w-full border-none rounded-xl"
                renderHTML={renderMarkdown}
                onChange={({ text }) => setContent(text)}
                placeholder="Write your content here... (Use the toolbar to add code blocks, e.g., ```javascript\ncode\n```)"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* React Select for Tags */}
          <div>
            <label className="block font-medium text-gray-700 mb-1 text-sm sm:text-base">
              Select Tags (max 3):
            </label>
            <CreatableSelect
              options={allTags.map((tag) => ({ value: tag.id, label: tag.name }))}
              value={selectedTags.map((tag) => ({ value: tag.id, label: tag.name }))}
              onChange={(selected) => {
                const limited = selected.slice(0, 3);
                setSelectedTags(
                  limited.map((sel) => ({
                    id: sel.value,
                    name: sel.label,
                  }))
                );
              }}
              onCreateOption={async (inputValue) => {
                try {
                  const newTag = await createTag({ name: inputValue }, token);
                  const newTagObj = { id: newTag.id, name: newTag.name };

                  setAllTags((prev) => [...prev, newTagObj]);

                  setSelectedTags((prev) => {
                    const updated = [...prev, newTagObj].slice(0, 3);
                    return updated;
                  });
                } catch (error) {
                  toast.error('Failed to create tag', { autoClose: 3000 });
                  console.error('Create tag error:', error);
                }
              }}
              isMulti
              styles={customStyles}
              placeholder="Choose up to 3 tags..."
              closeMenuOnSelect={false}
              className="text-sm"
              isDisabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-base flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            onClick={onClose}
            type="button"
            className="mx-auto block text-center text-gray-500 hover:underline pt-1 text-sm sm:text-base"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </form>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
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
        name: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refreshPost: PropTypes.func.isRequired,
};

export default EditPostModal;