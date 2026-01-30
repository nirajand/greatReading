import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { enhancedApi } from '../services/enhancedApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Reader = () => {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [content, setContent] = useState("");

  useEffect(() => {
    enhancedApi.getPageText(Number(id), page).then(res => setContent(res.text));
  }, [id, page]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-card p-12 shadow-sm min-h-[600px] text-lg leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
      <div className="flex justify-center items-center gap-4">
        <button onClick={() => setPage(p => Math.max(1, p-1))} className="p-2 border rounded"><ChevronLeft /></button>
        <span className="font-mono">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} className="p-2 border rounded"><ChevronRight /></button>
      </div>
    </div>
  );
};
export default Reader;