import { LuPill } from "react-icons/lu";

// Dashboard
export const HEALTH_STATUS = {
    "0": {
        name: "Curious",
        emoji: "⚪",
        icon: "/assets/icons/status_0.png",
        description: "The health status is unknown or not yet assessed. Further evaluation is needed."
    },
    "1": {
        name: "Optimal",
        emoji: "🟢",
        icon: "/assets/icons/status_1.png",
        description: "Your health is in excellent shape, with no concerns or issues. Keep up the good work!"
    },
    "2": {
        name: "Good",
        emoji: "🟡",
        icon: "/assets/icons/status_2.png",
        description: "Your health is stable and generally positive. There might be minor issues, but overall, you're doing well."
    },
    "3": {
        name: "Moderate",
        emoji: "🟠",
        icon: "/assets/icons/status_3.png",
        description: "Your health is showing some signs of concern. It's important to monitor and address any potential issues."
    },
    "4": {
        name: "Unwell",
        emoji: "🔴",
        icon: "/assets/icons/status_4.png",
        description: "Your health is noticeably poor. It's advisable to seek medical advice or take significant steps to improve your condition."
    },
    "5": {
        name: "Critical",
        emoji: "⚠️",
        icon: "/assets/icons/status_5.png",
        description: "Your health is in a serious state. Immediate action is required, and professional medical assistance should be sought without delay."
    },
};

// Plans
export const PLAN_STATUS = {
    "0": { name: 'LATER', color: 'bg-green-600'},
    "1": { name: 'NORMAL', color: 'bg-blue-600'},
    "2": { name: 'IMPORTANT', color: 'bg-violet-600'},
    "3": { name: 'URGENT', color: 'bg-red-600'},
};

export const PLAN_COLUMN = {
    "0": 'PLAN',
    "1": 'IN PROGRESS',
    "2": 'COMPLETE',
};

// Chats
export const CHAT_TYPE_OPTIONS = {
    "BASE": { icon: <svg className="text-neutral-400" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 3L2.5 3.00002C1.67157 3.00002 1 3.6716 1 4.50002V9.50003C1 10.3285 1.67157 11 2.5 11H7.50003C7.63264 11 7.75982 11.0527 7.85358 11.1465L10 13.2929V11.5C10 11.2239 10.2239 11 10.5 11H12.5C13.3284 11 14 10.3285 14 9.50003V4.5C14 3.67157 13.3284 3 12.5 3ZM2.49999 2.00002L12.5 2C13.8807 2 15 3.11929 15 4.5V9.50003C15 10.8807 13.8807 12 12.5 12H11V14.5C11 14.7022 10.8782 14.8845 10.6913 14.9619C10.5045 15.0393 10.2894 14.9965 10.1464 14.8536L7.29292 12H2.5C1.11929 12 0 10.8807 0 9.50003V4.50002C0 3.11931 1.11928 2.00003 2.49999 2.00002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg> },
    "MEDICINE": { icon: <LuPill className="text-neutral-400" /> },
};

// Records
export const FREQUENCY_OPTIONS = [
    "As needed",
    "1x/Day",
    "2x/Day",
    "3x/Day",
    "4x/Day",
    "1x/Week",
    "2x/Week",
    "3x/Week",
    "4x/Week",
];

export const EXERCISE_OPTIONS = [
    "Prefer Not to Say",
    "1x/week",
    "2x/week",
    "3x/week",
    "4x/week",
    "5x/week",
    "6x/week",
    "7x/week",
    "No Exercise",
];

export const DIETARY_OPTIONS = [
    "Prefer Not to Say",
    "No restrictions",
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Dairy-free",
    "Low-carb",
    "Low-fat",
    "Halal",
    "Raw food",
    "Others"
];

export const HABIT_OPTIONS = [
    "Prefer Not to Say",
    "Smoking",
    "Drinking",
    "Smoking & Drinking",
    "No Smoking & Drinking",
];

export const GENDER_OPTIONS = [
    "Prefer Not to Say",
    "Male",
    "Female",
    "Others",
]

