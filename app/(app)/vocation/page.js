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
        <div className="flex gap-4 flex-wrap">
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
    <div className="w-32 border border-stone-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-green-100 group/new-job-card" onClick={click}>
      <Plus className="w-4 h-4 group-hover/new-job-card:text-green-500 group-hover/new-job-card:scale-150 transition-all duration-200 group-hover/new-job-card:rotate-90" />
      <span className="text-center text-sm text-stone-700 group-hover/new-job-card:text-green-500 transition-all duration-200 group-hover/new-job-card:font-bold">
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
    <Box2 label={job.place_of_work} LabelIcon={Briefcase} className="group/job-card">
      <Menu className="absolute top-2 left-2 opacity-0 group-hover/job-card:opacity-100 transition-all duration-200">
        <MenuItem title="מחק" icon={Trash2} onClick={removeJob} />
      </Menu>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <Edittable value={job.place_of_work} onFinish={updatePlaceOfWork} className="w-64" placeholder="מקום העבודה" />
          <Edittable value={job.position} onFinish={updatePosition} className="w-64 text-sm text-stone-700" placeholder="תפקיד" />
        </div>
        <div className="flex gap-4">
          <table>
            <TableHeader headers={[{ key: 'year', label: 'שנה' }, { key: 'month', label: 'חודש' }, { key: 'hours', label: 'שעות עבודה' }]} />
            <tbody>
              {job.work_hours.map((hour, index) => (
                <tr key={index}>
                  <Cell><Edittable value={hour.year} onFinish={value => updateWorkHours(job.work_hours.map((h, i) => i === index ? { ...h, year: value } : h))} className="w-16" /></Cell>
                  <Cell><Edittable value={hour.month} onFinish={value => updateWorkHours(job.work_hours.map((h, i) => i === index ? { ...h, month: value } : h))} className="w-16" /></Cell>
                  <Cell><Edittable value={hour.hours} onFinish={value => updateWorkHours(job.work_hours.map((h, i) => i === index ? { ...h, hours: value } : h))} className="w-16" /></Cell>
                </tr>
              ))}
              <div className="flex gap-1 items-center text-xs cursor-pointer bg-stone-100 hover:bg-green-100 rounded-md p-1 mt-2"
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