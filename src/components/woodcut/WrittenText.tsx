import React, { Fragment, memo, useMemo, type CSSProperties, type ReactNode } from 'react';
import clsx from 'clsx';
import { layoutWriting } from './text';
import styles from './WrittenText.module.css';

export interface WrittenTextProps {
  text: string;
  seed?: number;
  /** 字的倾斜和上下错位强度，1 = 默认，0 = 端正 */
  wobble?: number;
  className?: string;
}

/**
 * 逐字写出的一段手写字（aria-hidden，读屏文字由外层提供）。
 * 写出的时机由最近的 data-wc-reveal 祖先控制：pending 藏、play 按 --wc-per / --wc-delay 逐字擦出、done / static 正常显示。
 * 片子 zh() 的 write 模式：每个字在自己的时间片里从左往右擦出来。
 */
function WrittenText({ text, seed = 3, wobble = 1, className }: WrittenTextProps): ReactNode {
  const { lines } = useMemo(() => layoutWriting(text, seed, wobble), [text, seed, wobble]);
  return (
    <span className={clsx(styles.text, className)} aria-hidden="true">
      {lines.map((groups, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {groups.map((g, gi) =>
            g.kind === 'space' ? (
              <Fragment key={gi}>{g.text}</Fragment>
            ) : (
              <span key={gi} className={styles.word}>
                {g.glyphs.map((gl) => (
                  <span key={gl.i} className={styles.ch} style={{ '--i': gl.i, '--r': gl.r, '--y': gl.y } as CSSProperties}>
                    {gl.ch}
                  </span>
                ))}
              </span>
            ),
          )}
        </Fragment>
      ))}
    </span>
  );
}

export default memo(WrittenText);
