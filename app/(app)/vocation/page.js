'use client';

import Box2 from "@/components/Box2";
import ContextBar, { PageMain } from "@/components/ContextBar";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { Cell, Edittable, TableHeader } from "../admin/components/Common";
import { useVocation, vocationActions } from "@/utils/store/useVocation";
import Menu, { MenuItem } from "@/components/Menu";

export default function VocationPage() {
  const jobs = useVocation();

  return (
    <>
      <PageMain>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:flex-wrap">
          {jobs.map((job, index) => (
            <JobCard key={index} job={job} />
          ))}
          <NewJobCard />
        </div>
      </PageMain>
      <ContextBar name="">
      </ContextBar>
    </>
  );
}

function NewJobCard() {
  const click = () => vocationActions.addJob();
  return (
    <div className="w-full md:w-32 border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 group/new-job-card" onClick={click}>
      <Plus className="w-4 h-4 group-hover/new-job-card:text-primary group-hover/new-job-card:scale-150 transition-all duration-200 group-hover/new-job-card:rotate-90" />
      <span className="text-center text-sm text-foreground group-hover/new-job-card:text-primary transition-all duration-200 group-hover/new-job-card:font-bold">
        מקום עבודה חדש
      </span>
    </div>
  );
}

function JobCard({ job }) {
  const updatePlaceOfWork = (value) => vocationActions.updateJob(job, { place_of_work: value });
  const updatePosition = (value) => vocationActions.updateJob(job, { position: value });
  const updateWorkHours = (value) => vocationActions.updateJob(job, { work_hours: value });
  const removeJob = () => vocationActions.removeJob(job.id);

  return (
    <Box2 label={job.place_of_work} LabelIcon={Briefcase} className="group/job-card w-full md:w-auto">
      <Menu className="absolute top-2 left-2 opacity-0 md:opacity-0 md:group-hover/job-card:opacity-100 transition-all duration-200">
        <MenuItem title="מחק" icon={Trash2} onClick={removeJob} />
      </Menu>
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex flex-col gap-1">
          <Edittable value={job.place_of_work} onFinish={updatePlaceOfWork} className="w-full md:w-64" placeholder="מקום העבודה" />
          <Edittable value={job.position} onFinish={updatePosition} className="w-full md:w-64 text-sm text-foreground" placeholder="תפקיד" />
        </div>
        <div className="flex gap-4 overflow-x-auto">
          <table className="w-full">
            <TableHeader headers={[{ key: 'year', label: 'שנה' }, { key: 'month', label: 'חודש' }, { key: 'hours', label: 'שעות עבודה' }]} />
            <tbody>
              {job.work_hours.map((hour, index) => (
                <tr key={index}>
                  <Cell><Edittable value={hour.year} placeholder="שנה" onFinish={value => updateWorkHours(job.work_hours.map((h, i) => i === index ? { ...h, year: value } : h))} className="w-12 md:w-16" /></Cell>
                  <Cell><Edittable value={hour.month} placeholder="חודש" onFinish={value => updateWorkHours(job.work_hours.map((h, i) => i === index ? { ...h, month: value } : h))} className="w-12 md:w-16" /></Cell>
                  <Cell><Edittable value={hour.hours} placeholder="שעות " onFinish={value => updateWorkHours(job.work_hours.map((h, i) => i === index ? { ...h, hours: value } : h))} className="w-12 md:w-16" /></Cell>
                </tr>
              ))}
              <div className="flex gap-1 items-center text-xs cursor-pointer bg-muted hover:bg-primary/10 rounded-md p-1 mt-2"
                onClick={() => updateWorkHours([...(job.work_hours || []), { year: new Date().getFullYear(), month: new Date().getMonth() + 1, hours: '?' }])} >
                <Plus className="w-4 h-4" /> חודש נוסף
              </div>
            </tbody>
          </table>
        </div>
      </div>
    </Box2>
  );
}