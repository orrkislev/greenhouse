'use client'

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWrapped, wrappedActions } from '@/utils/store/useWrapped';
import { useUser } from '@/utils/store/useUser';
import { ChevronLeft, ChevronRight, Sparkles, Trophy, BookOpen, FileText, Flame, Calendar, Star, Heart, Rocket } from 'lucide-react';
import Image from 'next/image';

const MONTH_NAMES = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

// Hebrew gender-based text helper
const getGenderedText = (pronouns, masculine, feminine) => {
    return pronouns === 'she' ? feminine : masculine;
};

const SLIDE_GRADIENTS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
];

export default function WrappedPage() {
    const stats = useWrapped(state => state.stats);
    const loading = useWrapped(state => state.loading);
    const user = useUser(state => state.user);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        if (user) {
            wrappedActions.loadStats();
        }
    }, [user]);

    const nextSlide = () => {
        setDirection(1);
        setCurrentSlide(prev => prev + 1);
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setDirection(-1);
            setCurrentSlide(prev => prev - 1);
        }
    };

    const learningPathSlides = stats?.studyPathsData?.length > 0
        ? stats.studyPathsData.map((path) => (
            <LearningPathSlide key={`path-${path.id}`} path={path} stats={stats} />
        ))
        : [<StudySlide key="study" stats={stats} />];

    const slides = stats ? [
        <IntroSlide key="intro" stats={stats} />,
        <ActivitySlide key="activity" stats={stats} />,
        <FeelingSlide key="feeling" stats={stats} onNext={nextSlide} />,
        ...(stats.featuredProject ? [<ProjectSlide key="project" stats={stats} />] : []),
        ...learningPathSlides,
        <ResearchSlide key="research" stats={stats} />,
        <LearningExperienceSlide key="learning-exp" stats={stats} onNext={nextSlide} />,
        <MentorsSlide key="mentors" stats={stats} />,
        <OutroSlide key="outro" stats={stats} />,
        <LookingForwardSlide key="forward" stats={stats} />,
    ] : [];

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.key === 'ArrowLeft' ? nextSlide() : prevSlide();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide, slides.length]);

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                    <Sparkles className="w-12 h-12 text-purple-500" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen w-full py-8 px-4">
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-600 to-pink-500" style={{ height: 'min(80vh, 700px)', maxHeight: '700px' }}>
                {/* Progress indicators */}
                <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                        >
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: 0 }}
                                animate={{ width: idx < currentSlide ? '100%' : idx === currentSlide ? '100%' : '0%' }}
                                transition={{ duration: idx === currentSlide ? 5 : 0.3 }}
                            />
                        </div>
                    ))}
                </div>

                {/* Slide content */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -direction * 100 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="absolute inset-0"
                        style={{ background: SLIDE_GRADIENTS[currentSlide % SLIDE_GRADIENTS.length] }}
                    >
                        {slides[currentSlide]}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation areas */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
                    onClick={prevSlide}
                />
                <div
                    className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
                    onClick={nextSlide}
                />

                {/* Navigation buttons */}
                {currentSlide > 0 && (
                    <button
                        onClick={prevSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                )}
                {currentSlide < slides.length - 1 && (
                    <button
                        onClick={nextSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                )}
            </div>
        </div>
    );
}

function SlideContainer({ children, className = '' }) {
    return (
        <div className={`h-full flex flex-col items-center justify-center p-8 text-white text-center rtl ${className}`}>
            {children}
        </div>
    );
}

function AnimatedNumber({ value, suffix = '', duration = 2 }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const incrementTime = (duration * 1000) / end;
        const timer = setInterval(() => {
            start += 1;
            setDisplayValue(start);
            if (start >= end) clearInterval(timer);
        }, Math.max(incrementTime, 20));

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{displayValue.toLocaleString()}{suffix}</span>;
}

function IntroSlide({ stats }) {
    const g = (m, f) => getGenderedText(stats.pronouns, m, f);
    return (
        <SlideContainer>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
                <Sparkles className="w-20 h-20 mb-6" />
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold mb-4"
            >
                היי {stats.userName}!
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl opacity-90"
            >
                {g('בוא נראה מה עשית', 'בואי נראה מה עשית')} ב-2025
            </motion.p>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-6xl font-black"
            >
                2025
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1.5 }}
                className="mt-4 text-sm"
            >
                {g('לחץ', 'לחצי')} כדי להמשיך →
            </motion.p>
        </SlideContainer>
    );
}

