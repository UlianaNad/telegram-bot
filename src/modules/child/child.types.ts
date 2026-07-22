import { ChildStatus } from "../../generated/prisma/enums.js";

export type ChildKeyboardItem = {
    id: string;
    firstName: string;
    cardNumber: number;
};

export type ChildCardData = {
    firstName: string;
    cardNumber: number;
    birthDate: Date;
    status: ChildStatus;
    totalVisits: number;
    freeVisitBalance: number;
    visitsUntilBonus: number;
};