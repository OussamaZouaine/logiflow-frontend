import { cva, type VariantProps } from 'class-variance-authority';

export const tableVariants = cva(
  'w-full min-w-xl caption-bottom text-left text-sm [&_thead_tr]:border-b [&_thead_tr]:border-line [&_tbody]:border-0 [&_tbody_tr:last-child]:border-0 [&_tbody_tr]:border-b [&_tbody_tr]:border-line [&_tbody_tr]:transition-[background-color] [&_tbody_tr]:duration-150 [&_tbody_tr]:ease-out [&_tbody_tr]:hover:bg-canvas [&_tbody_tr]:data-[state=selected]:bg-pine/5 [&_th]:align-middle [&_th]:font-medium [&_th]:text-muted [&_th]:text-xs [&_th:has([role=checkbox])]:pr-0 [&_th>[role=checkbox]]:translate-y-0.5 [&_td]:align-middle [&_td:has([role=checkbox])]:pr-0 [&_td>[role=checkbox]]:translate-y-0.5 [&_caption]:mt-4 [&_caption]:text-sm [&_caption]:text-muted-foreground',
  {
    variants: {
      zType: {
        default: '',
        striped: '[&_tbody_tr:nth-child(odd)]:bg-canvas/60',
        bordered: 'border border-line',
      },
      zSize: {
        default: '[&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3',
        compact: '[&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2',
        comfortable: '[&_td]:px-4 [&_td]:py-4 [&_th]:px-4 [&_th]:py-4',
      },
    },
    defaultVariants: {
      zType: 'default',
      zSize: 'default',
    },
  },
);

export const tableHeaderVariants = cva('[&_tr]:border-b [&_tr]:border-line', {
  variants: {},
  defaultVariants: {},
});

export const tableBodyVariants = cva('[&_tr:last-child]:border-0', {
  variants: {},
  defaultVariants: {},
});

export const tableRowVariants = cva(
  'border-b border-line transition-[background-color] duration-150 ease-out hover:bg-canvas has-aria-expanded:bg-canvas data-[state=selected]:bg-pine/5',
  {
    variants: {},
    defaultVariants: {},
  },
);

export const tableHeadVariants = cva(
  'px-4 py-3 text-left align-middle text-xs font-medium text-muted has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
  {
    variants: {},
    defaultVariants: {},
  },
);

export const tableCellVariants = cva(
  'px-4 py-3 align-middle has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
  {
    variants: {},
    defaultVariants: {},
  },
);

export const tableCaptionVariants = cva('mt-4 text-sm text-muted-foreground', {
  variants: {},
  defaultVariants: {},
});

export const tableFooterVariants = cva('border-t border-line bg-canvas/50 font-medium [&>tr]:last:border-b-0');

export type ZardTableSizeVariants = NonNullable<VariantProps<typeof tableVariants>['zSize']>;
export type ZardTableTypeVariants = NonNullable<VariantProps<typeof tableVariants>['zType']>;
