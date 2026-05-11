export const RATING_LABELS = ['רמה התחלתית', 'רמה בסיסית', 'רמה עצמאית', 'רמה מתקדמת', 'שליטה מלאה'];

// Guidance descriptions shown in the rating dialog when the user clicks '?'.
// Each view has a key (Latin), a label (Hebrew), and columns.
// Each column has a key (Latin), a label (Hebrew), and values[0..4] for rating levels 1–5.
// Fill in the empty strings below with your actual descriptions.
export const RATING_DESCRIPTIONS = [
    {
        key: 'knowledge',
        label: 'ידע',
        columns: [
            {
                key: 'description',
                label: 'תיאור',
                values: [
                    'היכרות ראשונית: הלומד נחשף לתחום, מזכיר עובדות ומושגים בסיסיים אך ללא הבנת הקשרים ביניהם',
                    'הבנה: הלומד מסביר מושגים במילים שלו, מדגים הבנה של עקרונות בודדים ומסוגל לתת דוגמאות',
                    'יישום וניתוח: הלומד מפעיל ידע לפתרון בעיות מוכרות, מנתח קשרים בין מושגים ומזהה דפוסים',
                    'הערכה וסינתזה: הלומד משווה תיאוריות, שופט ביקורתית טיעונים ומשלב ידע ממקורות שונים לכלל תמונה שלמה',
                    'יצירה ותרומה: הלומד מייצר ידע חדש, מציע מסגרות מקוריות ותורם להרחבת שיח בתחום',
                ],
            },
        ],
    },
    {
        key: 'skill',
        label: 'מיומנות',
        columns: [
            {
                key: 'description',
                label: 'תיאור',
                values: [
                    'חיקוי: המיומנות מבוצעת תוך התבוננות במודל בלבד, עם שגיאות תכופות ותלות מלאה בהדרכה',
                    'ביצוע מונחה: הלומד מבצע את המיומנות לפי הוראות, עם הצלחה חלקית ובאיטיות יחסית',
                    'ביצוע עצמאי: המיומנות מבוצעת באופן עצמאי וסדיר, אך עדיין דורשת מאמץ קוגניטיבי ואינה גמישה',
                    'שליטה: הביצוע רהוט, מדויק ויעיל; הלומד מתאים את המיומנות לתנאים משתנים ומוביל אחרים',
                    'אמנות: המיומנות מבוצעת ברמת מומחיות, יצירתיות וחדשנות; הלומד מפתח גרסאות ושיטות משלו',
                ],
            },
        ],
    },
    {
        key: 'language',
        label: 'שפה',
        columns: [
            {
                key: 'description',
                label: 'תיאור',
                values: [
                    /* רמה 1 — רמה התחלתית */ 'חשיפה ראשונית לשפה; מסוגל לזהות מילים בודדות ולהשתמש בביטויים שגורים ומוכנים מראש (A1)',
                    /* רמה 2 — רמה בסיסית  */ 'מתקשר בנושאים יומיומיים מוכרים; זקוק לעזרה ולחזרות תכופות (A2-B1)',
                    /* רמה 3 — רמה עצמאית  */ 'מתמודד עם מרבית המצבים בשפה; מבין ומתבטא בנושאים מוכרים ומורכבים יחסית (B1-B2)',
                    /* רמה 4 — רמה מתקדמת  */ 'שולט בשפה ברמה גבוהה; מתבטא בצורה רהוטה, מדויקת וגמישה ברוב ההקשרים (C1)',
                    /* רמה 5 — שליטה מלאה  */ 'שליטה שקולה לדובר ילידי משכיל; מבין ומפיק כל סוג של טקסט בכל הקשר (C2)',
                ],
            },
            {
                key: 'comprehension',
                label: 'הבנה',
                values: [
                    /* רמה 1 */ 'מבין מילים בודדות ומשפטים פשוטים מאוד בדיבור איטי',
                    /* רמה 2 */ 'מבין משפטים ומידע ישיר בנושאים שגרתיים',
                    /* רמה 3 */ 'מבין עיקרי שיחה ורדיו/טלוויזיה בנושאים מוכרים',
                    /* רמה 4 */ 'מבין שיח ארוך ומורכב, כולל הומור, ניואנסים ורמזים תרבותיים',
                    /* רמה 5 */ 'מבין כל סוג של שיח, כולל ז\'רגון מקצועי, ניב אזורי ורמיזות עדינות',
                ],
            },
            {
                key: 'speaking',
                label: 'דיבור',
                values: [
                    /* רמה 1 */ 'מציג את עצמו, עונה על שאלות פשוטות; תלוי בביטויים שגורים',
                    /* רמה 2 */ 'מתאר עצמו וסביבתו הקרובה; תקשורת פשוטה ולא רהוטה',
                    /* רמה 3 */ 'משתתף בשיחה בצורה ספונטנית יחסית; מבטא דעות ומסביר תוכניות',
                    /* רמה 4 */ 'מתבטא בצורה זורמת ומדויקת; מגיב ספונטנית ומשתמש בשפה עשירה',
                    /* רמה 5 */ 'מתבטא בצורה עשירה, מדויקת ומעוצבת; משחק בשפה ומתאים לכל קהל',
                ],
            },
            {
                key: 'writing',
                label: 'כתיבה',
                values: [
                    /* רמה 1 */ 'כותב מילים ורשימות קצרות; מסוגל למלא טפסים פשוטים',
                    /* רמה 2 */ 'כותב הודעות קצרות ופשוטות; מסוגל לתאר חוויה בכמה משפטים',
                    /* רמה 3 */ 'כותב טקסט קוהרנטי על נושאים מגוונים; מסוגל להעביר מסר בהיר',
                    /* רמה 4 */ 'כותב טקסטים מפורטים ומובנים על נושאים מורכבים; שולט בסגנונות שונים',
                    /* רמה 5 */ 'כותב ברמה ספרותית או מקצועית; שולט במגוון ז\'אנרים, סגנונות וטונים',
                ],
            },
        ],
    },
];

