"use client"

import React, { useContext, useEffect, useState } from 'react'
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { updateMedicine } from '@/app/actions/medicineActions';
import { NotifContext } from '@/components/NotifWrapper';
import { ModalContext } from '@/components/ModalWrapper';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';
import MedicineForm from './MedicineForm';
import { PageTitle } from '@/components/Utils';
import { FREQUENCY_OPTIONS } from '@/lib/globals';

const EditMedicinePage = ({ initialMedicine }) => {

    const router = useRouter();

    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    const {
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
    } = useImageUpload();

    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState(FREQUENCY_OPTIONS[0]);
    const [notes, setNotes] = useState('');
    const [indications, setIndications] = useState([]);
    const [contraindications, setContraindications] = useState([]);
    const [sideEffects, setSideEffects] = useState([]);

    useEffect(() => {
        setName(initialMedicine.name);
        setFrequency(initialMedicine.frequency);
        setNotes(initialMedicine.notes);
        setIndications(initialMedicine.indications);
        setContraindications(initialMedicine.contraindications);
        setSideEffects(initialMedicine.side_effects);
        setPreviewUrl(initialMedicine.image);
        setImage(initialMedicine.image);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setConfirmationLoading(true);

            const formData = new FormData();
            formData.append("data", JSON.stringify({
                med_id: initialMedicine.med_id,
                name,
                frequency,
                notes,
                indications,
                contraindications,
                side_effects: sideEffects,
            }));

            if (image?.type?.includes("image")) {
                const compressedImg = await imageCompression(image, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1080,
                    useWebWorker: true
                });
                formData.append("image", compressedImg);
            } else {
                formData.append("image", image);
            };

            const res = await updateMedicine(formData);
            if (res?.success) {
                router.replace('/medicines');
                setConfirmationLoading(false);
                setShowModal({ active: false });
                setNotif({ active: true, message: "Medicine Updated", status: 1 });
            }else {
                throw new Error(res.message);
            };
        } catch (err) {
            setConfirmationLoading(false)
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    return (
        <div className='p-5 flex flex-col gap-5'>
            <PageTitle title={"Edit Medicine"} back='/medicines' />
            <MedicineForm
                image={image}
                setImage={setImage}
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
                errorImage={errorImage}
                setErrorImage={setErrorImage}
                active={active}
                fileInputRef={fileInputRef}
                handleFileSelect={handleFileSelect}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
                handleZoneClick={handleZoneClick}
                handleRemoveImage={handleRemoveImage}
                setActive={setActive}

                name={name} setName={setName}
                frequency={frequency} setFrequency={setFrequency}
                notes={notes} setNotes={setNotes}
                indications={indications} setIndications={setIndications}
                contraindications={contraindications} setContraindications={setContraindications}
                sideEffects={sideEffects} setSideEffects={setSideEffects}
                handleSubmit={handleSubmit}
            />
        </div>
    )
}

export default EditMedicinePage
