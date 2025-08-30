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

export const examplePaths = [
    {
        name: "ארכיטקטורת עננים אישיים",
        description: "פיתוח עננים ניידים לשימוש אישי – להצללה, קירור ושאיבת מים מהאוויר.",
        subjects: [
            {
                id: crypto.randomUUID(),
                name: "עיצוב ענן נייד להצללה ושאיבת מים",
                description: "בניית מערכת ניידת המדמה ענן ויכולה לספק צל ומים.",
                steps: [
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/cloud-design-video",
                        text: "צפיתי בסרטון על עננים מלאכותיים והבנתי את העקרונות הפיזיקליים.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://he.wikipedia.org/wiki/מחזור_המים",
                        text: "למדתי על מחזור המים וכיצד ניתן לשחזר אותו במכשיר.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://coursera.org/course/climate-architecture",
                        text: "עברתי קורס מבוא לעיצוב מבנים אקלימיים.",
                        finished: false,
                    }
                ],
            }
        ],
        active: true,
    },
    {
        name: "ביולוגיית חלומות מעשית",
        description: "חקר ולמידה של יצירת תקשורת וחוויות משותפות בזמן חלימה מודעת.",
        subjects: [
            {
                id: crypto.randomUUID(),
                name: "פיתוח שפה לתקשורת בזמן חלום משותף",
                description: "יצירת מערכת סמלים לשימוש בתוך חלומות לוסיד.",
                steps: [
                    {
                        id: crypto.randomUUID(),
                        source: "https://www.ted.com/talks/lucid_dreaming",
                        text: "הקשבתי להרצאת TED על לוסיד דרימינג.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://dream-research.org/article",
                        text: "קראתי מאמר על סימבוליקה בחלומות.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/dream-journal-app",
                        text: "הורדתי אפליקציה לניהול יומן חלומות.",
                        finished: false,
                    }
                ],
            }
        ],
        active: true,
    },
    {
        name: "אנתרופולוגיה של רובוטים משועממים",
        description: "מחקר תרבותי על רובוטים נטושים בתחנות חלל לא פעילות.",
        subjects: [
            {
                id: crypto.randomUUID(),
                name: "חקר תרבויות רובוטיות נטושות בתחנות חלל ישנות",
                description: "תיעוד התרבות החברתית של רובוטים שלא בשימוש.",
                steps: [
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/abandoned-robot-comic",
                        text: "קראתי קומיקס דיגיטלי על רובוטים עזובים.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://he.wikipedia.org/wiki/רובוטיקה_הומנואידית",
                        text: "למדתי מה זה רובוטיקה הומנואידית.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/digital-archaeology-course",
                        text: "עברתי קורס מבוא לארכיאולוגיה דיגיטלית.",
                        finished: false,
                    }
                ],
            }
        ],
        active: true,
    },
    {
        name: "פסיכו-גיאוגרפיה של ערים תת־ימיות",
        description: "חקר מבנים, רגשות וחוויות במרחבים עירוניים שקועים במים.",
        subjects: [
            {
                id: crypto.randomUUID(),
                name: "מיפוי חווייתי של עיר שקועה בעקבות עליית מפלס הים",
                description: "יצירת מפות רגשיות ומרחביות של ערים מתחת למים.",
                steps: [
                    {
                        id: crypto.randomUUID(),
                        source: "https://earth.google.com/yokohama-tour",
                        text: "ביצעתי סיור וירטואלי במפרץ יוקוהמה.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/submerged-ecology-essay",
                        text: "קראתי מאמר על אקולוגיה שקועה.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://youtube.com/underwater-city-cgi",
                        text: "צפיתי בהדמיה של עיר תת־ימית עתידנית.",
                        finished: false,
                    }
                ],
            }
        ],
        active: true,
    },
    {
        name: "הנדסת צמחים למוזיקה",
        description: "פיתוח צמחים שמפיקים מוזיקה באמצעות תנועה או פריחה.",
        subjects: [
            {
                id: crypto.randomUUID(),
                name: "פיתוח פרחים שמנגנים מלודיות עם פתיחתם בבוקר",
                description: "שילוב ביולוגיה ומוזיקה ליצירת חוויה חושית חדשה.",
                steps: [
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/plant-bioacoustics-video",
                        text: "צפיתי בהרצאה על ביואקוסטיקה בצמחים.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/bioinformatics-course",
                        text: "עברתי קורס מבוא לביואינפורמטיקה.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/bio-music-artist-blog",
                        text: "קראתי בלוג של אמן המשלב מוזיקה וצמחים.",
                        finished: false,
                    }
                ],
            }
        ],
        active: true,
    },
    {
        name: "היסטוריה חלופית של המצאות שלא קרו",
        description: "שחזור ההיסטוריה כפי שהייתה נראית עם המצאות שלא התרחשו.",
        subjects: [
            {
                id: crypto.randomUUID(),
                name: "העולם אילו הגלגל הומצא ב־3023 לפני הספירה",
                description: "מחקר והשערות על טכנולוגיות עתיקות שלא קרו בזמן.",
                steps: [
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/alternate-history-podcast",
                        text: "הקשבתי לפודקאסט על היסטוריה חלופית.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://he.wikipedia.org/wiki/המצאות_עתיקות",
                        text: "קראתי ערך על המצאות עתיקות.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/civ-simulation-mod",
                        text: "שיחקתי בסימולציית Civilization עם חוקים מותאמים.",
                        finished: false,
                    }
                ],
            }
        ],
        active: true,
    },
    {
        name: "עיצוב זמן",
        description: "חקר יצירתי של לוחות זמנים שאינם תואמים ל־24 שעות ביממה.",
        subjects: [
            {
                id: crypto.randomUUID(),
                name: "תכנון ימי עבודה עם 27 שעות",
                description: "פיתוח מודלים חדשים לארגון זמן.",
                steps: [
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/time-perception-article",
                        text: "קראתי מאמר על תפיסת זמן.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://youtube.com/circadian-rhythms-talk",
                        text: "צפיתי בהרצאה על קצב ביולוגי.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/custom-calendar-tool",
                        text: "התנסיתי בכלי ליצירת לוחות שנה מותאמים.",
                        finished: false,
                    }
                ],
            }
        ],
        active: true,
    },
    {
        name: "קולינריה קוונטית",
        description: "בישול המתרחש בסופרפוזיציה עד לרגע האכילה.",
        subjects: [
            {
                id: crypto.randomUUID(),
                name: "פאי שמתקיים בשני מצבים במקביל עד שנוגסים בו",
                description: "יישום עקרונות קוונטים בעולם הקולינריה.",
                steps: [
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/quantum-mechanics-intro",
                        text: "צפיתי בסרטון על מכניקת קוונטים למתחילים.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/future-food-magazine",
                        text: "קראתי כתבה במגזין על קולינריה עתידנית.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/experimental-cooking-course",
                        text: "עברתי קורס על בישול ניסויי.",
                        finished: false,
                    }
                ],
            }
        ],
        active: true,
    },
    {
        name: "פואטיקה של מחשבים מיושנים",
        description: "כתיבת שירה בשיתוף עם טכנולוגיות מחשוב מיושנות.",
        subjects: [
            {
                id: crypto.randomUUID(),
                name: "כתיבת שירה בשיתוף עם מחשבים משנות ה־80",
                description: "שימוש בשפות תכנות ישנות ליצירת שירה.",
                steps: [
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/forgotten-programming-languages",
                        text: "קראתי מאמר על שפות תכנות נשכחות.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://youtube.com/algorithmic-poetry-demo",
                        text: "צפיתי בהדגמה של שירה אלגוריתמית.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/retro-bots",
                        text: "שוחחתי עם בוטים משנות ה־80.",
                        finished: false,
                    }
                ],
            }
        ],
        active: true,
    },
    {
        name: "גינון בין־כוכבי",
        description: "פיתוח שיטות גינון המותאמות לתנאי כוכבים שונים.",
        subjects: [
            {
                id: crypto.randomUUID(),
                name: "פיתוח חממה לפלנטות עם יום באורך 72 שעות",
                description: "הנדסת חקלאות בין־כוכבית.",
                steps: [
                    {
                        id: crypto.randomUUID(),
                        source: "https://example.com/mars-agronomy-article",
                        text: "קראתי על אגרונומיה במאדים.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://he.wikipedia.org/wiki/פוטוסינתזה",
                        text: "למדתי על פוטוסינתזה.",
                        finished: false,
                    },
                    {
                        id: crypto.randomUUID(),
                        source: "https://youtube.com/future-greenhouse-design",
                        text: "צפיתי בסרטון על חממות עתידניות.",
                        finished: false,
                    }
                ],
            }
        ],
        active: true,
    }
]

