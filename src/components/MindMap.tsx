'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Brain, ChevronRight, ChevronDown } from 'lucide-react'
import { readJsonSafely } from '@/src/lib/http/json'

interface TreeNode {
  id: string
  label: string
  type: string
  chunkId?: string
  children: TreeNode[]
}

const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
  root: { bg: '#06296b', text: '#ffffff', border: '#06296b' },
  CHAPTER: { bg: '#7057ff', text: '#ffffff', border: '#7057ff' },
  SECTION: { bg: '#f0edff', text: '#7057ff', border: '#7057ff' },
  CONCEPT: { bg: '#20b981', text: '#ffffff', border: '#20b981' },
  TASK: { bg: '#ff5144', text: '#ffffff', border: '#ff5144' },
  EXAMPLE: { bg: '#ffb84d', text: '#06296b', border: '#ffb84d' },
}

const typeIcons: Record<string, string> = {
  CHAPTER: '📑',
  SECTION: '📄',
  CONCEPT: '💡',
  TASK: '✏️',
  EXAMPLE: '📝',
  root: '📚',
}

export default function MindMap({ sessionId }: { sessionId: string }) {
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  async function loadTree() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${sessionId}/mindmap`)
      const data = await readJsonSafely<TreeNode>(res)
      setTree(data)
      const expandedIds = new Set<string>()
      if (data) expandInitial(data, expandedIds, 0)
      setExpanded(expandedIds)
    } catch {
      setTree(null)
    } finally {
      setLoading(false)
    }
  }

  async function generateAI() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${sessionId}/mindmap/generate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Błąd generowania')
      if (data.tree) {
        setTree(data.tree)
        const expandedIds = new Set<string>()
        expandInitial(data.tree, expandedIds, 0)
        setExpanded(expandedIds)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function init() {
      await loadTree()
      if (cancelled) return
    }
    init()
    return () => { cancelled = true }
  }, [sessionId])

  function expandInitial(node: TreeNode, ids: Set<string>, depth: number) {
    if (depth <= 2) {
      ids.add(node.id)
      for (const child of node.children) {
        expandInitial(child, ids, depth + 1)
      }
    }
  }

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  if (generating) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] bg-[#fffefb] p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#20b981]" />
        <p className="mt-4 font-bold text-[#6e7fa6]">AI generuje mapę myśli...</p>
        <p className="mt-2 text-sm text-[#a5b1ca]">To może potrwać do 15 sekund</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] bg-[#fffefb] p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#7057ff]" />
        <p className="mt-4 font-bold text-[#6e7fa6]">Buduję mapę myśli...</p>
      </div>
    )
  }

  if (!tree || tree.children.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] bg-[#fffefb] text-center p-8">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#f0edff] text-[#7057ff]">
          <Brain className="h-10 w-10" strokeWidth={2.7} />
        </div>
        <p className="font-display text-3xl leading-none text-[#06296b]">Mapa myśli jest pusta</p>
        <p className="mt-3 max-w-md text-sm font-bold leading-6 text-[#6e7fa6]">
          Wygeneruj mapę myśli za pomocą AI, aby zobaczyć hierarchiczną strukturę materiału.
        </p>
        {error && (
          <p className="mt-3 rounded-xl bg-[#fff0ef] px-3 py-1 text-sm font-bold text-[#d8342b]">{error}</p>
        )}
        <button
          onClick={generateAI}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#7057ff] px-5 py-3 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
        >
          <Brain className="h-4 w-4" />
          Generuj mapę myśli AI
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-[32px] bg-[#fffefb] p-6 overflow-auto max-h-[70vh]">
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#dce7f5] bg-[#f0edff] px-4 py-2 text-sm font-extrabold text-[#7057ff]">
          <Brain className="h-4 w-4" />
          Mapa myśli
        </div>
        <button
          onClick={generateAI}
          disabled={generating}
          className="inline-flex items-center gap-1 rounded-xl bg-[#eafff4] px-3 py-2 text-xs font-bold text-[#11805e] hover:bg-[#d4f5e6] disabled:opacity-50"
        >
          <Loader2 className={`h-3 w-3 ${generating ? 'animate-spin' : 'hidden'}`} />
          <Brain className={`h-3 w-3 ${generating ? 'hidden' : ''}`} />
          Regeneruj AI
        </button>
      </div>
      <MindMapNodeItem
        node={tree}
        expanded={expanded}
        onToggle={toggleExpand}
        depth={0}
        isRoot
      />
    </div>
  )
}

function MindMapNodeItem({
  node,
  expanded,
  onToggle,
  depth,
  isRoot,
}: {
  node: TreeNode
  expanded: Set<string>
  onToggle: (id: string) => void
  depth: number
  isRoot?: boolean
}) {
  const isExpanded = expanded.has(node.id)
  const hasChildren = node.children.length > 0
  const style = typeStyles[node.type] || typeStyles.SECTION
  const icon = typeIcons[node.type] || '📄'

  return (
    <div className="ml-0">
      <div
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 mb-2 transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
          isRoot ? 'text-lg' : 'text-sm'
        }`}
        style={{
          backgroundColor: style.bg,
          color: style.text,
          border: `2px solid ${style.border}`,
          marginLeft: `${depth * 28}px`,
          maxWidth: `calc(100% - ${depth * 28}px)`,
        }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )
        ) : (
          <span className="w-4 flex-shrink-0 text-center">{icon}</span>
        )}
        <span className="font-bold leading-tight flex-1">{node.label}</span>
        <span className="text-xs opacity-70 font-medium uppercase tracking-wider">
          {node.type === 'root' ? '' : node.type}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <MindMapNodeItem
              key={child.id}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
