'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Brain, Loader2, Search, Filter, Download, X } from 'lucide-react'
import { readJsonSafely } from '@/src/lib/http/json'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface ApiNode {
  id: string
  label: string
  type: string
  highlighted?: boolean
}

interface ApiEdge {
  source: string
  target: string
  type: string
  highlighted?: boolean
  weight?: number
}

interface GraphNode extends ApiNode {
  color: string
  x?: number
  y?: number
}

interface GraphData {
  nodes: GraphNode[]
  links: ApiEdge[]
}

interface GeneratedGraphResponse {
  graph?: {
    nodes?: ApiNode[]
    edges?: ApiEdge[]
  }
  error?: string
}

interface ForceGraphHandle {
  centerAt: (x?: number, y?: number, ms?: number) => void
  zoom: (k: number, ms?: number) => void
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
}

const allNodeTypes = ['CONCEPT', 'TASK', 'SECTION', 'DEFINITION', 'EXAMPLE', 'THEOREM']

const edgeColors: Record<string, string> = {
  DEPENDS_ON: '#ff5144',
  PART_OF: '#20b981',
  SIMILAR: '#7057ff',
  NEXT: '#a5b1ca',
}

function readNodeId(node: unknown) {
  if (typeof node !== 'object' || node === null || !('id' in node)) return null
  const id = (node as { id?: unknown }).id
  return typeof id === 'string' ? id : null
}

