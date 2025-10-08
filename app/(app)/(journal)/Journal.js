import { useLogs } from "@/utils/store/useLogs"

export default function Journal() {
    const logs = useLogs()

    return (
        <div>
            {logs
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map(log => (
                <div key={log.id} className='border border-stone-300 p-2 rounded-md'>
                    <div className='text-xs text-stone-500'>{new Date(log.created_at).toLocaleString('he-IL', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                    })}</div>
                    <h2 className=''>
                        {log.text}
                        {log.context && (
                            <span className='text-sm text-stone-500'>({log.context.title})</span>
                        )}
                        {log.mentor && (
                            <span className='text-sm text-stone-500'>({log.mentor.first_name} {log.mentor.last_name})</span>
                        )}
                    </h2>
                </div>
            ))}
        </div>
    )
}