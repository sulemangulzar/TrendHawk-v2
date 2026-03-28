import { useEffect, useState } from 'react'
import { getSaved, deleteSaved, addTracked, getUsage } from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import {
  Bookmark, Trash2, ExternalLink, Package, ShieldCheck, RefreshCw,
  TrendingUp, PenLine, Check, X, Plus
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

// ── Cache ─────────────────────────────────────────────────────────────────────
let savedCache = null
let usageCache = { savedCount: 0, savedLimit: 5 }

// ── Editable note ─────────────────────────────────────────────────────────────
function NoteField({ initialNote, onSave }) {
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState(initialNote || '')

  const handleSave = () => {
    onSave(note)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex gap-2 mt-3">
        <input
          autoFocus
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
          className="flex-1 bg-[var(--bg)] border border-[var(--lime-border)] rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text)] outline-none placeholder:text-[var(--text3)]"
          placeholder="Add a note..."
          maxLength={120}
        />
        <button
          onClick={handleSave}
          className="p-1.5 bg-[var(--lime)] text-black rounded-lg hover:opacity-90"
        >
          <Check size={12} />
        </button>
        <button
          onClick={() => setEditing(false)}
          className="p-1.5 bg-[var(--hover-bg)] border border-[var(--border)] text-[var(--text3)] rounded-lg hover:text-[var(--text)]"
        >
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 mt-3 text-[10px] text-[var(--text3)] hover:text-[var(--text)] transition-colors font-medium group/note"
    >
      <PenLine size={10} className="opacity-50 group-hover/note:opacity-100" />
      {note ? <span className="italic truncate max-w-[160px]">"{note}"</span> : 'Add note...'}
    </button>
  )
}

// ── Product Card ──────────────────────────────────────────────────────────────
function SavedCard({ product: p, onDelete, onTrack }) {
  const [note, setNote] = useState((p.raw_data?.notes) || '')

  const handleNoteSave = (newNote) => {
    setNote(newNote)
    // Optimistically update raw_data locally; no API call needed for notes in this release
    toast.success('Note saved', { duration: 1500 })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="group relative flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--lime-border)] transition-all duration-300 shadow-sm h-full"
    >
      {/* Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-[var(--border)] mb-5 p-4 flex items-center justify-center shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
        {p.image
          ? <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
          : <Package className="text-[var(--text3)]" size={32} strokeWidth={1} />
        }

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          {p.url && (
            <a
              href={p.url} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg flex items-center justify-center hover:bg-[var(--hover-bg)] transition-all shadow-md"
            >
              <ExternalLink size={16} />
            </a>
          )}
          <button
            onClick={() => onTrack(p)}
            className="w-10 h-10 bg-[var(--lime-dim)] border border-[var(--lime-border)] text-[var(--text)] rounded-lg flex items-center justify-center hover:bg-[var(--lime)] hover:text-black transition-all shadow-md"
            title="Start tracking"
          >
            <TrendingUp size={14} />
          </button>
          <button
            onClick={() => onDelete(p.id)}
            className="w-10 h-10 bg-[var(--text)] text-[var(--bg)] rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-md"
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Trend badge overlay */}
        {p.trend_score > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--text)] text-[var(--bg)] text-[8px] font-bold">
              <TrendingUp size={8} /> {p.trend_score}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <h3
          className="text-sm font-bold text-[var(--text)] line-clamp-2 leading-tight mb-2 min-h-[2.5rem]"
          title={p.title}
        >
          {p.title}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight border ${
            p.platform === 'ebay'
              ? 'bg-[var(--lime-dim)] text-[var(--text)] border-[var(--lime-border)]'
              : 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
          }`}>
            {p.platform}
          </span>
          <span className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-tight shrink-0">
            {new Date(p.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Editable note */}
        <NoteField initialNote={note} onSave={handleNoteSave} />

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--border)] mt-4">
          <span className="text-xl font-bold text-[var(--text)] tracking-tight tabular-nums">
            <span className="text-[var(--text3)] text-xs mr-0.5">$</span>{p.price?.toFixed(2) || '0.00'}
          </span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--hover-bg)] border border-[var(--border)]">
            <ShieldCheck size={12} className="text-[var(--lime)]" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider">Secured</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Saved() {
  const [products, setProducts] = useState(savedCache || [])
  const [usage, setUsage] = useState(usageCache)
  const [loading, setLoading] = useState(!savedCache)

  const load = () => {
    if (!savedCache) setLoading(true)
    Promise.all([getSaved(), getUsage()])
      .then(([s, u]) => {
        savedCache = s.products || []
        usageCache = u
        setProducts(savedCache)
        setUsage(usageCache)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Permanently remove this asset from your vault?')) return
    await deleteSaved(id).catch(() => {})
    toast.success('Asset Purged')
    savedCache = null
    load()
  }

  const handleTrack = async (product) => {
    try {
      await addTracked({
        title: product.title,
        price: product.price,
        image: product.image,
        url: product.url,
        platform: product.platform,
        trend_score: product.trend_score || 0,
      })
      toast.success('✅ Now Tracking Product')
    } catch {
      toast.error('Tracking limit reached')
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12 font-poppins">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Intelligence Vault</h1>
          <p className="text-[var(--text2)] mt-1">Your secure repository of high-velocity marketplace opportunities.</p>
        </div>

        {/* Vault capacity meter */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4 shadow-sm min-w-[280px]">
          <div className="w-10 h-10 rounded-lg bg-[var(--lime-dim)] flex items-center justify-center text-[var(--text)]">
            <Bookmark size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-wider">Vault Capacity</span>
              <span className="text-xs font-bold text-[var(--text)]">{products.length} / {usage.savedLimit || 5}</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--lime)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((products.length / (usage.savedLimit || 5)) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="py-32 text-center flex flex-col items-center justify-center">
          <RefreshCw size={32} className="animate-spin text-[var(--text3)] opacity-20 mb-4" />
          <span className="text-xs font-bold tracking-widest text-[var(--text3)] uppercase">Synchronizing Archives...</span>
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl"
        >
          <Bookmark size={48} className="mx-auto text-[var(--text3)] opacity-20 mb-6" />
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">Vault Archives Empty</h3>
          <p className="text-[var(--text3)] max-w-sm mx-auto text-sm italic">
            Analyze marketplace breakthroughs to start populating your secure intelligence repository.
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5"
        >
          <AnimatePresence>
            {products.map(p => (
              <SavedCard
                key={p.id}
                product={p}
                onDelete={handleDelete}
                onTrack={handleTrack}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
