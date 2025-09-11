
import React from 'react';
import { getCategoryColor } from '@/utils/transactionUtils';
import { prettyLabel } from '@/utils/labelUtils';

interface CategoryCellProps {
  category: string;
}

const CategoryCell: React.FC<CategoryCellProps> = ({ category }) => {
  return (
    <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(category)}`}>
      {prettyLabel(category)}
    </span>
  );
};

export default CategoryCell;
