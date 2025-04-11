
import React from 'react';

interface CategoryTabsProps {
  categories: { id: string; name: string }[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  categories, 
  activeCategory, 
  onSelectCategory 
}) => {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-2 min-w-max">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'All' 
              ? 'bg-canteen-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
          onClick={() => onSelectCategory('All')}
        >
          All
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.name 
                ? 'bg-canteen-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
            onClick={() => onSelectCategory(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
