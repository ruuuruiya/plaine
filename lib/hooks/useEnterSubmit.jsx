import { useRef } from "react";

export function useEnterSubmit() {
    const formRef = useRef(null);

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            formRef.current?.requestSubmit();
            e.preventDefault();
        }
    };

    return { formRef, onKeyDown };
};
