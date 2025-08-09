import Avatar from "@/components/Avatar";

export function StudentCard({ student, onSelect, selected }) {
    return (
        <div className={`flex flex-col p-4 justify-start items-center gap-2 bg-stone-50 rounded-lg p-3 hover:bg-stone-100 transition-colors cursor-pointer border border-stone-200 ${selected ? 'bg-stone-100' : ''}`}
            onClick={onSelect}>
            <Avatar user={student} />
            <p className="text-sm font-medium text-stone-800 truncate">
                {student.firstName} {student.lastName}
            </p>
        </div>
    );
}