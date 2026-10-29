import type { DecisionLabContent, DecisionSession, RecommendationResponse, Role } from '@/types/content';

const api = () => window.axios;

export const ContentApi = {
    decisionLab: () => api().get<DecisionLabContent>('/api/content/decision-lab').then((r) => r.data),
};

export const BoothSessionApi = {
    create: () => api().post<{ token: string }>('/api/booth-sessions').then((r) => r.data.token),

    status: (token: string) =>
        api()
            .get<{ status: 'waiting' | 'claimed'; visitor_id: number | null }>(`/api/booth-sessions/${token}`)
            .then((r) => r.data),
};

export const DecisionSessionApi = {
    create: (visitorId?: number) =>
        api()
            .post<{ session: DecisionSession }>('/api/decision-sessions', { visitor_id: visitorId })
            .then((r) => r.data.session),

    update: (sessionId: number, role: Role, answers: Record<string, unknown>) =>
        api()
            .patch<{ session: DecisionSession }>(`/api/decision-sessions/${sessionId}`, { role, answers })
            .then((r) => r.data.session),

    recommend: (sessionId: number, role: Role, answers: Record<string, unknown>) =>
        api()
            .post<RecommendationResponse>(`/api/decision-sessions/${sessionId}/recommendation`, { role, answers })
            .then((r) => r.data),

    handoff: (sessionId: number, type: 'email' | 'expert', email?: string): Promise<{ ok: boolean; message?: string }> =>
        api()
            .post(`/api/decision-sessions/${sessionId}/handoff`, { type, email })
            .then(() => ({ ok: true }))
            .catch((error) => ({
                ok: false,
                message: error.response?.data?.message ?? 'Something went wrong. Please try again.',
            })),
};

export const MiniGameApi = {
    record: (game: 'stopwatch', won: boolean, visitorId?: number | null, meta?: Record<string, unknown>) =>
        api().post('/api/mini-game-attempts', { game, won, visitor_id: visitorId, meta }),
};

export interface VisitorInput {
    name: string;
    company: string;
    job_title: string;
    contact: string;
    email: string;
}

export const VisitorApi = {
    create: (data: VisitorInput): Promise<{ ok: true; visitorId: number } | { ok: false; message?: string }> =>
        api()
            .post<{ visitor: { id: number } }>('/api/visitors', data)
            .then((r) => ({ ok: true as const, visitorId: r.data.visitor.id }))
            .catch((error) => ({
                ok: false as const,
                message: error.response?.data?.message ?? 'Something went wrong. Please try again.',
            })),
};

export type QueueTicketStatus = 'waiting' | 'called' | 'serving' | 'done' | 'skipped';

export interface QueueTicketSummary {
    id: number;
    number: number;
    status: QueueTicketStatus;
    visitor_name?: string | null;
}

export interface QueueState {
    current: QueueTicketSummary | null;
    waiting: { id: number; number: number }[];
}

export const QueueApi = {
    state: () => api().get<QueueState>('/api/queue/state').then((r) => r.data),

    ticket: (ticketId: number) => api().get<{ ticket: QueueTicketSummary }>(`/api/queue/tickets/${ticketId}`).then((r) => r.data.ticket),

    advance: (completedTicketId?: number | null) =>
        api()
            .post<{ current: QueueTicketSummary | null }>('/api/queue/advance', { completed_ticket_id: completedTicketId ?? null })
            .then((r) => r.data.current),

    confirm: (ticketId: number) =>
        api()
            .post<{ visitor_id: number | null }>(`/api/queue/tickets/${ticketId}/confirm`)
            .then((r) => r.data.visitor_id),

    skip: (ticketId: number) => api().post(`/api/queue/tickets/${ticketId}/skip`),
};

export interface LeaderboardEntry {
    name: string;
    game: string;
    score: string;
}

export interface LeaderboardGame {
    game: string;
    entries: { name: string; score: string }[];
}

export const LeaderboardApi = {
    recent: () => api().get<{ entries: LeaderboardEntry[] }>('/api/leaderboard').then((r) => r.data.entries),
    full: () => api().get<{ games: LeaderboardGame[] }>('/api/leaderboard/full').then((r) => r.data.games),
};