export default function KnowledgeGraph({
  bookId,
  onSelectNode,
}: {
  bookId: string
  onSelectNode?: (id: string) => void
}) {
  const [data, setData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<ForceGraphHandle | null>(null)
  const [dims, setDims] = useState({ width: 800, height: 600 })
  const [showFilters, setShowFilters] = useState(false)

  async function generateAI() {
    setGenerating(true)
    setGenError('')
    try {
      const res = await fetch(`/api/sessions/${bookId}/graph/enrich`, { method: 'POST' })
      const data = await readJsonSafely<GeneratedGraphResponse>(res)
      if (!res.ok) throw new Error(data?.error || 'Błąd generowania')
      if (data.graph) {
        const nodes: GraphNode[] = (data.graph.nodes || []).map((node) => ({
          ...node,
          color: typeColors[node.type] || '#6e7fa6',
        }))
        const links = data.graph.edges || []
        setData({ nodes, links })
        setGenError('')
      }
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : 'Błąd generowania')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function updateDims() {
      if (!container) return
      const rect = container.getBoundingClientRect()
      setDims({
        width: Math.max(320, Math.floor(rect.width)),
        height: Math.max(420, Math.floor(rect.height)),
      })
    }

    updateDims()
    const observer = new ResizeObserver(updateDims)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadGraph() {
      try {
        const typesParam = selectedTypes.size > 0
          ? `?types=${Array.from(selectedTypes).join(',')}`
          : ''
        const highlightParam = highlightNodeId ? `${typesParam ? '&' : '?'}highlight=${highlightNodeId}` : ''

        const res = await fetch(`/api/books/${bookId}/graph${typesParam}${highlightParam}`)
        const graph = await readJsonSafely<{
          nodes?: ApiNode[]
          edges?: ApiEdge[]
          highlightedNodeIds?: string[]
        }>(res)
        if (cancelled) return

        setData({
          nodes: (graph?.nodes || []).map((node) => ({
            id: node.id,
            label: node.label,
            type: node.type,
            color: node.highlighted ? '#ffb84d' : (typeColors[node.type] || '#7057ff'),
          })),
          links: (graph?.edges || []).map((edge) => ({
            source: edge.source,
            target: edge.target,
            type: edge.type,
            highlighted: edge.highlighted,
            weight: edge.weight,
          })),
        })
      } catch {
        if (!cancelled) setData({ nodes: [], links: [] })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadGraph()
    return () => { cancelled = true }
  }, [bookId, selectedTypes, highlightNodeId])

  const toggleType = useCallback((type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !data) return
    const found = data.nodes.find(n =>
      n.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (found && graphRef.current) {
      graphRef.current.centerAt(found.x, found.y, 1000)
      graphRef.current.zoom(3, 1000)
    }
  }, [searchQuery, data])

  const handleNodeClick = useCallback((node: unknown) => {
    const nodeId = readNodeId(node)
    if (!nodeId) return

    // Toggle path highlighting
    if (highlightNodeId === nodeId) {
      setHighlightNodeId(null)
    } else {
      setHighlightNodeId(nodeId)
    }

    onSelectNode?.(nodeId)
  }, [highlightNodeId, onSelectNode])

  const handleExportJSON = useCallback(() => {
    if (!data) return
    const json = JSON.stringify({ nodes: data.nodes, links: data.links }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `graph-${bookId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [data, bookId])

  const handleExportPNG = useCallback(() => {
    if (!containerRef.current) return
    const canvas = containerRef.current.querySelector('canvas')
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `graph-${bookId}.png`
      a.click()
    }
  }, [bookId])

  if (loading) {
    return (
      <div ref={containerRef} className="flex h-full flex-col items-center justify-center rounded-[26px] bg-[#fffefb]">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#7057ff]" />
        <p className="mt-3 text-sm font-extrabold text-[#6e7fa6]">Buduję graf wiedzy...</p>
      </div>
    )
  }

  if (generating) {
    return (
      <div ref={containerRef} className="flex h-full flex-col items-center justify-center rounded-[26px] bg-[#fffefb] text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#20b981]" />
        <p className="mt-3 text-sm font-extrabold text-[#6e7fa6]">AI generuje graf wiedzy...</p>
        <p className="mt-2 text-xs text-[#a5b1ca]">To może potrwać do 15 sekund</p>
      </div>
    )
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div ref={containerRef} className="flex h-full flex-col items-center justify-center rounded-[26px] bg-[#fffefb] text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#f0edff] text-[#7057ff]">
          <Brain className="h-10 w-10" strokeWidth={2.7} />
        </div>
        <p className="font-display text-3xl leading-none text-[#06296b]">Graf wiedzy jest pusty</p>
        <p className="mt-3 max-w-md text-sm font-bold leading-6 text-[#6e7fa6]">
          Nie udało się jeszcze zbudować grafu automatycznie. Możesz wymusić ponowną analizę AI, aby zobaczyć pojęcia i ich powiązania.
        </p>
        {genError && (
          <p className="mt-3 rounded-xl bg-[#fff0ef] px-3 py-1 text-sm font-bold text-[#d8342b]">{genError}</p>
        )}
        <button
          onClick={generateAI}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#7057ff] px-5 py-3 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
        >
          <Brain className="h-4 w-4" />
          Generuj graf AI
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-1 rounded-2xl bg-white shadow-md border border-[#dce7f5] px-3 py-2">
          <Search className="h-4 w-4 text-[#6e7fa6]" />
          <input
            type="text"
            placeholder="Szukaj węzła..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-36 bg-transparent text-sm font-bold text-[#06296b] outline-none placeholder:text-[#6e7fa6]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X className="h-3 w-3 text-[#6e7fa6]" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-bold shadow-md border ${
            showFilters || selectedTypes.size > 0
              ? 'bg-[#7057ff] text-white border-[#7057ff]'
              : 'bg-white text-[#6e7fa6] border-[#dce7f5]'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filtry
          {selectedTypes.size > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-[#7057ff]">
              {selectedTypes.size}
            </span>
          )}
        </button>

        {/* Highlight indicator */}
        {highlightNodeId && (
          <button
            onClick={() => setHighlightNodeId(null)}
            className="flex items-center gap-1 rounded-2xl bg-[#ffb84d] text-white px-3 py-2 text-sm font-bold shadow-md border border-[#ffb84d]"
          >
            <X className="h-3 w-3" />
            Wyczyść ścieżkę
          </button>
        )}

        {/* Export */}
        <button
          onClick={generateAI}
          disabled={generating}
          className="flex items-center gap-1 rounded-2xl bg-[#eafff4] text-[#11805e] px-3 py-2 text-sm font-bold shadow-md border border-[#20b981] disabled:opacity-50"
          title="Generuj graf AI"
        >
          <Brain className={`h-4 w-4 ${generating ? 'animate-pulse' : ''}`} />
          AI
        </button>
        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1 rounded-2xl bg-white text-[#6e7fa6] px-3 py-2 text-sm font-bold shadow-md border border-[#dce7f5] ml-auto"
          title="Eksportuj JSON"
        >
          <Download className="h-4 w-4" />
          JSON
        </button>
        <button
          onClick={handleExportPNG}
          className="flex items-center gap-1 rounded-2xl bg-white text-[#6e7fa6] px-3 py-2 text-sm font-bold shadow-md border border-[#dce7f5]"
          title="Eksportuj PNG"
        >
          <Download className="h-4 w-4" />
          PNG
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 rounded-2xl border border-[#dce7f5] bg-white/95 px-3 py-2 shadow-md">
        {Object.entries(edgeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-xs font-bold text-[#6e7fa6]">
            <span className="block h-[3px] w-6 rounded-full" style={{ backgroundColor: color }} />
            {type}
          </div>
        ))}
      </div>

      {/* Type filter panel */}
      {showFilters && (
        <div className="absolute top-14 left-3 z-10 rounded-2xl bg-white shadow-lg border border-[#dce7f5] p-3 flex flex-wrap gap-2 max-w-[300px]">
          {allNodeTypes.map(type => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                selectedTypes.has(type)
                  ? 'text-white shadow-sm'
                  : 'bg-[#f6f4ef] text-[#6e7fa6]'
              }`}
              style={selectedTypes.has(type) ? { backgroundColor: typeColors[type] || '#7057ff' } : {}}
            >
              {type}
            </button>
          ))}
          {selectedTypes.size > 0 && (
            <button
              onClick={() => setSelectedTypes(new Set())}
              className="rounded-xl px-3 py-1.5 text-xs font-bold bg-[#ff5144] text-white"
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      )}

      {/* Graph */}
      <div ref={containerRef} className="h-full w-full rounded-[26px] bg-[#fffefb]">
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeLabel="label"
          nodeColor="color"
          linkColor={(link: ApiEdge) => link.highlighted ? '#ffb84d' : (edgeColors[link.type] || '#dce7f5')}
          linkWidth={(link: ApiEdge) => link.highlighted ? 3 : Math.max(1.5, (link.weight || 0.6) * 3)}
          nodeRelSize={7}
          onNodeClick={handleNodeClick}
          width={dims.width}
          height={dims.height}
          backgroundColor="#fffefb"
        />
      </div>
    </div>
  )
}
