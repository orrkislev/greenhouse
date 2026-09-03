import PrintReportPage from "./PrintReportPage";
import WithAuth from "@/components/WithAuth";

export default async function Page({params, searchParams}) {
    const {studentId} = await params;
    const {semester} = await searchParams;

    return (
        <WithAuth>
            <PrintReportPage studentId={studentId} semester={semester} />
        </WithAuth>
    );
}
