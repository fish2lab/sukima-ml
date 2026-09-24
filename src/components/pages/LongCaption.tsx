import React, { type ReactNode } from 'react';
import { Caption, type CaptionProps } from '../woodcut';

/**
 * 能换行的 Caption。woodcut 的 Caption 只给 12 字以内的短标签，强制不换行；
 * 图注（如「Epson SureColor P9580 旗舰级大幅面打印机」、英文图注）在手机上会超出屏幕，这里放开换行、限制在父元素宽度内。
 */
export default function LongCaption({ style, ...rest }: CaptionProps): ReactNode {
  return <Caption {...rest} style={{ whiteSpace: 'normal', maxWidth: '100%', textAlign: 'left', ...style }} />;
}
