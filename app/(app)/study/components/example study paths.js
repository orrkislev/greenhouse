import { generateTextWithSchema } from "@/utils/firebase/firebase"
import { Schema } from "firebase/ai"


export const newPathData = () => ({
    name: "תחום הלמידה שלי",
    description: "למה אני לומד את זה?",
    subjects: [
        {
            id: crypto.randomUUID(),
            name: "מה בעצם אני אלמד",
            description: "הסבר קצר על הנושא",
            steps: [
                {
                    id: crypto.randomUUID(),
                    source: "מה הדבר הראשון שאלמד בנושא הזה",
                    text: "איך בדיוק אני אלמד את זה",
                    finished: false,
                    test: "איך אדע שהצלחתי?",
                },
            ],
        },
    ],
    active: true,
})

export const getNewStep = async (path) => {
    const schema = Schema.object({
        properties: {
            source: Schema.string(),
            text: Schema.string(),
        },
    })
    const prompt = `
    בהתאם למידע הבא:
    תחום הלמידה: ${path.title}
    תיאור תחום הלמידה: ${path.description}
    הצעדים הקיימים: ${path.steps.map(step => step.text).join(', ')}
    המשימה שלך היא להציע את הצעד הבא ללמידה או חקירה חדש, שלא חוזר על הצעדים הקיימים, ולהציע לו קישור למאמר, שם סרטון יוטיוב, רעיון לפעילות, או כלי להתנסות.
    הצעד צריך להיות ברור, ישים, ומעורר השראה.
    הכל צריך להיות קצר מאוד.
    `
    const result = await generateTextWithSchema(prompt, schema)
    const step = JSON.parse(result)
    return {
        title: step.source,
        description: step.text,
    }
}