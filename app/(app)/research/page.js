'use client';

import ContextBar, { PageMain } from "@/components/ContextBar";
import { useEffect } from "react";
import { researchActions, useAllResearch, useResearch, useResearchData } from "@/utils/store/useResearch";
import { useRouter, useSearchParams } from "next/navigation";
import { tw } from "@/utils/tw";
import NoResearch from "./components/NoResearch";
import Research from "./components/Research";
import Button from "@/components/Button";
import { Plus } from "lucide-react";

export default function ResearchPage() {
  const searchParams = useSearchParams()
  const research = useResearch()

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      researchActions.loadResearchById(id)
    }
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
            מחקר חדש
            <Plus className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </ContextBar>
    </>
  )
}

const ResearchRow = tw.div`
    text-sm text-stone-500 mr-2 p-1 hover:bg-stone-100 hover:text-stone-700 rounded-md cursor-pointer transition-colors
    ${props => props.$isActive && 'bg-stone-500 text-white'}
`

function ResearchList() {
  const allResearch = useAllResearch()
  const router = useRouter()
  const research = useResearchData(state => state.research)

  const clickResearch = (researchId) => {
    router.push(`/research?id=${researchId}`)
  }

  const selectedResearchId = research?.id
  return (
    <div>
      {allResearch.map(research => (
        <ResearchRow key={research.id} onClick={() => clickResearch(research.id)} $isActive={research.id === selectedResearchId}>{research.title}</ResearchRow>
      ))}
    </div>
  )
}