function ActivitySlide({ stats }) {
    const g = (m, f) => getGenderedText(stats.pronouns, m, f);
    return (
        <SlideContainer>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
            >
                <Calendar className="w-14 h-14 mb-4" />
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.3 }}
                className="text-lg mb-1"
            >
                השנה הזו {g('היית פעיל', 'היית פעילה')}
            </motion.p>
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-6xl font-black mb-1"
            >
                <AnimatedNumber value={stats.activeDays} />
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl mb-4"
            >
                ימים!
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex flex-col gap-3 w-full max-w-xs"
            >
                {stats.mostActiveMonth && (
                    <div className="bg-white/20 rounded-xl p-3">
                        <p className="text-xs opacity-80">החודש הכי פעיל</p>
                        <p className="text-lg font-bold">{MONTH_NAMES[stats.mostActiveMonth.month]}</p>
                    </div>
                )}
                {stats.longestStreak > 0 && (
                    <div className="bg-white/20 rounded-xl p-3">
                        <div className="flex items-center gap-1 justify-center">
                            <Flame className="w-4 h-4" />
                            <p className="text-xs opacity-80">סטריק</p>
                        </div>
                        <p className="text-lg font-bold">{stats.longestStreak} ימים</p>
                    </div>
                )}
            </motion.div>
            {stats.longestStreak >= 7 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 1.6 }}
                    className="mt-3 text-sm"
                >
                    שבוע שלם של עבודה רציפה! ⭐
                </motion.p>
            )}
        </SlideContainer>
    );
}

function ProjectSlide({ stats }) {
    const project = stats.featuredProject;
    return (
        <SlideContainer>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
            >
                <Rocket className="w-16 h-16 mb-4" />
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.3 }}
                className="text-lg mb-2"
            >
                הפרויקט המדהים שלך
            </motion.p>
            <motion.h2
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-3xl font-black mb-4 px-4"
            >
                {project.title}
            </motion.h2>
            {project.image && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="relative w-32 h-32 rounded-2xl overflow-hidden mb-4"
                >
                    <Image src={project.image} alt={project.title} fill className="object-cover" />
                </motion.div>
            )}
            {project.reviewScore !== null && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                    className="bg-white/20 rounded-2xl p-4 mb-4"
                >
                    <p className="text-sm opacity-80 mb-1">ציון למידה וביצוע</p>
                    <p className="text-5xl font-black">{project.reviewScore}</p>
                </motion.div>
            )}
            {project.reviewSummary && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                    className="bg-white/20 rounded-xl p-3 text-sm max-w-xs"
                >
                    <p className="opacity-90 line-clamp-3">{project.reviewSummary}</p>
                </motion.div>
            )}
            {stats.projectsCreated > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="mt-4 flex items-center gap-2 text-sm"
                >
                    <Trophy className="w-4 h-4" />
                    <span>ועוד {stats.projectsCreated - 1} פרויקטים נוספים!</span>
                </motion.div>
            )}
        </SlideContainer>
    );
}

function MentorsSlide({ stats }) {
    const mentors = stats.mentors;
    const g = (m, f) => getGenderedText(stats.pronouns, m, f);
    return (
        <SlideContainer>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
            >
                <Heart className="w-16 h-16 mb-4" fill="white" />
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.3 }}
                className="text-lg mb-2"
            >
                המנטורים שלך
            </motion.p>
            <motion.h2
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-2xl font-bold mb-6"
            >
                {g('גאים בך!', 'גאים בך!')}
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                {mentors.map((mentor, i) => (
                    <motion.div
                        key={mentor.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.2, type: 'spring' }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/30 overflow-hidden mb-2 flex items-center justify-center">
                            {mentor.avatar_url ? (
                                <Image src={mentor.avatar_url} alt={mentor.first_name} width={64} height={64} className="object-cover" />
                            ) : (
                                <span className="text-2xl font-bold">{mentor.first_name?.[0]}</span>
                            )}
                        </div>
                        <p className="text-sm font-medium">{mentor.first_name}</p>
                    </motion.div>
                ))}
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-white/20 rounded-2xl p-4 max-w-xs"
            >
                <p className="text-lg">
                    {mentors.length === 1
                        ? `${mentors[0].first_name} ${g('ליווה אותך', 'ליווה אותך')} השנה ${g('ורואה', 'ורואה')} את ההתקדמות המדהימה שלך!`
                        : `${mentors.map(m => m.first_name).join(' ו')} ${g('ליוו אותך', 'ליוו אותך')} השנה ${g('ורואים', 'ורואים')} את ההתקדמות המדהימה שלך!`
                    }
                </p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-4 flex gap-2"
            >
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ delay: 2.2 + i * 0.1, duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                        <Heart className="w-6 h-6" fill="white" />
                    </motion.div>
                ))}
            </motion.div>
        </SlideContainer>
    );
}