export const WEIGHT_OPTIONS = [
    "Prefer Not to Say",
    "5 kg (11 lbs)",
    "10 kg (22 lbs)",
    "15 kg (33 lbs)",
    "20 kg (44 lbs)",
    "25 kg (55 lbs)",
    "30 kg (66 lbs)",
    "35 kg (77 lbs)",
    "40 kg (88 lbs)",
    "45 kg (99 lbs)",
    "50 kg (110 lbs)",
    "55 kg (121 lbs)",
    "60 kg (132 lbs)",
    "65 kg (143 lbs)",
    "70 kg (154 lbs)",
    "75 kg (165 lbs)",
    "80 kg (176 lbs)",
    "85 kg (187 lbs)",
    "90 kg (198 lbs)",
    "95 kg (209 lbs)",
    "100 kg (220 lbs)",
    "105 kg (231 lbs)",
    "110 kg (242 lbs)",
    "115 kg (253 lbs)",
    "120 kg (264 lbs)",
    "125 kg (275 lbs)",
    "130 kg (286 lbs)",
    "135 kg (297 lbs)",
    "140 kg (308 lbs)",
    "145 kg (319 lbs)",
    "150 kg (330 lbs)",
    "155 kg (341 lbs)",
    "160 kg (352 lbs)",
    "165 kg (363 lbs)",
    "170 kg (374 lbs)",
    "175 kg (385 lbs)",
    "180 kg (396 lbs)",
    "185 kg (407 lbs)",
    "190 kg (418 lbs)",
    "195 kg (429 lbs)",
    "200 kg (440 lbs)",
    "200 kg++"
];

export const HEIGHT_OPTIONS = [
    "Prefer Not to Say",
    "50 cm (1' 7.8\")",
    "55 cm (1' 9.7\")",
    "60 cm (1' 11.7\")",
    "65 cm (2' 1.7\")",
    "70 cm (2' 3.6\")",
    "75 cm (2' 5.6\")",
    "80 cm (2' 7.5\")",
    "85 cm (2' 9.5\")",
    "90 cm (2' 11.5\")",
    "95 cm (3' 1.4\")",
    "100 cm (3' 3\")",
    "105 cm (3' 5\")",
    "110 cm (3' 7\")",
    "115 cm (3' 9\")",
    "120 cm (3' 11\")",
    "125 cm (4' 1\")",
    "130 cm (4' 3\")",
    "135 cm (4' 5\")",
    "140 cm (4' 7\")",
    "145 cm (4' 9\")",
    "150 cm (4' 11\")",
    "155 cm (5' 1\")",
    "160 cm (5' 3\")",
    "165 cm (5' 5\")",
    "170 cm (5' 7\")",
    "175 cm (5' 9\")",
    "180 cm (5' 11\")",
    "185 cm (6' 1\")",
    "190 cm (6' 3\")",
    "195 cm (6' 5\")",
    "200 cm (6' 7\")",
    "205 cm (6' 9\")",
    "210 cm (6' 11\")",
    "215 cm (7' 1\")",
    "220 cm (7' 3\")",
    "225 cm (7' 5\")",
    "230 cm (7' 7\")",
    "235 cm (7' 9\")",
    "240 cm (7' 11\")",
    "245 cm (8' 1\")",
    "250 cm (8' 3\")",
    "255 cm (8' 5\")",
    "260 cm (8' 7\")",
    "265 cm (8' 9\")",
    "270 cm (8' 11\")",
    "275 cm (9' 1\")",
    "280 cm (9' 3\")",
    "285 cm (9' 5\")",
    "290 cm (9' 7\")",
    "295 cm (9' 9\")",
    "300 cm (9' 10\")",
    "300 cm++"
];

export const BLOOD_PRESSURE_OPTIONS = [
    "Prefer Not to Say",
    "Low < 90/60 mmHg",
    "Normal 90/60 - 120/80 mmHg",
    "Elevated 120/80 - 129/80 mmHg",
    "Stage 1 Hypertension 130/80 - 139/89 mmHg",
    "Stage 2 Hypertension > 140/90 mmHg",
];

export const BLOOD_SUGAR_LEVEL_OPTIONS = [
    "Prefer Not to Say",
    "Low < 70 mg/dL",
    "Normal 70 - 99 mg/dL",
    "Prediabetes 100 - 125 mg/dL",
    "Diabetes > 126 mg/dL",
];
