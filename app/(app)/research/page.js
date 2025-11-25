'use client';

import ContextBar, { PageMain } from "@/components/ContextBar";
import { useEffect } from "react";
import { researchActions, useAllResearch, useResearch, useResearchData } from "@/utils/store/useResearch";
import { useRouter, useSearchParams } from "next/navigation";
import { tw } from "@/utils/tw";
import NoResearch from "./components/NoResearch";
import Research from "./components/Research";
import Button, { IconButton } from "@/components/Button";
import { Plus, Trash2 } from "lucide-react";

export default function ResearchPage() {
  const searchParams = useSearchParams()
  const research = useResearch()

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) researchActions.setResearchById(id)
  }, [searchParams])

  return (
    <>
      <PageMain>
        {!research ? <NoResearch /> : <Research />}
      </PageMain>

      <ContextBar>
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
    ${props => props.$isActive && 'bg-muted0 text-white'}
`

function ResearchList() {
  const allResearch = useAllResearch()
  const router = useRouter()
  const research = useResearchData(state => state.research)

  const clickResearch = (researchId) => {
    router.push(`/research?id=${researchId}`)
  }

  const removeResearch = (researchId) => {
    researchActions.deleteResearch(researchId)
  }
  
  const selectedResearchId = research?.id

  return (
    <div>
      {allResearch.map(research => (
        <ResearchRow key={research.id} onClick={() => clickResearch(research.id)} $isActive={research.id === selectedResearchId}>
          {research.title}
          <IconButton icon={Trash2} onClick={() => removeResearch(research.id)} className="p-2 hover:bg-muted rounded-full opacity-0 group-hover/research-row:opacity-100 transition-opacity hover:bg-accent hover:text-foreground" />
        </ResearchRow>
      ))}
    </div>
  )
}
