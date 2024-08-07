
"use client"

import { PageTitle } from "@/components/Utils";
import { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { ModalContext } from "@/components/ModalWrapper";
import { deleteCard, postCard, updateCard, updatePosition } from "@/app/actions/planActions";
import { NotifContext } from "@/components/NotifWrapper";
import { PLAN_COLUMN, PLAN_STATUS } from "@/lib/globals";
import { useDebouncedCallback } from "use-debounce";

const Board = ({ initialCards }) => {

    const { setShowModal } = useContext(ModalContext);
    const [cards, setCards] = useState(initialCards || []);

    // Delay Update Position
    const updateCardPosition = useDebouncedCallback(async (cards) => {
        await updatePosition({ cards });
    }, 200);

    // Update Position
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        } else {
            updateCardPosition(cards);
        };
    }, [cards]);

    return (
        <>
            <PageTitle title={"Planning"} description={"Manage your health plans"}>
                <button
                    onClick={() => setShowModal({ active: true, title: "New Plan", content: <CreatePlanModal setCards={setCards} />, backdrop: true })}
                    className="border border-neutral-800 font-medium py-2 px-4 pr-5 hover:bg-neutral-100 active:scale-95 rounded-md duration-300 flex gap-2 items-center justify-center"
                >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <span className='text-neutral-800 text-sm leading-tight'>New</span>
                </button>
            </PageTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <Column title={PLAN_COLUMN[0]} column={"0"} cards={cards} setCards={setCards} />
                <Column title={PLAN_COLUMN[1]} column={"1"} cards={cards} setCards={setCards} />
                <Column title={PLAN_COLUMN[2]} column={"2"} cards={cards} setCards={setCards} />
            </div>
        </>
    )
};

export default Board;

const Column = ({ title, column, cards, setCards }) => {

    // Active = Hightlight Column
    const [active, setActive] = useState(false);

    const handleDragStart = (e, card) => {
        e.dataTransfer.setData("cardId", card.plan_id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        highlightIndicator(e);
        setActive(true);
    };

    const handleDragLeave = () => {
        clearHighlights();
        setActive(false);
    };

    const handleDragEnd = (e) => {
        const cardId = e.dataTransfer.getData("cardId");

        setActive(false);
        clearHighlights();

        const indicators = getIndicators(); // Array of <div> that data-column = columnNum ["0" or "1" or "2"]
        const { element } = getNearestIndicator(e, indicators); // Nearest <div>
        const before = element.dataset.before || "-1"; // ID Object [last Element ID = -1]

        // If Card Placed not in the same position, Then rearrange the array
        if (before !== cardId) {
            let copy = [...cards];

            // Find the Card Moved and Set the property column to the target
            let cardToTransfer = copy.find((c) => c.plan_id === cardId);
            if (!cardToTransfer) return;
            cardToTransfer = { ...cardToTransfer, column };

            // Extract From the Array of Cards
            copy = copy.filter((c) => c.plan_id !== cardId);

            // Check if the moved card is put on the back or in the middle
            const moveToBack = before === "-1";

            if (moveToBack) {
                copy.push(cardToTransfer);
            } else {
                const insertAtIndex = copy.findIndex((el) => el.plan_id === before);
                if (insertAtIndex === undefined) return;
                copy.splice(insertAtIndex, 0, cardToTransfer);
            };

            setCards(copy);
        };
    };

    const clearHighlights = (els) => {
        const indicators = els || getIndicators();

        indicators.forEach((i) => {
            i.style.opacity = "0";
        });
    };

    const highlightIndicator = (e) => {
        const indicators = getIndicators();
        clearHighlights(indicators);
        const el = getNearestIndicator(e, indicators);
        el.element.style.opacity = "1";
    };

    const getNearestIndicator = (e, indicators) => {
        const DISTANCE_OFFSET = 50;

        const el = indicators.reduce((closest, child) => {
            const box = child.getBoundingClientRect();

            const offset = e.clientY - (box.top + DISTANCE_OFFSET);

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            };
        }, {
            offset: Number.NEGATIVE_INFINITY,
            element: indicators[indicators.length - 1],
        });

        return el;
    };

    const getIndicators = () => {
        return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
    };

    // Separate Card for Each Column
    const filteredCards = cards.filter((c) => c.column === column);

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <h3 className={`font-medium`}>{title}</h3>
                <span className=" text-sm text-neutral-500">{filteredCards.length}</span>
            </div>

            <div
                onDrop={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`h-full w-full transition-colors ${ active ? "bg-neutral-800/50" : "bg-neutral-800/0" }`}
            >
                { filteredCards.map((card) => (
                    <Card key={card.plan_id} card={card} setCards={setCards} handleDragStart={handleDragStart} />
                ))}

                <DropIndicator beforeId={null} column={column} />
            </div>
        </div>
    )
};