function StudySlide({ stats }) {
    return (
        <SlideContainer>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
            >
                <BookOpen className="w-16 h-16 mb-6" />
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.3 }}
                className="text-lg mb-4"
            >
                למדת ב-
            </motion.p>
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-7xl font-black mb-2"
            >
                <AnimatedNumber value={stats.studyPaths} />
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-2xl mb-8"
            >
                תחומי למידה
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="grid grid-cols-2 gap-4 w-full"
            >
                <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-3xl font-bold"><AnimatedNumber value={stats.vocabularyLearned} /></p>
                    <p className="text-sm opacity-80">מילים חדשות</p>
                </div>
                <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-3xl font-bold"><AnimatedNumber value={stats.sourcesAdded} /></p>
                    <p className="text-sm opacity-80">מקורות</p>
                </div>
            </motion.div>
        </SlideContainer>
    );
}

function FloatingWord({ word, delay, duration, startX }) {
    return (
        <motion.div
            className="absolute text-white/20 font-bold text-lg pointer-events-none whitespace-nowrap"
            initial={{ y: '110%', x: startX, opacity: 0, rotate: Math.random() * 20 - 10 }}
            animate={{
                y: '-110%',
                opacity: [0, 0.4, 0.4, 0],
                rotate: Math.random() * 20 - 10,
            }}
            transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: 'linear',
            }}
            style={{ left: startX }}
        >
            {word}
        </motion.div>
    );
}

function LearningPathSlide({ path, stats }) {
    const g = (m, f) => getGenderedText(stats.pronouns, m, f);
    const vocabulary = path.vocabulary || [];

    // Create multiple instances of words for continuous floating effect
    const floatingWords = [];
    if (vocabulary.length > 0) {
        const wordsToShow = Math.min(vocabulary.length, 8);
        for (let cycle = 0; cycle < 3; cycle++) {
            for (let i = 0; i < wordsToShow; i++) {
                const word = vocabulary[i % vocabulary.length];
                const wordText = typeof word === 'string' ? word : word.word || word.term || '';
                if (wordText) {
                    floatingWords.push({
                        id: `${cycle}-${i}`,
                        word: wordText,
                        delay: cycle * 4 + (i * 1.2),
                        duration: 8 + Math.random() * 4,
                        startX: `${10 + (i * 12) % 80}%`,
                    });
                }
            }
        }
    }

    return (
        <div className="h-full relative overflow-hidden">
            {/* Floating vocabulary words in background */}
            <div className="absolute inset-0 overflow-hidden">
                {floatingWords.map((fw) => (
                    <FloatingWord
                        key={fw.id}
                        word={fw.word}
                        delay={fw.delay}
                        duration={fw.duration}
                        startX={fw.startX}
                    />
                ))}
            </div>

            <SlideContainer className="relative z-10">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    <BookOpen className="w-14 h-14 mb-4" />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm mb-2"
                >
                    {g('רצית ללמוד', 'רצית ללמוד')}
                </motion.p>

                <motion.h2
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
                    className="text-3xl font-black mb-6 px-4 leading-tight"
                >
                    {path.title}
                </motion.h2>

                {vocabulary.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 w-full"
                    >
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sparkles className="w-5 h-5" />
                            </motion.div>
                            <p className="text-lg font-bold">{g('למדת', 'למדת')}</p>
                        </div>
                        <motion.p
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.1, type: 'spring' }}
                            className="text-5xl font-black mb-1"
                        >
                            <AnimatedNumber value={vocabulary.length} />
                        </motion.p>
                        <p className="text-sm opacity-80">מילים חדשות</p>
                    </motion.div>
                )}

                {path.sourcesCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4 }}
                        className="mt-4 bg-white/15 rounded-xl px-4 py-2 flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{path.sourcesCount} מקורות</span>
                    </motion.div>
                )}

                {vocabulary.length === 0 && path.sourcesCount === 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.9 }}
                        className="text-sm mt-4"
                    >
                        מסלול למידה בהתהוות...
                    </motion.p>
                )}
            </SlideContainer>
        </div>
    );
}

