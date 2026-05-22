'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Brain, Loader2 } from 'lucide-react'
import { readJsonSafely } from '@/src/lib/http/json'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface ApiNode {
  id: string
  label: string
  type: string
}

interface ApiEdge {
  source: string
  target: string
  type: string
}

interface GraphNode extends ApiNode {
  color: string
}

interface GraphLink {
  source: string
  target: string
  type: string
}

interface KnowledgeGraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

const typeColors: Record<string, string> = {
  CONCEPT: '#7057ff',
  DEFINITION: '#20b981',
  EXAMPLE: '#ffb84d',
  EXERCISE: '#ff5144',
  THEOREM: '#06296b',
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
  const [data, setData] = useState<KnowledgeGraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 800, height: 600 })

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
        const res = await fetch(`/api/books/${bookId}/graph`)
        const graph = await readJsonSafely<{ nodes?: ApiNode[]; edges?: ApiEdge[] }>(res)
        if (cancelled) return

        setData({
          nodes: (graph?.nodes || []).map((node) => ({
            id: node.id,
            label: node.label,
            type: node.type,
            color: typeColors[node.type] || '#7057ff',
          })),
          links: (graph?.edges || []).map((edge) => ({
            source: edge.source,
            target: edge.target,
            type: edge.type,
          })),
        })
      } catch {
        if (!cancelled) setData({ nodes: [], links: [] })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadGraph()

    return () => {
      cancelled = true
    }
  }, [bookId])

  if (loading) {
    return (
      <div ref={containerRef} className="flex h-full items-center justify-center rounded-[26px] bg-[#fffefb]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#7057ff]" />
          <p className="mt-3 text-sm font-extrabold text-[#6e7fa6]">Buduję graf wiedzy...</p>
        </div>
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
          Przetwarzanie materiału może potrwać kilka minut. Wróć tu za chwilę, kiedy AI
          skończy czytać plik.
        </p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full w-full rounded-[26px] bg-[#fffefb]">
      <ForceGraph2D
        graphData={data}
        nodeLabel="label"
        nodeColor="color"
        linkColor={() => '#dce7f5'}
        linkWidth={1.4}
        nodeRelSize={7}
        onNodeClick={(node) => {
          const nodeId = readNodeId(node)
          if (nodeId) onSelectNode?.(nodeId)
        }}
        width={dims.width}
        height={dims.height}
        backgroundColor="#fffefb"
      />
    </div>
  )
}
