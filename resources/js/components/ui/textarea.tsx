import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'border-input bg-secondary/30 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex field-sizing-content min-h-24 w-full rounded-xl border px-4 py-3 text-base shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-primary focus-visible:bg-card focus-visible:ring-primary/20 focus-visible:ring-2',
                'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
                className
            )}
            {...props}
        />
    );
}

export { Textarea };
