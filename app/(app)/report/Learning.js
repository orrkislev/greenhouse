'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/utils/store/useUser'
import { useUserGroups } from '@/utils/store/useGroups'
import { supabase } from '@/utils/supabase/client'
import AutoSaveIndicator from './components/AutoSaveIndicator'
import { useSaveOnUnmount } from '@/utils/useSaveOnUnmount'
import { ALLOW_STUDENT_EDIT } from './page'
import TopicBankModal from './TopicBankModal'
import TopicTable from './learning/TopicTable'
import HeutagogyTable from './learning/HeutagogyTable'
import HeutagogySkillBankModal from './learning/HeutagogySkillBankModal'
import {
    defaultGeneralTopics,
    defaultHeutagogySkills,
    emptyHeutagogySkill,
    emptyTopic,
    HEUTAGOGY_ROW_COUNT,
    migrateLearningData,
    topicFromBank,
} from './learning/data'

const HEUTAGOGY_MAJOR_NAME = 'מיומנויות יוטגוגיות';

export default function Learning({ learning, onSave }) {
    const originalUser = useUser(state => state.originalUser);
    const groups = useUserGroups();
    const userMajor = groups.find(g => g.type === 'major')?.name || null;

    const [allTopics, setAllTopics] = useState([]);
    const [topicsLoading, setTopicsLoading] = useState(true);

    useEffect(() => {
        supabase.from('topic_bank').select('*').order('name').then(({ data }) => {
            setAllTopics(data || []);
            setTopicsLoading(false);
        });
    }, []);

    const keyTopics = allTopics.filter(t => t.is_key);
    const heutagogyMajorId = allTopics.find(t => !t.parent_id && t.name === HEUTAGOGY_MAJOR_NAME)?.id;
    const heutagogyTopics = heutagogyMajorId
        ? allTopics.filter(t => t.parent_id === heutagogyMajorId)
        : [];

    const [madeChanges, setMadeChanges] = useState(false);
    const [bankOpen, setBankOpen] = useState(false);
    const [bankDefaultTable, setBankDefaultTable] = useState('professional');
    const [heutagogyBankOpen, setHeutagogyBankOpen] = useState(false);
    const [heutagogyBankRow, setHeutagogyBankRow] = useState(0);

    const [professionalTopics, setProfessionalTopics] = useState([]);
    const [generalTopics, setGeneralTopics] = useState([]);
    const [heutagogySkills, setHeutagogySkills] = useState(defaultHeutagogySkills());

    // Re-init when learning data or key topics change (key topics arrive async)
    useEffect(() => {
        const d = migrateLearningData(learning, keyTopics);
        setProfessionalTopics(d.professionalTopics || []);
        setGeneralTopics(d.generalTopics || defaultGeneralTopics(keyTopics));
        setHeutagogySkills(d.heutagogySkills || defaultHeutagogySkills());
        setMadeChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [learning, topicsLoading]);

    const canEdit = ALLOW_STUDENT_EDIT || !!originalUser;
    const isStaffMode = !!originalUser;

    const updateProfessional = (index, field, value) => {
        setProfessionalTopics(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
        setMadeChanges(true);
    };
    const updateGeneral = (index, field, value) => {
        setGeneralTopics(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
        setMadeChanges(true);
    };
    const removeProfessional = (index) => {
        setProfessionalTopics(prev => prev.filter((_, i) => i !== index));
        setMadeChanges(true);
    };
    const removeGeneral = (index) => {
        setGeneralTopics(prev => prev.filter((_, i) => i !== index));
        setMadeChanges(true);
    };
    const addManualProfessional = () => {
        setProfessionalTopics(prev => [...prev, emptyTopic()]);
        setMadeChanges(true);
    };
    const addManualGeneral = () => {
        setGeneralTopics(prev => [...prev, emptyTopic()]);
        setMadeChanges(true);
    };

    const updateHeutagogy = (index, field, value) => {
        setHeutagogySkills(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
        setMadeChanges(true);
    };

    const clearHeutagogy = (index) => {
        setHeutagogySkills(prev => prev.map((s, i) => i === index ? emptyHeutagogySkill() : s));
        setMadeChanges(true);
    };

    const handleAddFromBank = (topic, tableType) => {
        const newTopic = topicFromBank(topic);
        if (tableType === 'professional') {
            setProfessionalTopics(prev => [...prev, newTopic]);
        } else {
            setGeneralTopics(prev => [...prev, newTopic]);
        }
        setMadeChanges(true);
    };

    const openBank = (tableType) => {
        setBankDefaultTable(tableType);
        setBankOpen(true);
    };

    const openHeutagogyBank = (rowIndex) => {
        setHeutagogyBankRow(rowIndex);
        setHeutagogyBankOpen(true);
    };

    const selectHeutagogySkill = (skill) => {
        setHeutagogySkills((prev) => prev.map((item, index) => (
            index === heutagogyBankRow
                ? { ...item, name: skill.name, detail: skill.detail }
                : item
        )));
        setMadeChanges(true);
    };

    const heutagogyNames = heutagogySkills.map((s) => s.name).filter(Boolean);
    const hasAllHeutagogySkills = heutagogyNames.length === HEUTAGOGY_ROW_COUNT;
    const hasUniqueHeutagogySkills = new Set(heutagogyNames).size === heutagogyNames.length;
    const canSave = madeChanges  && hasUniqueHeutagogySkills;

    useEffect(() => {
        if (!canSave) return;
        const timer = setTimeout(() => {
            onSave({ professionalTopics, generalTopics, heutagogySkills })
                .then(() => setMadeChanges(false))
                .catch(() => setMadeChanges(true));
        }, 800);
        return () => clearTimeout(timer);
    }, [canSave, professionalTopics, generalTopics, heutagogySkills]);

    useSaveOnUnmount(
        () => madeChanges && hasUniqueHeutagogySkills,
        () => ({ professionalTopics, generalTopics, heutagogySkills }),
        onSave
    );

    return (
        <>
            <div className='mt-4 border-2 border-gray-400 bg-white rounded-2xl flex overflow-hidden'>
                <div className='bg-gray-400 p-2 flex items-center justify-center min-w-[60px]'>
                    <div className='text-white rotate-90 text-3xl font-bold whitespace-nowrap'>
                        למידה
                    </div>
                </div>
                <div className='flex-1 p-6'>
                    <TopicTable
                        title="נושאים מקצועיים"
                        topics={professionalTopics}
                        canEdit={canEdit}
                        isStaffMode={isStaffMode}
                        onUpdate={updateProfessional}
                        onRemove={removeProfessional}
                        onAddManual={addManualProfessional}
                        onOpenBank={openBank}
                        tableType="professional"
                        allTopics={allTopics}
                    />
                    <TopicTable
                        title="למידה כללית"
                        topics={generalTopics}
                        canEdit={canEdit}
                        isStaffMode={isStaffMode}
                        onUpdate={updateGeneral}
                        onRemove={removeGeneral}
                        onAddManual={addManualGeneral}
                        onOpenBank={openBank}
                        tableType="general"
                        allTopics={allTopics}
                    />
                    <div className="my-12 border-t border-gray-300/40" />
                    <HeutagogyTable
                        title="מיומנויות יוטגוגיות"
                        skills={heutagogySkills}
                        canEdit={canEdit}
                        isStaffMode={isStaffMode}
                        onOpenBank={openHeutagogyBank}
                        onUpdate={updateHeutagogy}
                        onClear={clearHeutagogy}
                    />
                </div>
            </div>

            <AutoSaveIndicator isDirty={canSave} canEdit={canEdit} />

            {canEdit && !hasAllHeutagogySkills && (
                <div className="mt-2 text-center text-xs text-stone-500">
                    יש לבחור 5 מיומנויות יוטגוגיות שונות
                </div>
            )}

            <TopicBankModal
                isOpen={bankOpen}
                onClose={() => setBankOpen(false)}
                onAddTopic={handleAddFromBank}
                defaultTable={bankDefaultTable}
                userMajor={userMajor}
                allTopics={allTopics}
                heutagogyMajorId={heutagogyMajorId}
                existingProfessional={professionalTopics.map(t => t.name)}
                existingGeneral={generalTopics.map(t => t.name)}
            />
            <HeutagogySkillBankModal
                isOpen={heutagogyBankOpen}
                onClose={() => setHeutagogyBankOpen(false)}
                onSelect={selectHeutagogySkill}
                selectedNames={heutagogyNames}
                currentName={heutagogySkills[heutagogyBankRow]?.name || ''}
                heutagogyTopics={heutagogyTopics}
            />
        </>
    );
}
