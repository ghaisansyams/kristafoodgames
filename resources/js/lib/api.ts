const api = () => window.axios;

export const BoothSessionApi = {
    create: () => api().post<{ token: string }>('/api/booth-sessions').then((r) => r.data.token),

    status: (token: string) =>
        api()
            .get<{ status: 'waiting' | 'claimed'; visitor_id: number | null }>(`/api/booth-sessions/${token}`)
            .then((r) => r.data),
};

export const MiniGameApi = {
    record: (game: 'stopwatch' | 'memory_match', won: boolean, visitorId?: number | null, meta?: Record<string, unknown>) =>
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
    score: string;
    /** Memory Match only: how many moves the clear took. */
    moves?: number;
}

export interface LeaderboardGame {
    game: string;
    entries: LeaderboardEntry[];
}

export const LeaderboardApi = {
    recent: () => api().get<{ games: LeaderboardGame[] }>('/api/leaderboard').then((r) => r.data.games),
    full: () => api().get<{ games: LeaderboardGame[] }>('/api/leaderboard/full').then((r) => r.data.games),
};
