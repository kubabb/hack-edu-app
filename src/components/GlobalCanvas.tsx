'use client'

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Network, ZoomIn, Maximize2, Loader2, Link as LinkIcon } from 'lucide-react';
import { readJsonSafely } from '@/src/lib/http/json';
import { useRouter } from 'next/navigation';

// Dynamically import force graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type ForceGraphMethods = any; // Any since we don't have types for react-force-graph-2d here easily

export interface ApiNode {
  id: string;
  label: string;
  type: string;
}

export interface ApiEdge {
  source: string;
  target: string;
  type: string;
  weight?: number;
}

type SimNode = ApiNode & { 
  x?: number; y?: number; 
  fx?: number; fy?: number; 
  vx?: number; vy?: number; 
  color?: string;
  val?: number; 
};

function truncateLabel(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

const typeColors: Record<string, string> = {
  CONCEPT: '#7057ff',
  DEFINITION: '#20b981',
  EXAMPLE: '#ffb84d',
  EXERCISE: '#ff5144',
  THEOREM: '#06296b',
  TASK: '#ff5144',
  THEORY: '#20b981',
  SECTION: '#6e7fa6',
};

export const GlobalCanvas: React.FC = () => {
  const router = useRouter();
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<{nodes: SimNode[], links: ApiEdge[]}>({ nodes: [], links: [] });

  useEffect(() => {
    let cancelled = false;
    async function loadGlobalGraph() {
      try {
        const res = await fetch('/api/graph/global');
        const data = await readJsonSafely<{ nodes?: ApiNode[], edges?: ApiEdge[] }>(res);
        if (cancelled) return;
        
        if (data && data.nodes) {
          const nodes = data.nodes.map(n => ({
            ...n,
            color: typeColors[n.type] || '#6e7fa6',
            val: 2 // base size
          }));
          const links = data.edges || [];
          setGraphData({ nodes, links });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadGlobalGraph();
    return () => { cancelled = true; }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setDimensions({ width: Math.max(0, Math.floor(r.width)), height: Math.max(0, Math.floor(r.height)) });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setDimensions({ width: Math.max(0, Math.floor(r.width)), height: Math.max(0, Math.floor(r.height)) });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!graphRef.current || graphData.nodes.length === 0) return;
    const fg = graphRef.current;
    // Tweak physics for large global graph
    fg.d3Force('charge')?.strength(-120);
    fg.d3Force('link')?.distance(40);
    fg.d3Force('center')?.strength(0.05);

    const t = window.setTimeout(() => { graphRef.current?.zoomToFit(400, 50); }, 600);
    return () => clearTimeout(t);
  }, [graphData, dimensions.width, dimensions.height]);

  const handleNodeClick = useCallback((node: any) => {
    // Optionally open node details or navigate
    console.log("Clicked node:", node as SimNode);
  }, []);

  const paintNode = useCallback((node: SimNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const r = 4; // Node radius
    const color = node.color || '#9ca3af';

    // Glow effect
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(x, y, r, x, y, r * 2.5);
    gradient.addColorStop(0, `${color}40`); // 25% opacity roughly
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient;
    ctx.arc(x, y, r * 2.5, 0, 2 * Math.PI);
    ctx.fill();

    // Solid core
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Text Label (only when zoomed in enough)
    const labelThreshold = 1.2;
    if (globalScale > labelThreshold) {
      const label = truncateLabel(node.label, 25);
      const fontSize = Math.max(3, 12 / globalScale);
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#06296b'; // Text color for bright theme
      ctx.fillText(label, x, y + r + (4 / globalScale));
    }
  }, []);

  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.5, 400);
    }
  };

  const handleFit = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-[32px] bg-white">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#7057ff]" />
        <p className="mt-4 font-extrabold text-[#6e7fa6]">Ładowanie globalnej sieci wiedzy...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex h-[calc(100vh-140px)] w-full flex-col overflow-hidden rounded-[32px] bg-[#fffefb] border border-[#dce7f5] shadow-sm">
      {/* HUD (Heads Up Display) */}
      <div className="absolute left-6 top-6 z-10 flex items-center justify-between pointer-events-none right-6">
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-2 backdrop-blur-xl border border-[#dce7f5] shadow-sm">
           <Network size={16} className="text-[#7057ff]" />
           <span className="text-xs font-black uppercase tracking-[0.1em] text-[#06296b]">Tablica wiedzy</span>
           <span className="ml-2 rounded-full bg-[#f0edff] px-2 py-0.5 text-[10px] font-black text-[#7057ff]">
             {graphData.nodes.length} pojęć
           </span>
        </div>
        
        <div className="pointer-events-auto flex items-center gap-2">
           <button 
             onClick={handleZoomIn}
             className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 backdrop-blur-xl border border-[#dce7f5] text-[#6e7fa6] hover:text-[#7057ff] hover:border-[#7057ff] transition-all shadow-sm"
             title="Przybliż"
           >
              <ZoomIn size={18} />
           </button>
           <button 
             onClick={handleFit}
             className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 backdrop-blur-xl border border-[#dce7f5] text-[#6e7fa6] hover:text-[#7057ff] hover:border-[#7057ff] transition-all shadow-sm"
             title="Dopasuj do ekranu"
           >
              <Maximize2 size={18} />
           </button>
        </div>
      </div>

      {dimensions.width > 0 && dimensions.height > 0 ? (
        <ForceGraph2D
          ref={graphRef as React.MutableRefObject<ForceGraphMethods>}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="transparent"
          nodeRelSize={4}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          linkColor={() => 'rgba(6, 41, 107, 0.08)'} // Subtle blue/black links
          linkWidth={1.5}
          onNodeClick={handleNodeClick}
          nodeCanvasObjectMode={() => 'replace'}
          nodeCanvasObject={(node, ctx, globalScale) => paintNode(node as SimNode, ctx, globalScale)}
          nodePointerAreaPaint={(node, color, ctx) => {
            const n = node as SimNode;
            ctx.beginPath();
            ctx.arc(n.x ?? 0, n.y ?? 0, 8, 0, 2 * Math.PI); // Generous hit area
            ctx.fillStyle = color;
            ctx.fill();
          }}
        />
      ) : null}
      
      {graphData.nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
           <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0ef] text-[#d8342b]">
              <LinkIcon className="h-8 w-8" />
           </div>
           <p className="text-base font-bold text-[#6e7fa6]">Twoja tablica jest pusta.</p>
           <p className="mt-1 text-sm font-bold text-[#a5b1ca]">Rozpocznij naukę z asystentem, aby budować sieć wiedzy.</p>
        </div>
      )}
    </div>
  );
};
