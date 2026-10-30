export type Role = 'brand_owner' | 'converter';

export interface JourneyOption {
    label: string;
    icon?: string;
    /** Shows a free-text field once this option is picked. */
    text?: boolean;
    /** Picking this option clears every other pick in its step. */
    exclusive?: boolean;
}

export interface JourneyStep {
    key: string;
    mode: 'single' | 'multi';
    max?: number;
    /** Fixed option slugs, or... */
    options?: string[];
    /** ...options that depend on the answer to an earlier step. */
    depends_on?: string;
    options_by?: Record<string, string[]>;
    /** Builds the option list from earlier answers instead (e.g. the "Other" category). */
    derive?: {
        for: string[];
        base: string[];
        rules: Record<string, Record<string, string[]>>;
    };
}

export interface Journey {
    steps: JourneyStep[];
    requirements: string[];
}

export interface DecisionLabContent {
    roles: Role[];
    options: Record<string, JourneyOption>;
    journeys: Record<Role, Journey>;
}

/** Answers keyed by step key: one slug for single steps, a list for multi steps. */
export type JourneyAnswers = Record<string, string | string[] | null>;

export interface Visitor {
    id: number;
    name: string;
    company: string;
    job_title: string;
    contact: string;
    industry: string;
    industry_other?: string | null;
}

export interface DecisionSession {
    id: number;
    visitor_id: number | null;
    role: Role | null;
    recommended_product: string | null;
    completed_at: string | null;
}

export interface RecommendedProduct {
    slug: string;
    name: string;
    brand: 'foopak' | 'enza';
    description: string;
    icon: string;
    logos: string[];
}

export interface DecisionResult {
    role: Role;
    solution_label: string;
    product: RecommendedProduct;
    reasons: string[];
    alternatives: RecommendedProduct[];
}

export type RecommendationResponse = { status: 'needs_more_info' } | { status: 'complete'; result: DecisionResult };