const Card = ({ card, setCards, handleDragStart }) => {

    const { setShowModal } = useContext(ModalContext);

    return (
        <>
            <DropIndicator beforeId={card?.plan_id} column={card?.column} />
            <motion.div
                layout
                layoutId={card?.plan_id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, card)}
                className="cursor-grab rounded border border-gray-400 bg-white p-2 active:cursor-grabbing "
            >
                <div className="flex flex-col gap-2">
                    <div className={`px-1 w-fit rounded-sm text-[10px] leading-none font-semibold text-white ${PLAN_STATUS[card?.status].color}`}>
                        <span className="text-center leading-4">{PLAN_STATUS[card?.status].name}</span>
                    </div>

                    <h4 className="font-medium line-clamp-2 text-sm">{card?.title}</h4>

                    { card?.deadline &&
                        <div className="flex items-center gap-1 h-3 mt-1">
                            <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.50009 0.877014C3.84241 0.877014 0.877258 3.84216 0.877258 7.49984C0.877258 11.1575 3.8424 14.1227 7.50009 14.1227C11.1578 14.1227 14.1229 11.1575 14.1229 7.49984C14.1229 3.84216 11.1577 0.877014 7.50009 0.877014ZM1.82726 7.49984C1.82726 4.36683 4.36708 1.82701 7.50009 1.82701C10.6331 1.82701 13.1729 4.36683 13.1729 7.49984C13.1729 10.6328 10.6331 13.1727 7.50009 13.1727C4.36708 13.1727 1.82726 10.6328 1.82726 7.49984ZM8 4.50001C8 4.22387 7.77614 4.00001 7.5 4.00001C7.22386 4.00001 7 4.22387 7 4.50001V7.50001C7 7.63262 7.05268 7.7598 7.14645 7.85357L9.14645 9.85357C9.34171 10.0488 9.65829 10.0488 9.85355 9.85357C10.0488 9.65831 10.0488 9.34172 9.85355 9.14646L8 7.29291V4.50001Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            <span className='text-[10px] leading-3'>{formatDate(card?.deadline, 'Mon DD, YYYY')}</span>
                        </div>
                    }

                    <span
                        onClick={() => setShowModal({ active: true, title: "Plan Details", content: <PlanDetails card={card} setCards={setCards} />, backdrop: true })}
                        className='text-blue-700 cursor-pointer hover:text-blue-950 text-[10px]'
                    >
                        See more...
                    </span>
                </div>
            </motion.div>

        </>
    );
};

const DropIndicator = ({ beforeId, column }) => {
    return (
        <div
            data-before={beforeId || "-1"}
            data-column={column}
            className="my-0.5 h-1 w-full bg-black opacity-0"
        />
    );
};

