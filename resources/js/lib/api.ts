import type { DecisionLabContent, DecisionResult, DecisionSession, PackagingOptionChoice } from '@/types/content';

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

    update: (sessionId: number, data: Partial<DecisionSession>) =>
        api()
            .patch<{ session: DecisionSession }>(`/api/decision-sessions/${sessionId}`, data)
            .then((r) => r.data.session),

    options: (sessionId: number) =>
        api()
            .get<{ options: PackagingOptionChoice[] }>(`/api/decision-sessions/${sessionId}/options`)
            .then((r) => r.data.options),

    decide: (sessionId: number, packagingOptionId: number) =>
        api()
            .post<{ session: DecisionSession; result: DecisionResult }>(
                `/api/decision-sessions/${sessionId}/decision`,
                { packaging_option_id: packagingOptionId },
            )
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
