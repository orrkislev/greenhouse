import { supabase } from "@/utils/supabase/client"
import { useTime, timeActions } from "@/utils/store/useTime";
import Button from "@/components/Button";
import { useEffect, useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function StaffGroup_Evaluations({ group }) {
    const terms = useTime(state => state.terms);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [collapsedColumns, setCollapsedColumns] = useState({ project: false, research: false });

    useEffect(() => {
        timeActions.loadTerms();
    }, []);

    useEffect(() => {
        setData([]);
    }, [group]);

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

    const toggleColumnGroup = (group) => {
        setCollapsedColumns(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    };

    const onClick = async (termId) => {
        setIsLoading(true);
        const { data: allProjects, error } = await supabase.rpc('group_projects', { p_group_id: group.id, p_term_id: termId });
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
                    <table className="w-full text-xs table-auto">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-right p-2 font-medium" rowSpan="2">שם חניך</th>
                                <th
                                    className="text-right p-2 font-medium bg-blue-50 dark:bg-blue-950 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                                    colSpan={collapsedColumns.project ? 1 : 3}
                                    onClick={() => toggleColumnGroup('project')}
                                >
                                    <div className="flex items-center gap-2 justify-end">
                                        {collapsedColumns.project ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronUp className="w-4 h-4" />
                                        )}
                                        <span>פרויקט</span>
                                    </div>
                                </th>
                                <th
                                    className="text-right p-2 font-medium bg-green-50 dark:bg-green-950 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900"
                                    colSpan={collapsedColumns.research ? 1 : 2}
                                    onClick={() => toggleColumnGroup('research')}
                                >
                                    <div className="flex items-center gap-2 justify-end">
                                        {collapsedColumns.research ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronUp className="w-4 h-4" />
                                        )}
                                        <span>חקר</span>
                                    </div>
                                </th>
                            </tr>
                            {!collapsedColumns.project || !collapsedColumns.research ? (
                                <tr className="border-b border-border">
                                    {!collapsedColumns.project && (
                                        <>
                                            <th className="text-right p-2 font-normal text-gray-600 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-950/50">כותרת</th>
                                            <th className="text-right p-2 font-normal text-gray-600 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-950/50">מנחה</th>
                                            <th className="text-right p-2 font-normal text-gray-600 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-950/50">משוב</th>
                                        </>
                                    )}
                                    {!collapsedColumns.research && (
                                        <>
                                            <th className="text-right p-2 font-normal text-gray-600 dark:text-gray-400 bg-green-50/50 dark:bg-green-950/50">כותרת</th>
                                            <th className="text-right p-2 font-normal text-gray-600 dark:text-gray-400 bg-green-50/50 dark:bg-green-950/50">משוב</th>
                                        </>
                                    )}
                                </tr>
                            ) : null}
                        </thead>
                        <tbody>
                            {data.sort((a, b) => a.first_name.localeCompare(b.first_name)).map(student => {
                                const hasProject = !!student.project;
                                const review = student.project?.metadata?.review;
                                const hasReview = review && review.summary && review.summary.trim();
                                const isExpanded = expandedRows.has(student.id);
                                const hasResearch = !!student.research
                                const researchReview = hasResearch && student.research?.metadata?.review;

                                return (
                                    <tr key={student.id} className="border-b border-border/50">
                                        <td className="p-2">{student.first_name} {student.last_name}</td>
                                        {collapsedColumns.project ? (
                                            <td className="p-2 bg-blue-50/30 dark:bg-blue-950/30">
                                                <div className="flex items-center gap-2">
                                                    {hasProject ? (
                                                        <>
                                                            <span className="truncate">{student.project?.title || '-'}</span>
                                                            {hasReview && <span className="text-green-600">✓</span>}
                                                        </>
                                                    ) : '-'}
                                                </div>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="p-2 bg-blue-50/30 dark:bg-blue-950/30">{student.project?.title || '-'}</td>
                                                <td className="p-2 bg-blue-50/30 dark:bg-blue-950/30">{student.project?.master?.first_name || '-'}</td>
                                                <td className="p-2 bg-blue-50/30 dark:bg-blue-950/30">
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
                                            </>
                                        )}
                                        {collapsedColumns.research ? (
                                            <td className="p-2 bg-green-50/30 dark:bg-green-950/30">
                                                <div className="flex items-center gap-2">
                                                    {hasResearch ? (
                                                        <>
                                                            <span className="truncate">{student.research?.title || '-'}</span>
                                                            {researchReview && <span className="text-green-600">✓</span>}
                                                        </>
                                                    ) : 'אין חקר'}
                                                </div>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="p-2 bg-green-50/30 dark:bg-green-950/30">
                                                    {hasResearch ? student.research?.title || '-' : 'אין חקר'}
                                                </td>
                                                <td className="p-2 bg-green-50/30 dark:bg-green-950/30">
                                                    {researchReview ? (
                                                        <button onClick={() => toggleRow(student.id)} className="flex items-center gap-1 text-left hover:opacity-70 w-full text-right">
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-3 h-3 flex-shrink-0" />
                                                            ) : (
                                                                <ChevronDown className="w-3 h-3 flex-shrink-0" />
                                                            )}
                                                            <span className={isExpanded ? "" : "line-clamp-1"}>
                                                                {researchReview.summary}
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-red-500 font-medium">אין משוב</span>
                                                    )}
                                                </td>
                                            </>
                                        )}
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