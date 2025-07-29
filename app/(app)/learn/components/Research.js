"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Circle, Search, PenTool, FileText, ShieldQuestion } from "lucide-react"
import FoundationStage from "./foundation-stage"
import CollectionStage from "./collection-stage"
import SynthesisStage from "./synthesis-stage"
import CompletionStage from "./completion-stage"

import { create } from "zustand";
export const useResearch = create((set, get) => ({
    research: {
        foundation: { field: "", topic: "", question: "" },
        sources: [],
        completion: { summary: "", googleDocUrl: "" },
    },
    setResearch: (research) => set({ research }),
    updateResearch: (research) => set({ research: [...get().research, research] }),
}));

const stages = [
  { id: "foundation", name: "הגדרה", icon: ShieldQuestion, description: "הגדר את בסיס החקר שלך" },
  { id: "collection", name: "איסוף", icon: Search, description: "איסוף מקורות וחומרים" },
  { id: "synthesis", name: "סינתזה", icon: PenTool, description: "סכם את החקר שלך" },
  { id: "completion", name: "סיום", icon: FileText, description: "כתוב מסקנות וממצאים" },
]

export default function ResearchManagement() {
  const [currentStage, setCurrentStage] = useState("foundation")
  const research = useResearch(state => state.research);
  const updateResearchData = useResearch(state => state.updateResearch);

  const isStageComplete = (stageId) => {
    switch (stageId) {
      case "foundation":
        return research.foundation.field && research.foundation.topic && research.foundation.question
      case "collection":
        return research.sources.length > 0 && research.sources.some((s) => s.materials.length > 0)
      case "synthesis":
        return research.sources.some((s) => s.materials.some((m) => m.notes.length > 0))
      case "completion":
        return research.completion.summary && research.completion.googleDocUrl
      default:
        return false
    }
  }

  const renderStageContent = () => {
    switch (currentStage) {
      case "foundation":
        return <FoundationStage data={research.foundation} onUpdate={(data) => updateResearchData("foundation", data)} />
      case "collection":
        return <CollectionStage data={research.sources} onUpdate={(data) => updateResearchData("sources", data)} />
      case "synthesis":
        return <SynthesisStage data={research.sources} onUpdate={(data) => updateResearchData("sources", data)} />
      case "completion":
        return <CompletionStage researchData={research} onUpdate={(data) => updateResearchData("completion", data)} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">החקר שלך</h1>
          <p className="text-gray-600">ארגן את תהליך החקר שלך מההתחלה ועד לסיום</p>
        </div>

        {/* Stage Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stages.map(stage => {
            const Icon = stage.icon
            const isComplete = isStageComplete(stage.id)
            const isCurrent = currentStage === stage.id

            return (
              <Card
                key={stage.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isCurrent ? "ring-2 ring-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => setCurrentStage(stage.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isCurrent ? "bg-blue-500 text-white" : "bg-gray-100"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{stage.name}</h3>
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{stage.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stage Content */}
        <div className="mb-8">{renderStageContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = stages.findIndex((s) => s.id === currentStage)
              if (currentIndex > 0) {
                setCurrentStage(stages[currentIndex - 1].id)
              }
            }}
            disabled={stages.findIndex((s) => s.id === currentStage) === 0}
          >
            הקודם
          </Button>

          <Button
            onClick={() => {
              const currentIndex = stages.findIndex((s) => s.id === currentStage)
              if (currentIndex < stages.length - 1) {
                setCurrentStage(stages[currentIndex + 1].id)
              }
            }}
            disabled={stages.findIndex((s) => s.id === currentStage) === stages.length - 1}
          >
            הבא
          </Button>
        </div>
      </div>
    </div>
  )
}
