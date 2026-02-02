export default function Schedule() {

    const currentDayOfWeek = (new Date()).getDay();
    const times = ['8:30', '9:30', '10:30', '11:30', '12:30', 'ערב'];
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'סופ״ש'];

    return (
        <table className="table-fixed border-collapse w-full h-full">
            <thead>
                <tr>
                    {days.map((day) => (
                        <th key={day} className="border border-gray-300 w-1/6 p-2">{day}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {times.map((time,index) => (
                    <ScheduleRow key={time} time={time} isToday={index === currentDayOfWeek}/>
                ))}
            </tbody>
        </table>
    )
}

function ScheduleRow({time}) {
    return (
        <tr>
            <Cell time={time}/>
            <Cell time={time}/>
            <Cell time={time}/>
            <Cell time={time}/>
            <Cell time={time}/>
            <Cell time={time}/>
        </tr>
    )
}

function Cell({time, children}) {
    return (
        <td className="border border-gray-300 w-1/6 h-24 align-top p-2">
            <div className='text-xs opacity-50'>{time}</div>
            {children}
        </td>
    )
}