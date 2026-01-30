import React, { useState, useEffect } from 'react';
import { enhancedApi } from '../services/enhancedApi';
import { Search, BookMarked, Trash2 } from 'lucide-react';

const Dictionary = () => {
  const [words, setWords] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    enhancedApi.getDictionary().then(setWords);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Vocabulary</h1>
      <div className="flex gap-2 mb-8">
        <input 
          className="flex-1 p-3 border rounded-xl" 
          placeholder="Lookup a new word..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={() => enhancedApi.lookupWord(search)} className="bg-primary text-white px-6 rounded-xl">Search</button>
      </div>
      <div className="grid gap-4">
        {words.map(w => (
          <div key={w.id} className="p-4 bg-white border rounded-xl flex justify-between">
            <div>
              <h3 className="font-bold text-lg">{w.word}</h3>
              <p className="text-gray-600">{w.definition}</p>
            </div>
            <BookMarked className="text-primary/40" />
          </div>
        ))}
      </div>
    </div>
  );
};
export default Dictionary;