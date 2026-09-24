import React, { useState, useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import { translate } from '@docusaurus/Translate';
import { motion, AnimatePresence, MotionConfig, animate, useMotionValue } from 'framer-motion';
import clsx from 'clsx';
import { questions, chapters, targetArtworks, Vector3, Chapter, Question, Option } from '../data/touhou-questions';
import { artworks } from '../data/galleryData';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
    Caption,
    HandTitle,
    InkButton,
    InkFrame,
    LabelCard,
    PaperSection,
    RoughBorder,
    SukimaSlit,
    motionAllowedNow,
    useJitterTick,
} from '../components/woodcut';
import ExhibitCard from '../components/pages/ExhibitCard';
import InkCircleNum from '../components/pages/InkCircleNum';
import { tickMark } from '../components/pages/marks';
import styles from './touhou-test.module.css';

// --- Constants ---
const LOADING_DURATION_MS = 3000;

/** 尺子上每道题一根刻度（形状按 seed 固定） */
const TICKS = questions.map((_, i) => tickMark(200 + i));

/** 换视图：停住、突然动、再停住（短、easeOut），减少动态时 framer-motion 只留透明度 */
const VIEW_MOTION = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
};

/** 视图出现时把焦点移过去（键盘、读屏跟着走）；selector 为空时聚焦容器本身 */
function useFocusOnMount(ref: RefObject<HTMLElement | null>, selector?: string) {
    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        const target = selector ? root.querySelector<HTMLElement>(selector) : root;
        target?.focus();
        // 只在挂载时聚焦一次
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

// --- View Components ---
// 定义在模块级：若定义在页面组件内部，每次 state 变化（答题、显示解析等）都会
// 生成新的组件类型，导致整个视图子树被 React 卸载重建（入场动画反复重放、DOM 状态丢失）。

interface IntroViewProps {
    logoUrl: string;
    onStart: () => void;
}

const IntroView = ({ logoUrl, onStart }: IntroViewProps) => (
    <motion.div key="intro" {...VIEW_MOTION} className={styles.view}>
        <ExhibitCard className={clsx(styles.sheet, styles.cover)} seed={141} nominal={[560, 640]}>
            {/* LOGO */}
            <div className={styles.logo}>
                <img src={logoUrl} alt="Sukima ML Logo" width={200} height={120} decoding="async" />
            </div>

            <HandTitle as="h1" size="title" className={styles.coverTitle}>{'红·妖·永中的\n零设叙事'}</HandTitle>
            <p className={styles.lead}>
                穿越红魔馆的迷雾，跨过白玉楼的幽冥，<br />
                最终抵达永远亭的满月。<br />
                <br />
                21道民俗学试炼，<br />
                探寻你灵魂深处的幻想乡归属。
            </p>

            <InkButton variant="solid" size="lg" onClick={onStart}>
                开启境界
            </InkButton>

            <div className={styles.galleryLink}>
                <Link to="/sukima-ml">参观画廊</Link>
            </div>
        </ExhibitCard>
    </motion.div>
);

interface ChapterIntroViewProps {
    chapter: Chapter;
    chapterIndex: number;
    onStart: () => void;
}

const ChapterIntroView = ({ chapter, chapterIndex, onStart }: ChapterIntroViewProps) => {
    const ref = useRef<HTMLDivElement>(null);
    useFocusOnMount(ref, 'button');
    return (
        <motion.div
            key="chapter-intro"
            ref={ref}
            {...VIEW_MOTION}
            className={clsx(styles.view, styles.chapterView)}
            onClick={onStart} // clickable whole area
        >
            <ExhibitCard className={clsx(styles.sheet, styles.chapterSheet)} seed={151 + chapterIndex} nominal={[560, 420]}>
                <div className={clsx(styles.chapterNo, 'wc-mono')}>
                    Chapter {chapterIndex + 1}
                </div>
                <HandTitle as="h2" size="title" className={styles.chapterTitle}>
                    {chapter.title}
                </HandTitle>
                <p className={styles.chapterIntro}>
                    {chapter.intro}
                </p>
                <InkButton
                    size="md"
                    onClick={(e) => {
                        e.stopPropagation();
                        onStart();
                    }}
                >
                    点击继续
                </InkButton>
            </ExhibitCard>
        </motion.div>
    );
};

/** 进度：一把手画的尺子，每道题一根刻度；答到哪一题，刻度就被墨描到哪里 */
function Ruler({ index, total }: { index: number; total: number }): ReactNode {
    const n = index + 1;
    return (
        <div
            className={styles.ruler}
            role="progressbar"
            aria-label={translate({ id: 'test.progress.label', message: '答题进度' })}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={n}
            aria-valuetext={`${n} / ${total}`}
        >
            <RoughBorder variant="line" weight={1.6} amp={0.5} seed={121} nominal={[560, 48]} className={styles.rulerEdge} />
            <div className={styles.ticks} aria-hidden="true">
                {TICKS.slice(0, total).map((t, i) => {
                    const major = i === 0 || (i + 1) % 5 === 0;
                    return (
                        <span
                            key={i}
                            className={styles.tick}
                            data-state={i < index ? 'done' : i === index ? 'now' : 'todo'}
                            data-major={major || undefined}
                        >
                            <svg className={styles.tickSvg} viewBox={`0 0 ${t.w} ${t.h}`} preserveAspectRatio="none" focusable="false">
                                <path d={t.d} fill="currentColor" />
                            </svg>
                            {major ? <span className={clsx(styles.tickNum, 'wc-mono')}>{i + 1}</span> : null}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

interface QuizOptionProps {
    label: string;
    text: string;
    selected: boolean;
    disabled: boolean;
    seed: number;
    onPick: () => void;
}

/** 选项框：木刻毛边，悬停时边抖；选中时被墨从左往右涂满、字变纸色 */
function QuizOption({ label, text, selected, disabled, seed, onPick }: QuizOptionProps): ReactNode {
    const [hot, setHot] = useState(false);
    const tick = useJitterTick(hot && !disabled);
    return (
        <button
            type="button"
            className={styles.option}
            data-selected={selected || undefined}
            aria-pressed={selected}
            disabled={disabled}
            onClick={onPick}
            onPointerEnter={() => setHot(true)}
            onPointerLeave={() => setHot(false)}
            onFocus={() => setHot(true)}
            onBlur={() => setHot(false)}
        >
            <span className={styles.optFill} aria-hidden="true" />
            <RoughBorder variant="line" weight={2} amp={0.6} seed={seed} jitter={tick} nominal={[560, 60]} className={styles.optEdge} />
            <span className={styles.optLabel}>{label}.</span>
            <span className={styles.optText}>{text}</span>
        </button>
    );
}

interface QuestionViewProps {
    chapter: Chapter;
    question: Question | undefined;
    globalIndex: number;
    options: Option[];
    showFeedback: boolean;
    selectedIndex: number | null;
    onOptionClick: (opt: Option, idx: number) => void;
    onNext: () => void;
}

const QuestionView = ({ chapter, question, globalIndex, options, showFeedback, selectedIndex, onOptionClick, onNext }: QuestionViewProps) => {
    const totalQuestions = questions.length;
    const headingRef = useRef<HTMLHeadingElement>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);
    useFocusOnMount(headingRef);

    // 答完一题：焦点移到「下一题」，解析卡跟着滚进视口
    useEffect(() => {
        if (showFeedback) feedbackRef.current?.querySelector<HTMLElement>('button')?.focus();
    }, [showFeedback]);

    if (!question) return null;

    const headingId = `q-${question.id}-text`;
    return (
        <motion.div
            key={`q-${question.id}`} // Force re-render on new question for anims
            {...VIEW_MOTION}
            className={styles.view}
        >
            <ExhibitCard as="section" className={clsx(styles.sheet, styles.paper)} seed={161} nominal={[640, 760]}>
                {/* Header: Chapter & Progress */}
                <div className={styles.paperHead}>
                    <Caption size="sm">{chapter.title}</Caption>
                    <span className={clsx(styles.count, 'wc-mono')} aria-hidden="true">
                        {globalIndex + 1} / {totalQuestions}
                    </span>
                </div>

                <Ruler index={globalIndex} total={totalQuestions} />

                {/* Question Text */}
                <div className={styles.qRow}>
                    <InkCircleNum size="lg" seed={300 + question.id}>{String(globalIndex + 1)}</InkCircleNum>
                    <h2 ref={headingRef} id={headingId} tabIndex={-1} className={styles.qText}>
                        <span className="wc-sr-only">
                            {translate({ id: 'test.question.number', message: '第 {n} 题' }, { n: globalIndex + 1 })}
                        </span>
                        {question.text}
                    </h2>
                </div>

                {/* Options Area */}
                <div className={styles.options} role="group" aria-labelledby={headingId}>
                    {options.map((opt, idx) => (
                        <QuizOption
                            key={idx}
                            label={String.fromCharCode(65 + idx)} // A, B, C, D...
                            text={opt.text}
                            selected={selectedIndex === idx}
                            disabled={showFeedback}
                            seed={400 + question.id * 7 + idx}
                            onPick={() => onOptionClick(opt, idx)}
                        />
                    ))}
                </div>

                {/* 解析：一张展签翻出来 */}
                {showFeedback && (
                    <div ref={feedbackRef} className={styles.feedback}>
                        <LabelCard titleAs="h3" title="解析" seed={171 + question.id} nominal={[560, 260]}>
                            <p className={styles.explanation}>
                                {question.explanation}
                            </p>
                            <div className={styles.nextRow}>
                                <InkButton variant="solid" size="lg" onClick={onNext}>
                                    下一题
                                </InkButton>
                            </div>
                        </LabelCard>
                    </div>
                )}
            </ExhibitCard>
        </motion.div>
    );
};

interface LoadingViewProps {
    result: typeof targetArtworks[0] | null;
}

const LoadingView = ({ result }: LoadingViewProps) => {
    const ref = useRef<HTMLDivElement>(null);
    useFocusOnMount(ref);
    const open = useMotionValue(0);
    const artwork = result ? artworks.find((a) => a.id === result.id) : undefined;
    const artworkSrc = useBaseUrl(artwork?.imagePath ?? '');

    // 隙间张合几次（代替原来的转圈）；减少动态时直接张开、不动
    useEffect(() => {
        if (!motionAllowedNow()) {
            open.set(1);
            return undefined;
        }
        const controls = animate(open, [0, 1, 0.35, 1, 0.55, 1], {
            duration: 2.6,
            times: [0, 0.18, 0.38, 0.58, 0.78, 1],
            ease: 'easeOut',
        });
        return () => controls.stop();
    }, [open]);

    // Map Result Title to Game Name for the text
    const getGameName = () => {
        if (!result) return "某部作品";
        if (result.id === "001") return "《东方妖妖梦》";
        if (result.id === "002") return "《东方红魔乡》";
        if (result.id === "003") return "《东方永夜抄》";
        return "某部作品";
    };

    return (
        <motion.div key="loading" {...VIEW_MOTION} className={clsx(styles.view, styles.loadingView)}>
            <div className={styles.slitBox}>
                <SukimaSlit open={open} eyes={7} aspect={3.8} seed={131} glance={0.5} />
            </div>
            <div ref={ref} tabIndex={-1} className={styles.loadingHead}>
                <HandTitle as="h2" size="section" per={0.05} className={styles.loadingTitle}>
                    正在测定幻想乡坐标...
                </HandTitle>
            </div>
            <div className={styles.result} data-has-art={artwork ? true : undefined}>
                {artwork ? (
                    <div className={styles.resultFrame}>
                        <InkFrame hang swing size="md" seed={133} nominal={[300, 360]}>
                            <img src={artworkSrc} alt={artwork.title} width={artwork.imageWidth} height={artwork.imageHeight} loading="eager" decoding="async" />
                        </InkFrame>
                    </div>
                ) : null}
                <LabelCard
                    className={styles.resultCard}
                    title={artwork?.title}
                    lines={artwork ? [artwork.originalPainting, artwork.touhouCharacter] : []}
                    seed={137}
                    nominal={[440, 360]}
                >
                    <p className={styles.resultText}>
                        你可能对{getGameName()}情有独钟。<br />
                        这是一份幻想入的世界名画，<br />
                        请点进你的本命作品看一眼吧<br />
                        <span className={styles.resultNote}>（抱一副回家就更好了）</span>
                    </p>
                </LabelCard>
            </div>
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
            <PaperSection as="main" tone="paper" width="narrow" space="md" className={styles.stage} innerClassName={styles.stageInner}>
                <MotionConfig reducedMotion="user">
                    <AnimatePresence mode="wait" initial={false}>
                        {view === 'intro' && <IntroView key="intro" logoUrl={logoUrl} onStart={handleStart} />}
                        {view === 'chapter-intro' && <ChapterIntroView key="chapter-intro" chapter={currentChapter} chapterIndex={currentChapterIndex} onStart={handleChapterStart} />}
                        {view === 'test' && (
                            <QuestionView
                                key={`q-${currentQuestionId}`}
                                chapter={currentChapter}
                                question={currentQuestion}
                                globalIndex={currentQuestionGlobalIndex}
                                options={randomizedOptions}
                                showFeedback={showFeedback}
                                selectedIndex={selectedOptionIndex}
                                onOptionClick={handleOptionClick}
                                onNext={handleNextQuestion}
                            />
                        )}
                        {view === 'loading' && <LoadingView key="loading" result={calculatedResult} />}
                    </AnimatePresence>
                </MotionConfig>
            </PaperSection>
        </Layout>
    );
}
