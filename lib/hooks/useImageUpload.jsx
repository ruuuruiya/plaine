import { useState, useEffect, useRef } from "react";

export const useImageUpload = (maxSizeMB = 4) => {

    const fileInputRef = useRef(null);

    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [errorImage, setErrorImage] = useState("");
    const [active, setActive] = useState(false);

    const handleFile = (file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setErrorImage("format png/jpg/jpeg");
            return;
        } else if (file.size / 1024 / 1024 > maxSizeMB) {
            setErrorImage(`max ${maxSizeMB} mb`);
            return;
        } else {
            setErrorImage("");
            setImage(file);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        };
    };

    const handleFileSelect = (e) => {
        handleFile(e.target.files[0])
        e.target.value = '';
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewUrl("");
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setActive(false);
        handleFile(e.dataTransfer.files[0]);
        e.target.value = '';
    };

    // Trigger File Input on Zone
    const handleZoneClick = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) };
    }, [previewUrl]);

    return {
        image,
        setImage,
        previewUrl,
        setPreviewUrl,
        errorImage,
        setErrorImage,
        active,
        fileInputRef,
        handleFileSelect,
        handleDrop,
        handleDragOver,
        handleZoneClick,
        handleRemoveImage,
        setActive,
    };
};