function ResearchSlide({ stats }) {
    const research = stats.featuredResearch;
    const g = (m, f) => getGenderedText(stats.pronouns, m, f);
    const vocabulary = research?.vocabulary || [];

    // Create floating words for research vocabulary
    const floatingWords = [];
    if (vocabulary.length > 0) {
        const wordsToShow = Math.min(vocabulary.length, 10);
        for (let cycle = 0; cycle < 3; cycle++) {
            for (let i = 0; i < wordsToShow; i++) {
                const word = vocabulary[i % vocabulary.length];
                if (word) {
                    floatingWords.push({
                        id: `research-${cycle}-${i}`,
                        word: word,
                        delay: cycle * 3.5 + (i * 1),
                        duration: 7 + Math.random() * 3,
                        startX: `${5 + (i * 10) % 85}%`,
                    });
                }
            }
        }
    }

    return (
        <div className="h-full relative overflow-hidden">
            {/* Floating vocabulary words in background */}
            <div className="absolute inset-0 overflow-hidden">
                {floatingWords.map((fw) => (
                    <FloatingWord
                        key={fw.id}
                        word={fw.word}
                        delay={fw.delay}
                        duration={fw.duration}
                        startX={fw.startX}
                    />
                ))}
            </div>

            <SlideContainer className="relative z-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                >
                    <FileText className="w-16 h-16 mb-4" />
                </motion.div>
                {research ? (
                    <>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg mb-2"
                        >
                            המחקר המרתק שלך
                        </motion.p>
                        <motion.h2
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="text-2xl font-black mb-4 px-4"
                        >
                            {research.title}
                        </motion.h2>
                        {research.reviewSummary && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 max-w-xs"
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </motion.div>
                                </div>
                                <p className="opacity-90 text-sm leading-relaxed">{research.reviewSummary}</p>
                            </motion.div>
                        )}
                        {stats.researchDocuments > 1 && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                transition={{ delay: 1.4 }}
                                className="mt-4 text-sm"
                            >
                                ועוד {stats.researchDocuments - 1} מסמכי מחקר נוספים!
                            </motion.p>
                        )}
                    </>
                ) : (
                    <>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg mb-2"
                        >
                            {g('כתבת', 'כתבת')}
                        </motion.p>
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="text-6xl font-black mb-2"
                        >
                            <AnimatedNumber value={stats.researchDocuments} />
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-2xl mb-6"
                        >
                            מסמכי מחקר!
                        </motion.p>
                    </>
                )}
            </SlideContainer>
        </div>
    );
}

function OutroSlide({ stats }) {
    const g = (m, f) => getGenderedText(stats.pronouns, m, f);
    return (
        <SlideContainer>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-6"
            >
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="inline-block"
                    >
                        <Star className="w-8 h-8 mx-1" fill="white" />
                    </motion.div>
                ))}
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-3xl font-bold mb-4"
            >
                כל הכבוד!
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-lg opacity-90 mb-8"
            >
                {g('עשית', 'עשית')} עבודה מדהימה ב-2025
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="bg-white/20 rounded-2xl p-6 w-full"
            >
                <p className="text-sm opacity-80 mb-4">סיכום השנה שלך:</p>
                <div className="grid grid-cols-2 gap-3 text-right">
                    <div className="text-sm">
                        <span className="font-bold">{stats.activeDays}</span> ימים פעילים
                    </div>
                    <div className="text-sm">
                        <span className="font-bold">{stats.completedTasks}</span> משימות
                    </div>
                    <div className="text-sm">
                        <span className="font-bold">{stats.studyPaths}</span> תחומי למידה
                    </div>
                    <div className="text-sm">
                        <span className="font-bold">{stats.researchDocuments}</span> מסמכים
                    </div>
                </div>
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-8 text-xl font-bold"
            >
                נתראה ב-2026! 🚀
            </motion.p>
        </SlideContainer>
    );
}