const PlanDetails = ({ card, setCards }) => {

    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    const handleDelete = async () => {
        try {
            const plan_id = card?.plan_id;
            if (!plan_id) throw new Error("Plan Undefined");
            setConfirmationLoading(true);
            const res = await deleteCard(plan_id);
            if (res?.success) {
                setConfirmationLoading(false);
                setCards((cards) => cards.filter(item => item.plan_id !== plan_id));
                setNotif({ active: true, message: "Plan Deleted!", status: 1 });
                setShowModal({ active: false });
            } else {
                throw new Error(res?.message);
            };
        } catch (err) {
            setConfirmationLoading(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    return (
        <div className="flex flex-col gap-2">

            <div className={`px-1 w-fit rounded-sm text-[10px] leading-none font-semibold text-white ${PLAN_STATUS[card?.status].color}`}>
                <span className="text-center leading-4">{PLAN_STATUS[card?.status].name}</span>
            </div>

            <h4 className="font-medium text-lg">{card?.title}</h4>

            <p className="text-start text-neutral-500 text-sm">{card?.description}</p>

            <div className="flex flex-col gap-4 mt-4">
                { card?.deadline &&
                    <div className="flex items-center gap-1 h-3 mt-1">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.50009 0.877014C3.84241 0.877014 0.877258 3.84216 0.877258 7.49984C0.877258 11.1575 3.8424 14.1227 7.50009 14.1227C11.1578 14.1227 14.1229 11.1575 14.1229 7.49984C14.1229 3.84216 11.1577 0.877014 7.50009 0.877014ZM1.82726 7.49984C1.82726 4.36683 4.36708 1.82701 7.50009 1.82701C10.6331 1.82701 13.1729 4.36683 13.1729 7.49984C13.1729 10.6328 10.6331 13.1727 7.50009 13.1727C4.36708 13.1727 1.82726 10.6328 1.82726 7.49984ZM8 4.50001C8 4.22387 7.77614 4.00001 7.5 4.00001C7.22386 4.00001 7 4.22387 7 4.50001V7.50001C7 7.63262 7.05268 7.7598 7.14645 7.85357L9.14645 9.85357C9.34171 10.0488 9.65829 10.0488 9.85355 9.85357C10.0488 9.65831 10.0488 9.34172 9.85355 9.14646L8 7.29291V4.50001Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        <span className='text-sm leading-3'>Deadline: {formatDate(card?.deadline, 'Mon DD, YYYY')}</span>
                    </div>
                }

                <div className="flex items-center gap-1 h-3 mt-1">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM10 3V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V3H12.5C12.7761 3 13 3.22386 13 3.5V5H2V3.5C2 3.22386 2.22386 3 2.5 3H4V3.5C4 3.77614 4.22386 4 4.5 4C4.77614 4 5 3.77614 5 3.5V3H10ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2ZM7 7.5C7 7.22386 7.22386 7 7.5 7C7.77614 7 8 7.22386 8 7.5C8 7.77614 7.77614 8 7.5 8C7.22386 8 7 7.77614 7 7.5ZM9.5 7C9.22386 7 9 7.22386 9 7.5C9 7.77614 9.22386 8 9.5 8C9.77614 8 10 7.77614 10 7.5C10 7.22386 9.77614 7 9.5 7ZM11 7.5C11 7.22386 11.2239 7 11.5 7C11.7761 7 12 7.22386 12 7.5C12 7.77614 11.7761 8 11.5 8C11.2239 8 11 7.77614 11 7.5ZM11.5 9C11.2239 9 11 9.22386 11 9.5C11 9.77614 11.2239 10 11.5 10C11.7761 10 12 9.77614 12 9.5C12 9.22386 11.7761 9 11.5 9ZM9 9.5C9 9.22386 9.22386 9 9.5 9C9.77614 9 10 9.22386 10 9.5C10 9.77614 9.77614 10 9.5 10C9.22386 10 9 9.77614 9 9.5ZM7.5 9C7.22386 9 7 9.22386 7 9.5C7 9.77614 7.22386 10 7.5 10C7.77614 10 8 9.77614 8 9.5C8 9.22386 7.77614 9 7.5 9ZM5 9.5C5 9.22386 5.22386 9 5.5 9C5.77614 9 6 9.22386 6 9.5C6 9.77614 5.77614 10 5.5 10C5.22386 10 5 9.77614 5 9.5ZM3.5 9C3.22386 9 3 9.22386 3 9.5C3 9.77614 3.22386 10 3.5 10C3.77614 10 4 9.77614 4 9.5C4 9.22386 3.77614 9 3.5 9ZM3 11.5C3 11.2239 3.22386 11 3.5 11C3.77614 11 4 11.2239 4 11.5C4 11.7761 3.77614 12 3.5 12C3.22386 12 3 11.7761 3 11.5ZM5.5 11C5.22386 11 5 11.2239 5 11.5C5 11.7761 5.22386 12 5.5 12C5.77614 12 6 11.7761 6 11.5C6 11.2239 5.77614 11 5.5 11ZM7 11.5C7 11.2239 7.22386 11 7.5 11C7.77614 11 8 11.2239 8 11.5C8 11.7761 7.77614 12 7.5 12C7.22386 12 7 11.7761 7 11.5ZM9.5 11C9.22386 11 9 11.2239 9 11.5C9 11.7761 9.22386 12 9.5 12C9.77614 12 10 11.7761 10 11.5C10 11.2239 9.77614 11 9.5 11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <span className='text-sm leading-3'>Created: {formatDate(card?.created_at, 'Mon DD, YYYY')}</span>
                </div>

                <div className="flex items-center gap-1 h-3 mt-1">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85357 3.85355L7.65355 3.05353C8.2981 2.40901 9.42858 1.96172 10.552 1.80125C11.1056 1.72217 11.6291 1.71725 12.0564 1.78124C12.4987 1.84748 12.7698 1.97696 12.8965 2.10357C13.0231 2.23018 13.1526 2.50125 13.2188 2.94357C13.2828 3.37086 13.2779 3.89439 13.1988 4.44801C13.0383 5.57139 12.591 6.70188 11.9464 7.34645L7.49999 11.7929L6.35354 10.6465C6.15827 10.4512 5.84169 10.4512 5.64643 10.6465C5.45117 10.8417 5.45117 11.1583 5.64643 11.3536L7.14644 12.8536C7.34171 13.0488 7.65829 13.0488 7.85355 12.8536L8.40073 12.3064L9.57124 14.2572C9.65046 14.3893 9.78608 14.4774 9.9389 14.4963C10.0917 14.5151 10.2447 14.4624 10.3535 14.3536L12.3535 12.3536C12.4648 12.2423 12.5172 12.0851 12.495 11.9293L12.0303 8.67679L12.6536 8.05355C13.509 7.19808 14.0117 5.82855 14.1887 4.58943C14.2784 3.9618 14.2891 3.33847 14.2078 2.79546C14.1287 2.26748 13.9519 1.74482 13.6035 1.39645C13.2552 1.04809 12.7325 0.871332 12.2045 0.792264C11.6615 0.710945 11.0382 0.721644 10.4105 0.8113C9.17143 0.988306 7.80189 1.491 6.94644 2.34642L6.32322 2.96968L3.07071 2.50504C2.91492 2.48278 2.75773 2.53517 2.64645 2.64646L0.646451 4.64645C0.537579 4.75533 0.484938 4.90829 0.50375 5.0611C0.522563 5.21391 0.61073 5.34954 0.742757 5.42876L2.69364 6.59928L2.14646 7.14645C2.0527 7.24022 2.00002 7.3674 2.00002 7.50001C2.00002 7.63261 2.0527 7.75979 2.14646 7.85356L3.64647 9.35356C3.84173 9.54883 4.15831 9.54883 4.35357 9.35356C4.54884 9.1583 4.54884 8.84172 4.35357 8.64646L3.20712 7.50001L3.85357 6.85356L6.85357 3.85355ZM10.0993 13.1936L9.12959 11.5775L11.1464 9.56067L11.4697 11.8232L10.0993 13.1936ZM3.42251 5.87041L5.43935 3.85356L3.17678 3.53034L1.80638 4.90074L3.42251 5.87041ZM2.35356 10.3535C2.54882 10.1583 2.54882 9.8417 2.35356 9.64644C2.1583 9.45118 1.84171 9.45118 1.64645 9.64644L0.646451 10.6464C0.451188 10.8417 0.451188 11.1583 0.646451 11.3535C0.841713 11.5488 1.1583 11.5488 1.35356 11.3535L2.35356 10.3535ZM3.85358 11.8536C4.04884 11.6583 4.04885 11.3417 3.85359 11.1465C3.65833 10.9512 3.34175 10.9512 3.14648 11.1465L1.14645 13.1464C0.95119 13.3417 0.951187 13.6583 1.14645 13.8535C1.34171 14.0488 1.65829 14.0488 1.85355 13.8536L3.85358 11.8536ZM5.35356 13.3535C5.54882 13.1583 5.54882 12.8417 5.35356 12.6464C5.1583 12.4512 4.84171 12.4512 4.64645 12.6464L3.64645 13.6464C3.45119 13.8417 3.45119 14.1583 3.64645 14.3535C3.84171 14.5488 4.1583 14.5488 4.35356 14.3535L5.35356 13.3535ZM9.49997 6.74881C10.1897 6.74881 10.7488 6.1897 10.7488 5.5C10.7488 4.8103 10.1897 4.25118 9.49997 4.25118C8.81026 4.25118 8.25115 4.8103 8.25115 5.5C8.25115 6.1897 8.81026 6.74881 9.49997 6.74881Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <span className='text-sm leading-3'><span className="font-semibold">Progress</span> {PLAN_COLUMN[card?.column]}</span>
                </div>
            </div>

            <div className="flex gap-2 mt-7">
                <button onClick={() => setShowModal({ active: true, title: "Delete Plan", handleSubmit: handleDelete, btnCancel: "Cancel", btnSubmit: "Delete", content: <p>Are you sure you would like to delete this plan?</p>, backdrop: true })} data-tip="Delete" className="tooltip tooltip-top w-fit text-red-500 border border-red-500 px-5 p-4 rounded-lg active:scale-95 hover:bg-red-500/20 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </button>
                <button onClick={() => setShowModal({ active: true, title: "Edit Plan", content: <UpdatePlanModal card={card} setCards={setCards} />, backdrop: true })} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L8.12731 8.12732L10.2038 7.08907L13.7929 3.5L12.5 2.20711ZM9.99998 2L8.99998 3H4.9C4.47171 3 4.18056 3.00039 3.95552 3.01877C3.73631 3.03668 3.62421 3.06915 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3.06915 3.62421 3.03669 3.73631 3.01878 3.95552C3.00039 4.18056 3 4.47171 3 4.9V11.1C3 11.5283 3.00039 11.8194 3.01878 12.0445C3.03669 12.2637 3.06915 12.3758 3.10899 12.454C3.20487 12.6422 3.35785 12.7951 3.54601 12.891C3.62421 12.9309 3.73631 12.9633 3.95552 12.9812C4.18056 12.9996 4.47171 13 4.9 13H11.1C11.5283 13 11.8194 12.9996 12.0445 12.9812C12.2637 12.9633 12.3758 12.9309 12.454 12.891C12.6422 12.7951 12.7951 12.6422 12.891 12.454C12.9309 12.3758 12.9633 12.2637 12.9812 12.0445C12.9996 11.8194 13 11.5283 13 11.1V6.99998L14 5.99998V11.1V11.1207C14 11.5231 14 11.8553 13.9779 12.1259C13.9549 12.407 13.9057 12.6653 13.782 12.908C13.5903 13.2843 13.2843 13.5903 12.908 13.782C12.6653 13.9057 12.407 13.9549 12.1259 13.9779C11.8553 14 11.5231 14 11.1207 14H11.1H4.9H4.87934C4.47686 14 4.14468 14 3.87409 13.9779C3.59304 13.9549 3.33469 13.9057 3.09202 13.782C2.7157 13.5903 2.40973 13.2843 2.21799 12.908C2.09434 12.6653 2.04506 12.407 2.0221 12.1259C1.99999 11.8553 1.99999 11.5231 2 11.1207V11.1206V11.1V4.9V4.87935V4.87932V4.87931C1.99999 4.47685 1.99999 4.14468 2.0221 3.87409C2.04506 3.59304 2.09434 3.33469 2.21799 3.09202C2.40973 2.71569 2.7157 2.40973 3.09202 2.21799C3.33469 2.09434 3.59304 2.04506 3.87409 2.0221C4.14468 1.99999 4.47685 1.99999 4.87932 2H4.87935H4.9H9.99998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <span className='text-sm leading-3'>Edit</span>
                </button>
            </div>

        </div>
    )
};

const UpdatePlanModal = ({ card, setCards }) => {

    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    // Form
    const [title, setTitle] = useState(card?.title || "");
    const [description, setDescription] = useState(card?.description || "");
    const [deadline, setDeadline] = useState(card?.deadline || "");
    const [status, setStatus] = useState(card?.status || "1");
    const [column, setColumn] = useState(card?.column || "0");

    // Error
    const [errorTitle, setErrorTitle] = useState("");

    // Trigger Scroll
    const hooked = useRef(null);

    // Keep Prev Value
    const prevCard = useRef({
        title: card?.title || "",
        description: card?.description || "",
        deadline: card?.deadline || "",
        status: card?.status || "1",
        column: card?.column || "0"
    });

    // Submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (title?.trim().length < 1 || title?.length > 150) {
            setErrorTitle("plan summary is required");
            hooked.current.scrollIntoView({ behavior: 'smooth' });
            return;
        };

        // Construct
        const plan_id = card?.plan_id;
        const newCard = {
            title,
            description,
            deadline,
            status,
            column,
        };
        const oldCard = { ...prevCard.current };

        // Check if No Update
        if (JSON.stringify(newCard) === JSON.stringify(oldCard)) {
            setShowModal({ active: false });
            return;
        };

        // Update
        newCard.plan_id = plan_id;
        newCard.isColumnUpdated = oldCard.column !== newCard.column;

        try {
            setConfirmationLoading(true);
            const res = await updateCard(newCard);
            if (res?.success) {

                // Check if column is changed
                if (newCard.isColumnUpdated) {
                    setCards((cards) => {

                        // Make a Copy
                        let updatedArray = [...cards];

                        // Find Index based on plan_id
                        const index = updatedArray.findIndex(item => item.plan_id === plan_id);

                        // If Index is Found
                        if (index !== -1) {

                            // Extract out that object and return deleted object
                            const objToMove = updatedArray.splice(index, 1)[0];

                            // Change some property to updated one [Note. some property like created_at and plan_id keep the same]
                            objToMove.title = newCard.title;
                            objToMove.description = newCard.description,
                            objToMove.deadline = newCard.deadline,
                            objToMove.status = newCard.status,
                            objToMove.column = newCard.column,

                            // Push the Object
                            updatedArray.push(objToMove);
                        };

                        // Set Cards to This New Array
                        return updatedArray;
                    });
                } else {
                    setCards((cards) => {

                        // Update the specific object in an array that has specific plan_id
                        const updatedArray = cards.map(item => {
                            if (item.plan_id === plan_id) {
                                return {
                                    ...item,
                                    title: newCard.title,
                                    description: newCard.description,
                                    deadline: newCard.deadline,
                                    status: newCard.status,
                                    column: newCard.column,
                                };
                            }
                            return item;
                        });

                        // Set Cards to This New Array
                        return updatedArray;
                    })
                };

                setConfirmationLoading(false);
                setNotif({ active: true, message: "Plan Updated!", status: 1 });
                setShowModal({ active: false });
            } else {
                throw new Error(res?.message);
            };
        } catch (err) {
            setConfirmationLoading(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };

    };

    return (
        <div className="flex flex-col gap-5">

            {/* Status */}
            <div className="flex flex-col gap-2" ref={hooked}>
                <label htmlFor="status" className="font-medium text-black">
                    Urgency Status
                </label>

                <select
                    id='status'
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`select w-full shrink rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                >
                    { Object.keys(PLAN_STATUS).map(key => (
                        <option key={key} value={key}>{PLAN_STATUS[key].name}</option>
                    ))}
                </select>

                <div className={`flex items-center`}>
                    <div className="text-transparent text-sm">X</div>
                </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
                <label htmlFor="title" className="font-medium text-black">
                    Plan Summary<span className='text-red-500'>*</span>
                </label>

                <input
                    className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black ${errorTitle && "border-red-500"}`}
                    type="text"
                    id="title"
                    placeholder="Write your plan"
                    value={title}
                    onChange={(e) => {
                        const inputText = e.target.value;
                        if (inputText.length <= 150) {
                            setErrorTitle("");
                            setTitle(inputText);
                        };
                    }}
                />

                <div className={`flex items-center ${errorTitle ? "justify-between" : "justify-end"}`}>
                    {errorTitle && <p className="text-red-500 text-xs w-full">{errorTitle}</p>}
                    <div className="text-neutral-500 text-xs">{title.length}/150</div>
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
                <label htmlFor="description" className="font-medium text-black">
                    Description
                </label>

                <textarea
                    className={` w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                    rows={4}
                    id="description"
                    placeholder="Detailed breakdown of your plan"
                    value={description}
                    onChange={(e) => {
                        const inputText = e.target.value;
                        if (inputText.length <= 500) {
                            setDescription(inputText);
                        };
                    }}
                />

                <div className={`flex items-center justify-end`}>
                    <div className="text-neutral-500 text-xs">{description.length}/500</div>
                </div>
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-2">
                <label htmlFor="deadline" className="font-medium text-black">
                    Deadline
                </label>

                <input
                    className={`datepicker-input w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />

                <div className={`flex items-center`}>
                    <div className="text-transparent text-sm">X</div>
                </div>
            </div>

            {/* Column */}
            <div className="flex flex-col gap-2">
                <label htmlFor="column" className="font-medium text-black">
                    Progress
                </label>

                <select
                    id='column'
                    value={column}
                    onChange={(e) => setColumn(e.target.value)}
                    className={`select w-full shrink rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                >
                    { Object.keys(PLAN_COLUMN).map(key => (
                        <option key={key} value={key}>{PLAN_COLUMN[key]}</option>
                    ))}
                </select>

                <div className={`flex items-center`}>
                    <div className="text-transparent text-sm">X</div>
                </div>
            </div>

            {/* Button */}
            <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => setShowModal({ active: false })} className="w-fit text-red-500 border border-red-500 px-5 p-4 rounded-lg active:scale-95 hover:bg-red-500/20 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                    <span className='text-sm leading-3'>{"Cancel"}</span>
                </button>
                <button type="button" onClick={handleSubmit} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                    <span>{"Update"}</span>
                </button>
            </div>
        </div>
    )
};

const CreatePlanModal = ({ setCards }) => {

    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    // Form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [status, setStatus] = useState("1");
    const [column, setColumn] = useState("0");

    // Error
    const [errorTitle, setErrorTitle] = useState("");

    // Trigger Scroll
    const hooked = useRef(null);

    // Submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (title?.trim().length < 1 || title?.length > 150) {
            setErrorTitle("plan summary is required");
            hooked.current.scrollIntoView({ behavior: 'smooth' });
            return;
        };

        // Construct
        const newCard = {
            title,
            description,
            deadline,
            status,
            column,
        };

        try {
            setConfirmationLoading(true);
            const res = await postCard(newCard);
            if (res?.success) {
                setConfirmationLoading(false);
                newCard.plan_id = res?.data?.plan_id;
                newCard.created_at = new Date();
                setCards((cards) => [...cards, newCard]);
                setNotif({ active: true, message: "Plan Created!", status: 1 });
                setShowModal({ active: false });
            } else {
                throw new Error(res?.message);
            };
        } catch (err) {
            setConfirmationLoading(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };

    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Status */}
            <div className="flex flex-col gap-2" ref={hooked}>
                <label htmlFor="status" className="font-medium text-black">
                    Urgency Status
                </label>

                <select
                    id='status'
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`select w-full shrink rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                >
                    { Object.keys(PLAN_STATUS).map(key => (
                        <option key={key} value={key}>{PLAN_STATUS[key].name}</option>
                    ))}
                </select>

                <div className={`flex items-center`}>
                    <div className="text-transparent text-sm">X</div>
                </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
                <label htmlFor="title" className="font-medium text-black">
                    Plan Summary<span className='text-red-500'>*</span>
                </label>

                <input
                    className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black ${errorTitle && "border-red-500"}`}
                    type="text"
                    id="title"
                    placeholder="Write your plan"
                    value={title}
                    onChange={(e) => {
                        const inputText = e.target.value;
                        if (inputText.length <= 150) {
                            setErrorTitle("");
                            setTitle(inputText);
                        };
                    }}
                />

                <div className={`flex items-center ${errorTitle ? "justify-between" : "justify-end"}`}>
                    {errorTitle && <p className="text-red-500 text-xs w-full">{errorTitle}</p>}
                    <div className="text-neutral-500 text-xs">{title.length}/150</div>
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
                <label htmlFor="description" className="font-medium text-black">
                    Description
                </label>

                <textarea
                    className={` w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                    rows={4}
                    id="description"
                    placeholder="Detailed breakdown of your plan"
                    value={description}
                    onChange={(e) => {
                        const inputText = e.target.value;
                        if (inputText.length <= 500) {
                            setDescription(inputText);
                        };
                    }}
                />

                <div className={`flex items-center justify-end`}>
                    <div className="text-neutral-500 text-xs">{description.length}/500</div>
                </div>
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-2">
                <label htmlFor="deadline" className="font-medium text-black">
                    Deadline
                </label>

                <input
                    className={`datepicker-input w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />

                <div className={`flex items-center`}>
                    <div className="text-transparent text-sm">X</div>
                </div>
            </div>

            {/* Column */}
            <div className="flex flex-col gap-2">
                <label htmlFor="column" className="font-medium text-black">
                    Progress
                </label>

                <select
                    id='column'
                    value={column}
                    onChange={(e) => setColumn(e.target.value)}
                    className={`select w-full shrink rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                >
                    { Object.keys(PLAN_COLUMN).map(key => (
                        <option key={key} value={key}>{PLAN_COLUMN[key]}</option>
                    ))}
                </select>

                <div className={`flex items-center`}>
                    <div className="text-transparent text-sm">X</div>
                </div>
            </div>

            {/* Button */}
            <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => setShowModal({ active: false })} className="w-fit text-red-500 border border-red-500 px-5 p-4 rounded-lg active:scale-95 hover:bg-red-500/20 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                    <span className='text-sm leading-3'>{"Cancel"}</span>
                </button>
                <button type="submit" className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                    <span>{"Submit"}</span>
                </button>
            </div>

        </form>
    )
};
