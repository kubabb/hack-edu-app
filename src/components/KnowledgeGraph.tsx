'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface Node {
  id: string;
  label: string;
  type: string;
}

interface Edge {
  source: string;
  target: string;
  type: string;
}

const typeColors: Record<string, string> = {
  CONCEPT: '#1d7874',
  DEFINITION: '#2ba599',
  EXAMPLE: '#3b9b8e',
  EXERCISE: '#166a66',
  THEOREM: '#0f4f4c',
};

export default function KnowledgeGraph({
  bookId,
  onSelectNode,
}: {
  bookId: string;
  onSelectNode?: (id: string) => void;
}) {
  const [data, setData] = useState<{ nodes: any[]; links: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });

  useEffect(() => {
    function updateDims() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDims({ width: rect.width, height: rect.height });
      }
    }
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  useEffect(() => {
    fetch(`/api/books/${bookId}/graph`)
      .then((r) => r.json())
      .then((d) => {
        setData({
          nodes: d.nodes.map((n: Node) => ({
            id: n.id,
            label: n.label,
            type: n.type,
            color: typeColors[n.type] || '#1d7874',
          })),
          links: d.edges.map((e: Edge) => ({ source: e.source, target: e.target, type: e.type })),
        });
        setLoading(false);
      });
  }, [bookId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#1d7874] animate-spin" />
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#666]">
        <p className="font-medium">Graf wiedzy jest pusty</p>
        <p className="text-sm mt-1">Przetwarzanie książki może potrwać kilka minut.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        graphData={data}
        nodeLabel="label"
        nodeColor="color"
        linkColor={() => '#d0e5e1'}
        linkWidth={1}
        nodeRelSize={6}
        onNodeClick={(node: any) => onSelectNode?.(node.id)}
        width={dims.width}
        height={dims.height}
        backgroundColor="#ffffff"
      />
    </div>
  );
}
