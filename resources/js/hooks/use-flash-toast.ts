import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { type SharedData } from '@/types';

export function useFlashToast() {
    const { flash, errors } = usePage<SharedData>().props;
    const shownMessages = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Handle success flash message
        if (flash?.success) {
            const successKey = `success:${flash.success}`;
            if (!shownMessages.current.has(successKey)) {
                toast.success(flash.success);
                shownMessages.current.add(successKey);
            }
        }

        // Handle error flash message
        if (flash?.error) {
            const errorKey = `error:${flash.error}`;
            if (!shownMessages.current.has(errorKey)) {
                toast.error(flash.error);
                shownMessages.current.add(errorKey);
            }
        }

        // check errors
        if (errors && Object.keys(errors).length > 0) {
            const errorKey = `validation_errors:${JSON.stringify(errors)}`;
            if (!shownMessages.current.has(errorKey)) {
                toast.error('Terdapat error pada input. Silakan periksa kembali.');
                shownMessages.current.add(errorKey);
            }
        }

        // Clean up shown messages when flash changes to prevent memory leak
        // Keep only current flash messages in the set
        const currentKeys = new Set<string>();
        if (flash?.success) currentKeys.add(`success:${flash.success}`);
        if (flash?.error) currentKeys.add(`error:${flash.error}`);
        if (errors && Object.keys(errors).length > 0) {
            currentKeys.add(`validation_errors:${JSON.stringify(errors)}`);
        }

        shownMessages.current = currentKeys;

        return () => {
            // Clear the shown messages when the component unmounts
            shownMessages.current.clear();
        };
    }, [flash?.success, flash?.error, errors]);
}