function FeelingSlide({ stats, onNext }) {
    const [selected, setSelected] = useState(null);

    const options = [
        { label: 'מעולה', emoji: '🤩' },
        { label: 'טוב מאוד', emoji: '😊' },
        { label: 'מדהים', emoji: '🚀' },
    ];

    const handleSelect = (index) => {
        setSelected(index);
        setTimeout(() => {
            onNext?.();
        }, 800);
    };

    return (
        <SlideContainer>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-6xl mb-6"
            >
                🎭
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold mb-8"
            >
                איך הרגשת השנה?
            </motion.h2>

            <div className="flex flex-col gap-3 w-full">
                {options.map((option, i) => (
                    <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            scale: selected === i ? 1.1 : 1,
                            backgroundColor: selected === i ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'
                        }}
                        transition={{ delay: 0.6 + i * 0.15, type: 'spring' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(i)}
                        className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center justify-center gap-3 cursor-pointer"
                    >
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-lg font-bold">{option.label}</span>
                    </motion.button>
                ))}
            </div>

            {selected !== null && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="mt-6 text-4xl"
                >
                    🎉
                </motion.div>
            )}
        </SlideContainer>
    );
}

function LearningExperienceSlide({ stats, onNext }) {
    const [selected, setSelected] = useState(null);
    const g = (m, f) => getGenderedText(stats.pronouns, m, f);

    const options = [
        { label: g('למדתי המון', 'למדתי המון'), emoji: '🧠' },
        { label: g('גיליתי דברים חדשים', 'גיליתי דברים חדשים'), emoji: '💡' },
        { label: g('התפתחתי מאוד', 'התפתחתי מאוד'), emoji: '🌱' },
    ];

    const handleSelect = (index) => {
        setSelected(index);
        setTimeout(() => {
            onNext?.();
        }, 800);
    };

    return (
        <SlideContainer>
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-6xl mb-6"
            >
                ✨
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold mb-8"
            >
                מה הכי {g('אהבת', 'אהבת')} השנה?
            </motion.h2>

            <div className="flex flex-col gap-3 w-full">
                {options.map((option, i) => (
                    <motion.button
                        key={i}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            scale: selected === i ? 1.1 : 1,
                            backgroundColor: selected === i ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'
                        }}
                        transition={{ delay: 0.6 + i * 0.15, type: 'spring' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(i)}
                        className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center justify-center gap-3 cursor-pointer"
                    >
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-lg font-bold">{option.label}</span>
                    </motion.button>
                ))}
            </div>

            {selected !== null && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="mt-6"
                >
                    <motion.p
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                        className="text-xl font-bold"
                    >
                        {g('מדהים!', 'מדהימה!')} 🌟
                    </motion.p>
                </motion.div>
            )}
        </SlideContainer>
    );
}

function LookingForwardSlide({ stats }) {
    const g = (m, f) => getGenderedText(stats.pronouns, m, f);

    const questions = [
        { text: g('לאן תגיע השנה?', 'לאן תגיעי השנה?'), delay: 0.5 },
        { text: g('מה תלמד?', 'מה תלמדי?'), delay: 1.2 },
        { text: g('מה תיצור?', 'מה תיצרי?'), delay: 1.9 },
        { text: g('איזה דברים מדהימים תעשה?', 'איזה דברים מדהימים תעשי?'), delay: 2.6 },
    ];

    return (
        <SlideContainer>
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                className="mb-6"
            >
                <Rocket className="w-16 h-16" />
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.3 }}
                className="text-lg mb-6"
            >
                כולם כבר רוצים לראות...
            </motion.p>

            <div className="space-y-4 w-full">
                {questions.map((q, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: q.delay, type: 'spring', stiffness: 100 }}
                        className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3"
                    >
                        <motion.p
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ delay: q.delay + 0.5, duration: 2, repeat: Infinity }}
                            className="text-lg font-bold"
                        >
                            {q.text}
                        </motion.p>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.5, type: 'spring' }}
                className="mt-8 flex items-center gap-2"
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <Sparkles className="w-6 h-6" />
                </motion.div>
                <p className="text-xl font-bold">2026 מחכה לך!</p>
                <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <Sparkles className="w-6 h-6" />
                </motion.div>
            </motion.div>
        </SlideContainer>
    );
}
