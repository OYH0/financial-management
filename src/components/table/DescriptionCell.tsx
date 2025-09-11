
import React from 'react';
import { Info } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { truncateDescription } from '@/utils/transactionUtils';

interface DescriptionCellProps {
  description: string;
}

const DescriptionCell: React.FC<DescriptionCellProps> = ({ description }) => {
  const { text, isTruncated } = truncateDescription(description);
  
  if (!isTruncated) {
    return <span className="text-gray-900 break-words">{text}</span>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="text-gray-900 break-words">{text}</span>
          <Info size={14} className="text-blue-500 hover:text-blue-700 flex-shrink-0" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4 bg-white border border-gray-200 shadow-lg rounded-xl">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-800">Descrição Completa</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default DescriptionCell;
