'use client';

import React, { useEffect, useState } from 'react';
import { useTransliterate } from '@/hooks/useTransliterate';

interface SegmentData {
  segment_id: string;
  sequence_number: number;
  root_pli?: string;
  root_san?: string;
  translation_en?: string;
}

export default function TextPage({ params }: { params: { text_id: string } }) {
  // Use React.use() to unwrap the params object in Next.js App Router (if Next 14/15)
  // For standard compatibility without React.use, we can just use `params.text_id` directly in client,
  // but let's safely access it if it's treated as a promise in later Next versions.
  // Assuming Next 13+ standard app dir:
  const text_id = params.text_id;
  const [segments, setSegments] = useState<SegmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [targetScript, setTargetScript] = useState<'iast' | 'devanagari'>('iast');

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const res = await fetch(`/api/texts/${text_id}/parallel`);
        if (!res.ok) throw new Error('Failed to fetch texts');
        const data = await res.json();
        setSegments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, [text_id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-sans">Loading {text_id}...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-sans">Error: {error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 font-sans bg-white min-h-screen">
      <header className="mb-10 pb-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Reading: {text_id.toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Parallel Translation & Root Text</p>
        </div>
        
        <div className="flex items-center space-x-1 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <button
            onClick={() => setTargetScript('iast')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              targetScript === 'iast' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            IAST
          </button>
          <button
            onClick={() => setTargetScript('devanagari')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              targetScript === 'devanagari' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Devanagari
          </button>
        </div>
      </header>

      <main className="space-y-4">
        {segments.map((segment) => (
          <SegmentRow 
            key={segment.segment_id} 
            segment={segment} 
            targetScript={targetScript} 
          />
        ))}
        {segments.length === 0 && (
          <div className="text-center text-gray-500 py-12">No segments found.</div>
        )}
      </main>
    </div>
  );
}

function SegmentRow({ 
  segment, 
  targetScript 
}: { 
  segment: SegmentData, 
  targetScript: 'iast' | 'devanagari' 
}) {
  const rootText = segment.root_pli || segment.root_san || '';
  const transliteratedRoot = useTransliterate(rootText, 'iast', targetScript);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
          {segment.segment_id}
        </div>
        <p className={`text-xl leading-relaxed ${
          targetScript === 'devanagari' 
            ? 'font-serif text-gray-900' 
            : 'font-sans text-gray-800 font-medium'
        }`}>
          {transliteratedRoot}
        </p>
      </div>

      <div className="space-y-3 md:pt-7">
        <p className="text-lg leading-relaxed text-gray-600 font-serif">
          {segment.translation_en}
        </p>
      </div>
    </div>
  );
}