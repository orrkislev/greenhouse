export default function RatingBars({ rating }) {
    const barW = 5;
    const barGap = 3;
    const maxH = 20;
    const totalW = 5 * barW + 4 * barGap;
    const barsHeight = [4, 8, 12, 8, 4];

    return (
        <svg width={totalW} height={maxH} viewBox={`0 0 ${totalW} ${maxH}`} className="inline-block align-middle">
            {[1, 2, 3, 4, 5].map((i) => {
                const barH = barsHeight[i - 1];
                const x = (i - 1) * (barW + barGap);
                const y = maxH / 2 - barH / 2;
                const filled = rating && rating >= i;

                return (
                    <rect
                        key={i}
                        x={x}
                        y={y}
                        width={barW}
                        height={barH}
                        fill={filled ? '#1c1917' : '#e7e5e4'}
                        rx={1}
                    />
                );
            })}
        </svg>
    );
}