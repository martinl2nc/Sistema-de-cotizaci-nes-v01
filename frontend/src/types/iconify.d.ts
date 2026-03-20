import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon?: string;
        inline?: boolean | string;
        width?: string | number;
        height?: string | number;
        class?: string;
      };
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          icon?: string;
          inline?: boolean | string;
          width?: string | number;
          height?: string | number;
          class?: string;
        };
      }
    }
  }
}
