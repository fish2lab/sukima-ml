
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import clsx from 'clsx'; // Ensure clsx is installed or use template literals
import { questions, chapters, targetArtworks, Vector3, Chapter, Question, Option } from '../data/touhou-questions';
import useBaseUrl from '@docusaurus/useBaseUrl';

// --- Constants ---
const LOADING_DURATION_MS = 3000;

// --- View Components ---
// 定义在模块级：若定义在页面组件内部，每次 state 变化（答题、显示解析等）都会
// 生成新的组件类型，导致整个视图子树被 React 卸载重建（入场动画反复重放、DOM 状态丢失）。

interface IntroViewProps {
    logoUrl: string;
    onStart: () => void;
}

const IntroView = ({ logoUrl, onStart }: IntroViewProps) => (
    <motion.div
        key="intro"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center p-6 text-center max-w-md w-full"
    >
        {/* LOGO */}
        <div className="w-full max-w-[200px] mb-8">
            <img src={logoUrl} alt="Sukima ML Logo" className="w-full h-auto" />
        </div>

        <h1 className="text-3xl font-bold mb-4 font-serif">红·妖·永中的<br />零设叙事</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-sm md:text-base">
            穿越红魔馆的迷雾，跨过白玉楼的幽冥，<br />
            最终抵达永远亭的满月。<br />
            <br />
            21道民俗学试炼，<br />
            探寻你灵魂深处的幻想乡归属。
        </p>

        <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all duration-200 bg-black font-sans rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg"
        >
            开启境界
            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-8 text-xs text-gray-400">
            <a href="/sukima-ml" className="underline hover:text-gray-600 dark:hover:text-gray-200">参观画廊</a>
        </div>
    </motion.div>
);

interface ChapterIntroViewProps {
    chapter: Chapter;
    chapterIndex: number;
    onStart: () => void;
}

