export interface Review {
    id: string;
    highlights: string;
    good?: string;
    bad?: string;
    health: number;
    relationships: number;
    progressing: number;
    work: number;
    cash?: number;
    weight?: number;
    screentime?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReviewData {
    highlights: string;
    good?: string;
    bad?: string;
    health?: number;
    relationships?: number;
    progressing?: number;
    work?: number;
    cash?: number;
    weight?: number;
    screentime?: number;
}

export interface UpdateReviewData extends Partial<CreateReviewData> {
    id: string;
}
