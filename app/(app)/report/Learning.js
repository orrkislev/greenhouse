'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/utils/store/useUser'
import { useUserGroups } from '@/utils/store/useGroups'
import Button from '@/components/Button'
import { motion, AnimatePresence } from 'motion/react'
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

export default function Learning({ learning, onSave }) {
    const originalUser = useUser(state => state.originalUser);
    const groups = useUserGroups();
    const userMajor = groups.find(g => g.type === 'major')?.name || null;

    const [madeChanges, setMadeChanges] = useState(false);
    const [bankOpen, setBankOpen] = useState(false);
    const [bankDefaultTable, setBankDefaultTable] = useState('professional');
    const [heutagogyBankOpen, setHeutagogyBankOpen] = useState(false);
    const [heutagogyBankRow, setHeutagogyBankRow] = useState(0);

    const migratedData = migrateLearningData(learning);
    const [professionalTopics, setProfessionalTopics] = useState(migratedData.professionalTopics || []);
    const [generalTopics, setGeneralTopics] = useState(migratedData.generalTopics || defaultGeneralTopics());
    const [heutagogySkills, setHeutagogySkills] = useState(migratedData.heutagogySkills || defaultHeutagogySkills());

    useEffect(() => {
        const d = migrateLearningData(learning);
        setProfessionalTopics(d.professionalTopics || []);
        setGeneralTopics(d.generalTopics || defaultGeneralTopics());
        setHeutagogySkills(d.heutagogySkills || defaultHeutagogySkills());
        setMadeChanges(false);
    }, [learning]);

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

    const handleSave = () => {
        if (!hasAllHeutagogySkills || !hasUniqueHeutagogySkills) {
            return;
        }
        onSave({ professionalTopics, generalTopics, heutagogySkills });
        setMadeChanges(false);
    };

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

            <AnimatePresence>
                {canEdit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{
                            opacity: madeChanges ? 1 : 0.5,
                            y: madeChanges ? 0 : -10,
                            scale: madeChanges ? 1 : 0.95,
                        }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="mt-4 flex justify-center"
                    >
                        <Button
                            data-role="save"
                            onClick={handleSave}
                            disabled={!canSave}
                            className={canSave ? 'shadow-lg' : ''}
                        >
                            שמירה
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {canEdit && (!hasAllHeutagogySkills || !hasUniqueHeutagogySkills) && (
                <div className="mt-2 text-center text-xs text-stone-500">
                    יש לבחור 5 מיומנויות יוטגוגיות שונות לפני שמירה.
                </div>
            )}

            <TopicBankModal
                isOpen={bankOpen}
                onClose={() => setBankOpen(false)}
                onAddTopic={handleAddFromBank}
                defaultTable={bankDefaultTable}
                userMajor={userMajor}
            />
            <HeutagogySkillBankModal
                isOpen={heutagogyBankOpen}
                onClose={() => setHeutagogyBankOpen(false)}
                onSelect={selectHeutagogySkill}
                selectedNames={heutagogyNames}
                currentName={heutagogySkills[heutagogyBankRow]?.name || ''}
            />
        </>
    );
}