const ChapterIntroView = ({ chapter, chapterIndex, onStart }: ChapterIntroViewProps) => (
    <motion.div
        key="chapter-intro"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="flex flex-col items-center justify-center p-8 text-center max-w-lg w-full h-[50vh]"
        onClick={onStart} // clickable whole area
    >
        <div className="text-sm font-mono text-gray-400 mb-4 tracking-widest uppercase">
            Chapter {chapterIndex + 1}
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
            {chapter.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-10 leading-relaxed whitespace-pre-wrap">
            {chapter.intro}
        </p>

        <div className="animate-bounce">
            <ArrowRight className="w-6 h-6 text-gray-400" />
        </div>
        <div className="text-xs text-gray-400 mt-2">点击继续</div>
    </motion.div>
);

interface QuestionViewProps {
    chapter: Chapter;
    question: Question | undefined;
    globalIndex: number;
    options: Option[];
    showFeedback: boolean;
    onOptionClick: (opt: Option, idx: number) => void;
    onNext: () => void;
}

const QuestionView = ({ chapter, question, globalIndex, options, showFeedback, onOptionClick, onNext }: QuestionViewProps) => {
    // Progress calculation (Global)
    const totalQuestions = questions.length;
    // We can just use the global index we tracked roughly, or map ids.
    // Ideally we'd flatten the chapter structure to get exact progress, but simple counter works.
    const progress = ((globalIndex + 1) / totalQuestions) * 100;

    if (!question) return null;

    return (
        <motion.div
            key={`q-${question.id}`} // Force re-render on new question for anims
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg p-6 flex flex-col min-h-[70vh] relative"
        >
            {/* Header: Chapter & Progress */}
            <div className="w-full flex justify-between items-end mb-4 border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {chapter.title}
                </span>
                <span className="text-xs font-mono text-gray-300">
                    {globalIndex + 1} / {totalQuestions}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-black"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            {/* Question Text */}
            <div className="flex-grow mb-8">
                <h2 className="text-lg md:text-xl font-serif font-medium leading-relaxed">
                    {question.text}
                </h2>
            </div>

            {/* Options Area */}
            <div className="relative flex flex-col gap-3">
                {options.map((opt, idx) => {
                    const label = String.fromCharCode(65 + idx); // A, B, C, D...
                    return (
                        <button
                            key={idx}
                            onClick={() => onOptionClick(opt, idx)}
                            disabled={showFeedback}
                            className={clsx(
                                "w-full text-left p-4 rounded-xl border transition-all duration-300 text-sm md:text-base flex items-start",
                                showFeedback
                                    ? "blur-sm opacity-50 border-gray-200 cursor-default" // Frosted effect base
                                    : "border-gray-200 hover:border-black hover:bg-gray-50 active:scale-[0.98] cursor-pointer"
                            )}
                        >
                            <span className="font-bold mr-2 text-gray-500 min-w-[1.5rem]">{label}.</span>
                            <span>{opt.text}</span>
                        </button>
                    );
                })}

                {/* FEEDBACK OVERLAY (Glassmorphism) */}
                <AnimatePresence>
                    {showFeedback && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                            className="absolute inset-0 z-10 flex items-center justify-center"
                        >
                            {/* Content Card */}
                            <motion.div
                                initial={{ scale: 0.9, y: 10 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-white/90 dark:bg-black/90 p-6 rounded-2xl shadow-2xl border border-white/20 max-h-[100%] overflow-y-auto"
                            >
                                <div className="text-xs font-bold text-gray-400 uppercase mb-2">解析</div>
                                <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-6 font-serif">
                                    {question.explanation}
                                </p>

                                <button
                                    onClick={onNext}
                                    className="w-full py-3 bg-black text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors"
                                >
                                    下一题
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

interface LoadingViewProps {
    result: typeof targetArtworks[0] | null;
}

const LoadingView = ({ result }: LoadingViewProps) => {
    // Map Result Title to Game Name for the text
    const getGameName = () => {
        if (!result) return "某部作品";
        if (result.id === "001") return "《东方妖妖梦》";
        if (result.id === "002") return "《东方红魔乡》";
        if (result.id === "003") return "《东方永夜抄》";
        return "某部作品";
    };

    return (
        <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-6 text-center max-w-md"
        >
            <div className="animate-spin text-4xl mb-6">☯️</div>
            <h3 className="text-xl font-serif mb-4">正在测定幻想乡坐标...</h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                你可能对{getGameName()}情有独钟。<br />
                这是一份幻想入的世界名画，<br />
                请点进你的本命作品看一眼吧<br />
                <span className="text-xs text-gray-400 mt-2 block">（抱一副回家就更好了）</span>
            </p>
        </motion.div>
    );
};

export default function TouhouTestPage() {
    const history = useHistory();
    const logoUrl = useBaseUrl('/img/sukima-ml.svg');

    // State
    const [view, setView] = useState<'intro' | 'chapter-intro' | 'test' | 'loading'>('intro');
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [currentQuestionGlobalIndex, setCurrentQuestionGlobalIndex] = useState(0); // Index in the global `questions` array
    const [currentChapterQuestionIndex, setCurrentChapterQuestionIndex] = useState(0); // Index within the current chapter's list

    const [userVector, setUserVector] = useState<Vector3>({ x: 0, y: 0, z: 0 });
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const [calculatedResult, setCalculatedResult] = useState<typeof targetArtworks[0] | null>(null);

    // 结果页跳转定时器：组件卸载时清理，避免离开后仍触发跳转
    const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => {
        if (redirectTimerRef.current !== null) {
            clearTimeout(redirectTimerRef.current);
        }
    }, []);

    // Derived state
    const currentChapter = chapters[currentChapterIndex];
    // Calculate the actual question object based on the chapter's ID list
    const currentQuestionId = currentChapter ? currentChapter.questionIds[currentChapterQuestionIndex] : 0;
    const currentQuestion = questions.find(q => q.id === currentQuestionId);

    // Randomize options only when the question changes
    const randomizedOptions = useMemo(() => {
        if (!currentQuestion) return [];
        // clone and shuffle
        return [...currentQuestion.options].sort(() => Math.random() - 0.5);
    }, [currentQuestion]);

    // Calculate Cosine Similarity
    const calculateResult = (finalVector: Vector3) => {
        const dot = (v1: Vector3, v2: Vector3) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        const mag = (v: Vector3) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

        const userMag = mag(finalVector);
        if (userMag === 0) return targetArtworks[0];

        let maxSimilarity = -2;
        let bestMatch = targetArtworks[0];

        targetArtworks.forEach(target => {
            const similarity = dot(finalVector, target.vector) / (userMag * mag(target.vector));
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                bestMatch = target;
            }
        });

        return bestMatch;
    };

    const handleStart = () => {
        setView('chapter-intro');
    };

    const handleChapterStart = () => {
        setView('test');
    };

    const handleOptionClick = (opt: Option, idx: number) => {
        if (showFeedback) return; // Prevent double clicks
        setSelectedOptionIndex(idx);

        // Update Vector immediately (or could wait, but immediate is fine)
        const newVector = {
            x: userVector.x + opt.vector.x,
            y: userVector.y + opt.vector.y,
            z: userVector.z + opt.vector.z
        };
        setUserVector(newVector);
        setShowFeedback(true);
    };

    const handleNextQuestion = () => {
        setShowFeedback(false);
        setSelectedOptionIndex(null);

        // Check if more questions in this chapter
        if (currentChapterQuestionIndex < currentChapter.questionIds.length - 1) {
            setCurrentChapterQuestionIndex(prev => prev + 1);
            setCurrentQuestionGlobalIndex(prev => prev + 1); // rough progress tracking
        } else {
            // End of chapter
            if (currentChapterIndex < chapters.length - 1) {
                // Go to next chapter
                setCurrentChapterIndex(prev => prev + 1);
                setCurrentChapterQuestionIndex(0);
                setCurrentQuestionGlobalIndex(prev => prev + 1);
                setView('chapter-intro');
            } else {
                // End of all chapters
                // Calculate result immediately
                const finalResult = calculateResult(userVector);
                setCalculatedResult(finalResult);

                setView('loading');
                redirectTimerRef.current = setTimeout(() => {
                    history.push(`/sukima-ml?featured=${finalResult.id}`);
                }, LOADING_DURATION_MS);
            }
        }
    };

    // --- Render Components ---

    return (
        <Layout title="红·妖·永中的零设叙事" description="探索你的本命作品">
            <main className="min-h-screen w-full bg-[#fafafa] dark:bg-[#111] flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500">

                {/* Background Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }}
                />

                <AnimatePresence mode="wait">
                    {view === 'intro' && <IntroView logoUrl={logoUrl} onStart={handleStart} />}
                    {view === 'chapter-intro' && <ChapterIntroView chapter={currentChapter} chapterIndex={currentChapterIndex} onStart={handleChapterStart} />}
                    {view === 'test' && (
                        <QuestionView
                            chapter={currentChapter}
                            question={currentQuestion}
                            globalIndex={currentQuestionGlobalIndex}
                            options={randomizedOptions}
                            showFeedback={showFeedback}
                            onOptionClick={handleOptionClick}
                            onNext={handleNextQuestion}
                        />
                    )}
                    {view === 'loading' && <LoadingView result={calculatedResult} />}
                </AnimatePresence>

            </main>
        </Layout>
    );
}
