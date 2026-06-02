import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow-sm hover:bg-accent',
                destructive:
                    'bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/50',
                outline:
                    'border border-border bg-background shadow-sm hover:bg-secondary hover:text-secondary-foreground hover:border-primary/50',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
                ghost: 'hover:bg-secondary hover:text-secondary-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-10 px-5 py-2.5',
                sm: 'h-9 rounded-md gap-1.5 px-4',
                xs: 'h-7 rounded-md gap-1 px-2 text-xs font-medium',
                lg: 'h-12 rounded-xl px-8 text-base',
                icon: 'size-10',
                'icon-sm': 'size-9',
                'icon-lg': 'size-12',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
