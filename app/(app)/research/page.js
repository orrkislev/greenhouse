'use client';

import ContextBar, { PageMain } from "@/components/ContextBar";
import { useEffect, useState } from "react";
import { researchActions, researchUtils, useAllResearch, useResearch, useResearchData } from "@/utils/store/useResearch";
import { useRouter, useSearchParams } from "next/navigation";
import { tw } from "@/utils/tw";
import NoResearch from "./components/NoResearch";
import Research from "./components/Research";
import Button, { IconButton } from "@/components/Button";
import { Plus, Trash2 } from "lucide-react";
import { timeActions, useTime } from "@/utils/store/useTime";
import Tooltip from "@/components/ToolTip";
import { DashboardLayout, DashboardMain, DashboardPanel, DashboardPanelButton } from "@/components/DashboardLayout";
import { ResearchReview } from "./components/ResearchReview";

export default function ResearchPage() {
  const [view, setView] = useState('research')
  const searchParams = useSearchParams()
  const research = useResearch()

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) researchActions.setResearchById(id)
  }, [searchParams])

  return (
    <>
      {research ? (
        <DashboardLayout>
          <DashboardPanel>
            <DashboardPanelButton onClick={() => setView('research')} $active={view === 'research'}>חקר</DashboardPanelButton>
            <DashboardPanelButton onClick={() => setView('review')} $active={view === 'review'}>משוב ורפלקציה</DashboardPanelButton>
          </DashboardPanel>
          <DashboardMain className="p-4">
            {view === 'research' && <Research />}
            {view === 'review' && <ResearchReview />}
          </DashboardMain>
        </DashboardLayout>
      ) : (
        <NoResearch />
      )}

      <ContextBar initialOpen={false}>
        <ResearchList />
        <div className="flex justify-center items-center mt-8">
          <Button data-role="new" onClick={researchActions.newResearch}>
            חקר חדש
            <Plus className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </ContextBar>
    </>
  )
}

const ResearchRow = tw.div`
    text-sm text-muted-foreground mr-2 p-1 hover:bg-muted hover:text-foreground rounded-md cursor-pointer transition-colors
    flex justify-between items-center group/research-row
    ${props => props.$isActive && 'bg-primary-100  text-slate-800'}
`

function ResearchList() {
  const allResearch = useAllResearch()
  const router = useRouter()
  const research = useResearchData(state => state.research)
  const terms = useTime(state => state.terms)
  const currTerm = useTime(state => state.currTerm)

  useEffect(() => {
    timeActions.loadTerms();
  }, [])

  const clickResearch = (researchId) => {
    router.push(`/research?id=${researchId}`)
  }

  const removeResearch = (researchId) => {
    researchActions.deleteResearch(researchId)
  }

  const selectedResearchId = research?.id

  const getTerm = (research) => {
    const researchCreatedDate = new Date(research.created_at)
    const term = terms.find(term => new Date(term.start) <= researchCreatedDate && new Date(term.end) >= researchCreatedDate)
    if (!term) return researchCreatedDate.toLocaleDateString()
    return term
  }

  const researches = []
  allResearch.forEach(research => {
    const term = getTerm(research)
    const needReview = researchUtils.getNeedReview(research)

    researches.push(
      <ResearchRow key={research.id} onClick={() => clickResearch(research.id)} $isActive={research.id === selectedResearchId}>
        <div className="flex flex-col">
          <div className='flex gap-2 items-center'>
            {research.title}
            {needReview && <span className="w-2 h-2 bg-danger-text rounded-full" />}</div>
          {term && <span className="ml-2 text-xs">תקופת {term.name}</span>}
        </div>
        <IconButton icon={Trash2} onClick={() => removeResearch(research.id)} className="p-2 hover:bg-muted rounded-full opacity-0 group-hover/research-row:opacity-100 transition-opacity hover:bg-accent hover:text-foreground" />
        {needReview && <Tooltip side="right">זקוק למשוב</Tooltip>}
      </ResearchRow >
    )
  })

  return (
    <div>
      {researches}
    </div>
  )
}
