/**
 * 作品集页（/sukima-ml）的展厅部件：八云紫讲解员、漫画对话框、木刻箭头。画风组件在 ../woodcut。
 */
export { default as SpeechBubble, type SpeechBubbleProps, type BubblePlace, type BubbleSide } from './SpeechBubble';
export { default as InkArrow, type InkArrowProps } from './InkArrow';
export { default as YukariStand, type YukariStandProps } from './YukariStand';
export { YUKARI_BOX, YUKARI_IMAGE, anchorFrom, fallbackAnchor, placeBubble, type YukariAnchor, type YukariHitMap } from './yukari';
export { balloonPaths, balloonPts, superPt, tailHalf, BALLOON_N, type BalloonPaths } from './balloon';
