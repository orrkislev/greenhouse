import { NextResponse } from 'next/server'

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    try {
        const thumbUrl = `https://image.thum.io/get/width/600/${url}`
        const response = await fetch(thumbUrl, {
            headers: {
                // No Referer header — server-side request bypasses hotlink protection
                'User-Agent': 'Mozilla/5.0',
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch thumbnail' }, { status: 502 })
        }

        const contentType = response.headers.get('content-type') || 'image/png'
        const buffer = await response.arrayBuffer()

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
        })
    } catch (error) {
        return NextResponse.json({ error: 'Thumbnail generation failed' }, { status: 500 })
    }
}