export function defaultGeneralTopics(keyTopics = []) {
    if (keyTopics.length > 0) {
        return keyTopics.map(t => ({ name: t.name, detail: t.detail || '', application: '', rating: null, locked: true, keyTopic: true }));
    }
    // Fallback while key topics are loading
    return [];
}

export const HEUTAGOGY_ROW_COUNT = 5;

export function emptyHeutagogySkill() {
    return { name: '', detail: '', rating: null };
}

export function defaultHeutagogySkills() {
    return Array.from({ length: HEUTAGOGY_ROW_COUNT }, () => emptyHeutagogySkill());
}

export function emptyTopic() {
    return { name: '', detail: '', application: '', rating: null };
}

export function migrateLearningData(learning, keyTopics = []) {
    if (!learning) return { professionalTopics: [], generalTopics: defaultGeneralTopics(keyTopics) };
    if (learning.professionalTopics !== undefined) {
        const heutagogySkills = (learning.heutagogySkills || []).slice(0, HEUTAGOGY_ROW_COUNT);
        while (heutagogySkills.length < HEUTAGOGY_ROW_COUNT) {
            heutagogySkills.push(emptyHeutagogySkill());
        }
        return { ...learning, heutagogySkills };
    }

    const oldTopics = learning.topics || [];
    const generalTopics = defaultGeneralTopics(keyTopics);

    if (oldTopics[0]) {
        const engRow = generalTopics.find((t) => t.name === 'אנגלית');
        if (engRow) {
            engRow.detail = oldTopics[0].learnings?.filter(Boolean).join(', ') || '';
            engRow.application = oldTopics[0].howLearned || '';
        }
    }

    const professionalTopics = oldTopics
        .slice(1)
        .filter((t) => t.name)
        .map((t) => ({
            name: t.name,
            detail: t.learnings?.filter(Boolean).join(', ') || '',
            application: t.howLearned || '',
            rating: null,
        }));

    return { professionalTopics, generalTopics, heutagogySkills: defaultHeutagogySkills() };
}

export function topicFromBank(topic) {
    return { name: topic.name, detail: topic.detail, application: '', rating: null };
}