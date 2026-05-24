export function computeSectionWarnings(items, isHeutagogy = false) {
    const filled = isHeutagogy ? items.filter(s => s.name) : items;
    const min = isHeutagogy ? 3 : 2;
    const warnings = [];

    if (filled.length < min) {
        warnings.push({
            message: `לתעודת הערכה רצינית, חשוב לכלול לפחות ${min} נושאים`,
            red: true,
        });
    }
    if (!isHeutagogy && filled.length > 5) {
        warnings.push({
            message: 'טבלת הנושאים ארוכה מדי, האם ניתן לאחד שורות?',
            red: true,
        });
    }
    if (filled.length > 0) {
        const staffCount = filled.filter(t => t.staffRating != null).length;
        if (staffCount === 0) {
            warnings.push({
                message: 'אין לך הערכת צוות. חשוב לפנות למאסטרים/מנטורים לכתיבת הערכה חיצונית.',
                red: true,
            });
        } else if (staffCount < filled.length / 2) {
            warnings.push({
                message: 'ההערכה שלך מבוססת על הערכה עצמית. חשוב להוסיף עוד הערכות חיצוניות.',
                red: false,
            });
        }
    }

    return warnings;
}

export function hasLearningAlerts(learning) {
    if (!learning) return false;
    return [
        computeSectionWarnings(learning.professionalTopics || []),
        computeSectionWarnings(learning.generalTopics || []),
        computeSectionWarnings(learning.heutagogySkills || [], true),
    ].some(w => w.length > 0);
}
