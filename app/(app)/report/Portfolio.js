'use client'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/utils/store/useUser'
import Box2 from '@/components/Box2'
import { Briefcase } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import AutoSaveIndicator from './components/AutoSaveIndicator'
import { useSaveOnUnmount } from '@/utils/useSaveOnUnmount'

const normalizeUrl = url => url && !/^https?:\/\//i.test(url) ? `https://${url}` : url

export default function Portfolio({ portfolio }) {
    const user = useUser(state => state.user)
    const updatePortfolioUrl = useUser(state => state.updatePortfolioUrl)

    const [portfolioUrl, setPortfolioUrl] = useState(portfolio || user?.portfolio_url || '')
    const [savedUrl, setSavedUrl] = useState(portfolio || user?.portfolio_url || '')

    useEffect(() => {
        const url = portfolio || user?.portfolio_url || ''
        setPortfolioUrl(url)
        setSavedUrl(url)
    }, [portfolio, user?.portfolio_url])

    const shouldSave = useMemo(() => {
        return portfolioUrl !== savedUrl
    }, [portfolioUrl, savedUrl])

    useEffect(() => {
        if (!shouldSave) return;
        const timer = setTimeout(() => {
            updatePortfolioUrl(portfolioUrl);
            setSavedUrl(portfolioUrl);
        }, 800);
        return () => clearTimeout(timer);
    }, [shouldSave, portfolioUrl]);

    useSaveOnUnmount(() => shouldSave, () => portfolioUrl, updatePortfolioUrl);

    return (
        <Box2 label="פורטפוליו" LabelIcon={Briefcase}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">כתובת הפורטפוליו</label>
                    <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://example.com/portfolio"
                        className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                {savedUrl && (
                    <div className="border border-border rounded-lg p-4 bg-gray-50 flex flex-col items-center">
                        <a href={normalizeUrl(savedUrl)} target="_blank" rel="noopener noreferrer">
                            <QRCodeSVG value={savedUrl} size={150} />
                        </a>
                    </div>
                )}
            </div>

            <AutoSaveIndicator isDirty={shouldSave} canEdit={true} />
        </Box2>
    )
}
