'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/utils/store/useUser'
import { FileText, Briefcase, ExternalLink, Pencil, Check, X } from 'lucide-react'

/** Convert a Google Docs / Drive URL to its embeddable /preview form. */
function getGooglePreviewUrl(url) {
    if (!url) return null
    // Match docs.google.com/document/d/{ID}  or  drive.google.com/file/d/{ID}
    const match = url.match(/(docs\.google\.com\/document\/d\/[^/]+|drive\.google\.com\/file\/d\/[^/]+)/)
    if (match) return `https://${match[1]}/preview`
    return null
}

function StatusBadge({ exists }) {
    if (exists) {
        return (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                מעודכן
            </span>
        )
    }
    return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-300">
            חסר
        </span>
    )
}

function LinkCard({ label, Icon, url, onSave, previewMode = 'thumbnail' }) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(url || '')

    useEffect(() => {
        setDraft(url || '')
    }, [url])

    const handleSave = () => {
        onSave(draft.trim())
        setEditing(false)
    }

    const handleCancel = () => {
        setDraft(url || '')
        setEditing(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave()
        if (e.key === 'Escape') handleCancel()
    }

    const googlePreviewUrl = previewMode === 'iframe' ? getGooglePreviewUrl(url) : null

    return (
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-stone-300 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-stone-200 bg-stone-50/60">
                <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-stone-500" />
                    <span className="text-xs font-medium text-stone-600">{label}</span>
                </div>
                <StatusBadge exists={!!url} />
            </div>

            {/* URL row */}
            <div className="px-3 py-1.5 flex items-center gap-1.5 min-h-[32px]">
                {editing ? (
                    <>
                        <input
                            type="url"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            dir="ltr"
                            placeholder="https://..."
                            className="flex-1 min-w-0 text-xs bg-transparent border-b border-stone-300 focus:border-primary outline-none py-0.5 text-left"
                        />
                        <button onClick={handleSave} className="p-0.5 rounded hover:bg-emerald-50 text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleCancel} className="p-0.5 rounded hover:bg-red-50 text-red-500">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </>
                ) : (
                    <>
                        {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer"
                                className="flex-1 min-w-0 text-xs text-primary truncate hover:underline text-left" dir="ltr">
                                {url}
                            </a>
                        ) : (
                            <span className="flex-1 text-xs text-stone-400">לא הוזן קישור</span>
                        )}
                        <button onClick={() => setEditing(true)} className="p-0.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600">
                            <Pencil className="w-3 h-3" />
                        </button>
                        {url && (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="p-0.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600">
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </>
                )}
            </div>

            {/* Preview */}
            {url && googlePreviewUrl && (
                <div className="border-t border-stone-200 flex-1 min-h-0 overflow-hidden">
                    <iframe
                        src={googlePreviewUrl}
                        title={label}
                        className="w-full h-[120px] border-none"
                    />
                </div>
            )}
            {url && !googlePreviewUrl && (
                <div className="border-t border-stone-200 bg-stone-50 flex-1 min-h-0 overflow-hidden">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                            src={`/api/thumbnail?url=${encodeURIComponent(url)}`}
                            alt={label}
                            className="w-full h-[120px] object-cover object-top"
                            loading="lazy"
                        />
                    </a>
                </div>
            )}
        </div>
    )
}

export default function CvPortfolioCards() {
    const user = useUser(state => state.user)
    const updateCvUrl = useUser(state => state.updateCvUrl)
    const updatePortfolioUrl = useUser(state => state.updatePortfolioUrl)

    return (
        <div className="flex gap-3 mb-3" style={{ maxHeight: '200px' }}>
            <LinkCard
                label="קורות חיים"
                Icon={FileText}
                url={user?.cv_url}
                onSave={updateCvUrl}
                previewMode="iframe"
            />
            <LinkCard
                label="תיק עבודות"
                Icon={Briefcase}
                url={user?.portfolio_url}
                onSave={updatePortfolioUrl}
                previewMode="thumbnail"
            />
        </div>
    )
}
