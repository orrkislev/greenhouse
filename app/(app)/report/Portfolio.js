'use client'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/utils/store/useUser'
import Button from '@/components/Button'
import Box2 from '@/components/Box2'
import { Briefcase } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function Portfolio({ portfolio }) {
    const user = useUser(state => state.user)
    const updatePortfolioUrl = useUser(state => state.updatePortfolioUrl)

    const [portfolioUrl, setPortfolioUrl] = useState(portfolio?.url || user?.portfolio_url || '')
    const [savedUrl, setSavedUrl] = useState(user?.portfolio_url || '')

    useEffect(() => {
        setPortfolioUrl(portfolio?.url || user?.portfolio_url || '')
        setSavedUrl(user?.portfolio_url || '')
    }, [portfolio, user])

    const shouldSave = useMemo(() => {
        return portfolioUrl !== savedUrl
    }, [portfolioUrl, savedUrl])

    const handleSave = async () => {
        await updatePortfolioUrl(portfolioUrl)
    }

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
                        <QRCodeSVG value={savedUrl} size={150} />
                    </div>
                )}
            </div>

            <Button
                data-role="save"
                onClick={handleSave}
                disabled={!shouldSave}
                className="mt-3"
            >
                שמור
            </Button>
        </Box2>
    )
}
