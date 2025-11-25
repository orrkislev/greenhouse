import Avatar from "@/components/Avatar";

export function StudentCard({ student, onSelect, selected }) {

    return (
        <div className={`flex flex-col p-4 justify-start items-center gap-2 bg-muted rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer border border-border hover:bg-primary-100 ${selected ? 'bg-primary-200 hover:bg-accent' : ''}`}
            onClick={onSelect}>
            <Avatar user={student} />
            <p className="text-sm font-medium text-foreground truncate">
                {student.first_name} {student.last_name}
            </p>
        </div>
    );
}