import PrintReportPage from "./PrintReportPage";

export default async function Page({params, searchParams}) {
    const {studentId} = await params;
    const {semester} = await searchParams;

    return (
        <PrintReportPage studentId={studentId} semester={semester} />
    );
}
