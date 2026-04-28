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