export const getNewSubject = async (path) => {
    const schema = Schema.object({
        properties: {
            name: Schema.string(),
            description: Schema.string(),
            step: Schema.object({
                properties: {
                    source: Schema.string(),
                    text: Schema.string(),
                },
            }),
        },
    })
    const prompt = `
    בהתאם למידע הבא:
    תחום הלמידה: ${path.name}
    תיאור תחום הלמידה: ${path.description}
    רשימת הנושאים שנבחרו: ${path.subjects.map(subject => subject.name).join(', ')}
    המשימה שלך היא להציע נושא חדש ומקורי שמתאים לתחום הלמידה הזה, שלא חוזר על הנושאים הקיימים, ולהציע לו צעד ראשון ללמידה או חקירה.
    הצעד הראשון צריך להיות ברור, ישים, ומעורר השראה, למשל: קישור למאמר, שם סרטון יוטיוב, רעיון לפעילות, או כלי להתנסות.
    תיאור הנושא צריך להיות קצר מאוד, בערך 10 מילים.
    `
    const result = await generateTextWithSchema(prompt, schema)
    const subject = JSON.parse(result)
    return {
        id: crypto.randomUUID(),
        name: subject.name,
        description: subject.description,
        steps: [{
            id: crypto.randomUUID(),
            source: subject.step.source,
            text: subject.step.text,
            finished: false,
        }],
    }
}

export const getNewStep = async (path, subject) => {
    const schema = Schema.object({
        properties: {
            source: Schema.string(),
            text: Schema.string(),
        },
    })
    const prompt = `
    בהתאם למידע הבא:
    תחום הלמידה: ${path.name}
    תיאור תחום הלמידה: ${path.description}
    רשימת הנושאים שנבחרו: ${path.subjects.map(subject => subject.name).join(', ')}
    תיאור הנושא: ${subject.description}
    הצעדים הקיימים: ${subject.steps.map(step => step.text).join(', ')}
    המשימה שלך היא להציע את הצעד הבא ללמידה או חקירה חדש, שלא חוזר על הצעדים הקיימים, ולהציע לו קישור למאמר, שם סרטון יוטיוב, רעיון לפעילות, או כלי להתנסות.
    הצעד צריך להיות ברור, ישים, ומעורר השראה.
    הכל צריך להיות קצר מאוד.
    `
    const result = await generateTextWithSchema(prompt, schema)
    const step = JSON.parse(result)
    return {
        id: crypto.randomUUID(),
        source: step.source,
        text: step.text,
        finished: false,
    }
}