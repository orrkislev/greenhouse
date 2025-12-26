import { supabase } from "@/utils/supabase/client"
import { useTime, timeActions } from "@/utils/store/useTime";
import Button from "@/components/Button";
import { useEffect, useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function StaffGroup_Evaluations({ group }) {
    const terms = useTime(state => state.terms);
    const [data,setData] = useState([]);
    const [isLoading,setIsLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());

    useEffect(()=>{
        timeActions.loadTerms();
    },[]);

    useEffect(()=>{
        setData([]);
    },[group]);

    const toggleRow = (studentId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    const onClick = async (termId) => {
        setIsLoading(true);
        const {data: allProjects, error} = await supabase.rpc('group_projects', { p_group_id: group.id, p_term_id: termId });
        if (error) {
            console.error(error);
            setIsLoading(false);
            return;
        }
        setData(allProjects);
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col gap-2 border border-border p-4 sticky top-0">
            <h4 className="text-lg font-bold">משובים</h4>

            {terms.filter(t => new Date(t.end) < new Date()).map(term => (
                <Button key={term.id} onClick={() => onClick(term.id)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'תקופת ' + term.name}
                </Button>
            ))}

            {data && data.length > 0 && (
                <div className="flex flex-col gap-2">
                    <table className="w-full text-xs table-fixed">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-right p-2 font-medium w-1/6">שם חניך</th>
                                <th className="text-right p-2 font-medium w-1/6">פרויקט</th>
                                <th className="text-right p-2 font-medium w-1/6">מנחה</th>
                                <th className="text-right p-2 font-medium w-1/2">משוב</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(student => {
                                const hasProject = !!student.project;
                                const review = student.project?.metadata?.review;
                                const hasReview = review && review.summary && review.summary.trim();
                                const isExpanded = expandedRows.has(student.id);

                                return (
                                    <tr key={student.id} className="border-b border-border/50">
                                        <td className="p-2">{student.first_name} {student.last_name}</td>
                                        <td className="p-2">{student.project?.title || '-'}</td>
                                        <td className="p-2">{student.project?.master?.first_name || '-'}</td>
                                        <td className="p-2 w-1/2">
                                            {hasProject ? (
                                                hasReview ? (
                                                    <button
                                                        onClick={() => toggleRow(student.id)}
                                                        className="flex items-center gap-1 text-left hover:opacity-70 w-full text-right"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-3 h-3 flex-shrink-0" />
                                                        ) : (
                                                            <ChevronDown className="w-3 h-3 flex-shrink-0" />
                                                        )}
                                                        <span className={isExpanded ? "" : "line-clamp-1"}>
                                                            {review.summary}
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <span className="text-red-500 font-medium">אין משוב</span>
                                                )
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}