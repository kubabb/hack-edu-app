'use client'

import { useEffect, useState, useCallback } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Loader2, Brain, ChevronRight, ChevronDown, BookOpen, Network, Sparkles, StickyNote, FileText } from 'lucide-react'
import { readJsonSafely } from '@/src/lib/http/json'

interface TreeNode {
  id: string
  label: string
  type: string
  chunkId?: string
  children: TreeNode[]
}

interface TreeResponse {
  tree?: TreeNode
  error?: string
}

const typeStyles: Record<
  string,
  {
    bg: string
    text: string
    border: string
    shadow: string
    iconBg: string
    iconColor: string
    badgeBg: string
    badgeText: string
    icon: LucideIcon
  }
> = {
  root: {
    bg: '#fff8eb',
    text: '#06296b',
    border: '#f6dec0',
    shadow: '0 10px 24px rgba(6, 41, 107, 0.08)',
    iconBg: '#fff4cf',
    iconColor: '#ff5144',
    badgeBg: '#ffffff',
    badgeText: '#8d6d3e',
    icon: BookOpen,
  },
  CHAPTER: {
    bg: '#f7f4ff',
    text: '#5f48d7',
    border: '#ddd3ff',
    shadow: '0 8px 20px rgba(112, 87, 255, 0.08)',
    iconBg: '#efeaff',
    iconColor: '#7057ff',
    badgeBg: '#ffffff',
    badgeText: '#7057ff',
    icon: Brain,
  },
  SECTION: {
    bg: '#fffefb',
    text: '#35507f',
    border: '#dce7f5',
    shadow: '0 8px 18px rgba(6, 41, 107, 0.05)',
    iconBg: '#f3f6ff',
    iconColor: '#6e7fa6',
    badgeBg: '#f7f9fc',
    badgeText: '#6e7fa6',
    icon: FileText,
  },
  CONCEPT: {
    bg: '#eefaf5',
    text: '#11805e',
    border: '#cfeedd',
    shadow: '0 8px 18px rgba(32, 185, 129, 0.08)',
    iconBg: '#e3f7ee',
    iconColor: '#20b981',
    badgeBg: '#ffffff',
    badgeText: '#11805e',
    icon: Sparkles,
  },
  TASK: {
    bg: '#fff4ef',
    text: '#d8342b',
    border: '#ffd8d2',
    shadow: '0 8px 18px rgba(255, 81, 68, 0.08)',
    iconBg: '#ffe8e3',
    iconColor: '#ff5144',
    badgeBg: '#ffffff',
    badgeText: '#d8342b',
    icon: StickyNote,
  },
  EXAMPLE: {
    bg: '#fff8eb',
    text: '#b85a00',
    border: '#ffe3b9',
    shadow: '0 8px 18px rgba(255, 184, 77, 0.08)',
    iconBg: '#fff0cf',
    iconColor: '#ffb84d',
    badgeBg: '#ffffff',
    badgeText: '#b85a00',
    icon: Network,
  },
}

function expandInitialTree(node: TreeNode, ids: Set<string>, depth: number) {
  if (depth <= 2) {
    ids.add(node.id)
    for (const child of node.children) {
      expandInitialTree(child, ids, depth + 1)
    }
  }
}

async function fetchMindMapTree(sessionId: string) {
  const res = await fetch(`/api/sessions/${sessionId}/mindmap`)
  const data = await readJsonSafely<TreeNode>(res)
  return data
}

export default function MindMap({ sessionId }: { sessionId: string }) {
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  async function generateAI() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${sessionId}/mindmap/generate`, { method: 'POST' })
      const data = await readJsonSafely<TreeResponse>(res)
      if (!res.ok) throw new Error(data?.error || 'Błąd generowania')
      if (data.tree) {
        setTree(data.tree)
        const expandedIds = new Set<string>()
        expandInitialTree(data.tree, expandedIds, 0)
        setExpanded(expandedIds)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Błąd generowania')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const data = await fetchMindMapTree(sessionId)
        if (!active) return
        setTree(data)
        setError('')
        const expandedIds = new Set<string>()
        if (data) expandInitialTree(data, expandedIds, 0)
        setExpanded(expandedIds)
      } catch {
        if (!active) return
        setTree(null)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [sessionId])

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
    <div className="max-h-[70vh] overflow-auto rounded-[32px] bg-[#fffefb] p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#dce7f5] bg-[#f7f4ff] px-4 py-2 text-sm font-extrabold text-[#7057ff]">
          <Brain className="h-4 w-4" strokeWidth={2.4} />
          Mapa myśli
        </div>
        <button
          onClick={generateAI}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-full border border-[#d7efe5] bg-[#f3fbf8] px-4 py-2 text-xs font-bold text-[#11805e] transition-colors hover:bg-[#ebf8f3] disabled:opacity-50"
        >
          <Loader2 className={`h-3 w-3 ${generating ? 'animate-spin' : 'hidden'}`} />
          <Brain className={`h-3 w-3 ${generating ? 'hidden' : ''}`} strokeWidth={2.4} />
          Regeneruj AI
        </button>
      </div>
      <div className="rounded-[28px] border border-[#eef2f7] bg-[linear-gradient(180deg,#fffefb_0%,#fcfdff_100%)] p-4 md:p-5">
        <MindMapNodeItem
          node={tree}
          expanded={expanded}
          onToggle={toggleExpand}
          depth={0}
          isRoot
        />
      </div>
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
  const Icon = style.icon
  const typeLabel = node.type === 'root' ? 'TEMAT GLOWNY' : node.type.replace('_', ' ')

  return (
    <div className="relative ml-0">
      {!isRoot && (
        <div
          className="absolute top-0 bottom-0 w-px rounded-full bg-[#e9edf5]"
          style={{ left: `${depth * 26 - 12}px` }}
        />
      )}
      <div
        className={`mb-3 flex cursor-pointer items-center gap-3 rounded-[24px] px-4 py-3.5 transition-all hover:-translate-y-0.5 ${
          isRoot ? 'text-lg md:text-xl' : 'text-sm md:text-[15px]'
        }`}
        style={{
          backgroundColor: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
          boxShadow: style.shadow,
          marginLeft: `${depth * 26}px`,
          maxWidth: `calc(100% - ${depth * 26}px)`,
        }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px]"
          style={{ backgroundColor: style.iconBg, color: style.iconColor }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" strokeWidth={2.6} />
            ) : (
              <ChevronRight className="h-4 w-4" strokeWidth={2.6} />
            )
          ) : (
            <Icon className="h-4 w-4" strokeWidth={2.4} />
          )}
        </div>
        <span className="flex-1 font-extrabold leading-tight">{node.label}</span>
        {!isRoot && (
          <span
            className="rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em]"
            style={{ backgroundColor: style.badgeBg, color: style.badgeText }}
          >
            {typeLabel}
          </span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="pb-1">
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
