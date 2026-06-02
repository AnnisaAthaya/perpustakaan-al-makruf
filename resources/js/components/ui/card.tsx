import * as React from 'react';

import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card"
            className={cn('bg-card text-card-foreground flex flex-col rounded-md border border-border shadow-soft', className)}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                '@container/card-header flex flex-col gap-2 p-5',
                className
            )}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="card-title" className={cn('font-serif text-lg leading-none font-semibold', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="card-description" className={cn('text-muted-foreground text-sm leading-relaxed', className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="card-action" className={cn('self-start justify-self-end', className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="card-content" className={cn('p-5 pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="card-footer" className={cn('flex items-center p-5 pt-4 border-t border-border mt-auto', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
