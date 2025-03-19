import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../services/api';

function Category() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllCategories()
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load categories. Please try again later.');
        console.error('Error fetching categories:', err);
        setLoading(false);
      });
  }, []);

  const handleCategorySelect = (categoryId) => {
    navigate(`/quiz/${categoryId}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-6" role="alert">
      <span className="block sm:inline">{error}</span>
    </div>
  );

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-8">Select a Quiz Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div 
            key={category.id} 
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
            onClick={() => handleCategorySelect(category.id)}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">{category.name}</h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <span className="inline-block bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                {category.question_count} questions
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Category;