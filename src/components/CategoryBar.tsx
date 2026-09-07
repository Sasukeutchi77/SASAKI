import React from 'react';
import { Category } from '../types';
import { Layers } from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categorySlug: string | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full bg-white border-b border-stone-200 py-2.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {/* "Toutes" Pill */}
          <button
            id="cat-all-btn"
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === null
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Toutes les rubriques</span>
          </button>

          {/* Individual Category Pills */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.slug}`}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span>{cat.name}</span>
                {cat.articleCount !== undefined && cat.articleCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                      isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {cat.articleCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
