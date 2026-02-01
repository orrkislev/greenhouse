import PrintReportPage from "./PrintReportPage";

export default async function Page({params}) {
    const {studentId} = await params

    return (
        <PrintReportPage studentId={studentId} />
    );
}
