/**
 * 木刻画风组件（东方部分）。用法见同目录 README.md。
 *
 *   import { InkFrame, SweepReveal, LabelCard } from '@site/src/components/woodcut';
 */
export { default as SukimaSlit, type SukimaSlitProps } from './SukimaSlit';
export { default as SweepReveal, type SweepRevealProps, type SweepImage } from './SweepReveal';
export { default as InkFrame, type InkFrameProps } from './InkFrame';
export { default as LabelCard, type LabelCardProps } from './LabelCard';
export { default as HandTitle, type HandTitleProps, type HandTitleTag } from './HandTitle';
export { default as Caption, type CaptionProps } from './Caption';
export { default as InkButton, type InkButtonProps, type InkButtonLinkProps, type InkButtonButtonProps } from './InkButton';
export { default as InkRule, type InkRuleProps } from './InkRule';
export { default as PaperSection, type PaperSectionProps, type Tone } from './PaperSection';
export { default as RoughBorder, type RoughBorderProps, type RoughSides } from './RoughBorder';
export { default as SukimaScope } from './SukimaScope';
export { isSukimaPath, useIsSukima, type ScopeOptions } from './scope';
export { useMotionAllowed, useJitterTick, useReveal, motionAllowedNow, type RevealState } from './hooks';
export { K, SWEEP_TIMING } from './draw';
