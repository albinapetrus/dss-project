"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.ApiError = void 0;
exports.entityId = entityId;
const BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ??
    (import.meta.env.DEV ? '/api/v1' : 'http://127.0.0.1:3000/api/v1');
class ApiError extends Error {
    constructor(status, body) {
        super(typeof body === 'object' && body && 'message' in body
            ? String(body.message)
            : `HTTP ${status}`);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}
exports.ApiError = ApiError;
async function request(path, init) {
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
            Accept: 'application/json',
            ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
            ...init?.headers,
        },
    });
    const text = await res.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        }
        catch {
            data = text;
        }
    }
    if (!res.ok) {
        throw new ApiError(res.status, data);
    }
    return data;
}
function entityId(ref) {
    return typeof ref === 'string' ? ref : ref._id;
}
exports.api = {
    alternatives: {
        list: () => request('/alternatives'),
        create: (body) => request('/alternatives', { method: 'POST', body: JSON.stringify(body) }),
        update: (id, body) => request(`/alternatives/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        remove: (id) => request(`/alternatives/${id}`, { method: 'DELETE' }),
    },
    criteria: {
        list: () => request('/criteria'),
        create: (body) => request('/criteria', { method: 'POST', body: JSON.stringify(body) }),
        update: (id, body) => request(`/criteria/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        remove: (id) => request(`/criteria/${id}`, { method: 'DELETE' }),
    },
    evaluations: {
        list: () => request('/evaluations'),
        create: (body) => request('/evaluations', { method: 'POST', body: JSON.stringify(body) }),
        update: (id, body) => request(`/evaluations/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    },
    analytics: {
        matrix: () => request('/analytics/matrix'),
        rankings: (strategy = 'weighted_minmax') => request(`/analytics/rankings?strategy=${encodeURIComponent(strategy)}`),
    },
};
//# sourceMappingURL=api.js.map