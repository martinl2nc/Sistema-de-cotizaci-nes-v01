import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type IconifyIconElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  icon?: string;
  inline?: boolean | string;
  width?: string | number;
  height?: string | number;
  class?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': IconifyIconElement;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'iconify-icon': IconifyIconElement;
      }
    }
  }
}
