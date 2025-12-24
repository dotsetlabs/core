/**
 * Dotset Core - API Client
 * 
 * Base HTTP client for dotset labs API.
 */

import { getAccessToken, getApiUrl, AuthRequiredError } from './auth.js';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
    data: T;
    status: number;
}

export interface ApiError {
    error: string;
    code?: string;
    status: number;
}

// ─────────────────────────────────────────────────────────────
// Client
// ─────────────────────────────────────────────────────────────

/**
 * Internal authenticated API request handler
 */
async function _apiRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    options?: { requireAuth?: boolean; softError?: boolean }
): Promise<T | null> {
    const { requireAuth = true, softError = false } = options ?? {};
    const baseUrl = getApiUrl();
    const url = `${baseUrl}${path}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const betaPassword = process.env.DOTSET_BETA_PASSWORD;
    if (betaPassword) {
        headers['X-Beta-Password'] = betaPassword;
    }

    if (requireAuth) {
        const token = getAccessToken();
        if (!token) {
            throw new AuthRequiredError('Not logged in. Run `dotset login` to authenticate.');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

        if (!response.ok) {
            if (response.status === 401 && data.code === 'BETA_ACCESS_REQUIRED') {
                if (softError) return null;
                throw new Error('Beta access required. Set DOTSET_BETA_PASSWORD environment variable.');
            }
            if (softError) return null;
            const error = new Error(String(data.error) || `API error: ${response.status}`) as Error & { status: number; code?: string };
            error.status = response.status;
            error.code = data.code as string | undefined;
            throw error;
        }

        return data as T;
    } catch (err) {
        if (softError) return null;
        throw err;
    }
}

/**
 * Make an authenticated API request (throws on error)
 */
export async function apiRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    options?: { requireAuth?: boolean }
): Promise<T> {
    const result = await _apiRequest<T>(method, path, body, options);
    return result!;
}

/**
 * Make an authenticated API request with soft error support
 */
export async function apiRequestSoft<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    options?: { requireAuth?: boolean }
): Promise<T | null> {
    return _apiRequest<T>(method, path, body, { ...options, softError: true });
}

/**
 * GET request
 */
export async function get<T>(path: string, options?: { requireAuth?: boolean }): Promise<T> {
    return apiRequest<T>('GET', path, undefined, options);
}

/**
 * POST request
 */
export async function post<T>(path: string, body?: unknown, options?: { requireAuth?: boolean }): Promise<T> {
    return apiRequest<T>('POST', path, body, options);
}

/**
 * PATCH request
 */
export async function patch<T>(path: string, body?: unknown, options?: { requireAuth?: boolean }): Promise<T> {
    return apiRequest<T>('PATCH', path, body, options);
}

/**
 * DELETE request
 */
export async function del<T>(path: string, options?: { requireAuth?: boolean }): Promise<T> {
    return apiRequest<T>('DELETE', path, undefined, options);
}

// ─────────────────────────────────────────────────────────────
// Common API Types
// ─────────────────────────────────────────────────────────────

export interface CloudProject {
    id: string;
    name: string;
    ownerId: string;
    axionEnabled: boolean;
    gluonEnabled: boolean;
    tachyonEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CloudUser {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
}

// ─────────────────────────────────────────────────────────────
// Project API
// ─────────────────────────────────────────────────────────────

/**
 * Create a cloud project
 */
export async function createCloudProject(data: {
    name: string;
    axionEnabled?: boolean;
    gluonEnabled?: boolean;
    tachyonEnabled?: boolean;
}): Promise<CloudProject> {
    return post<CloudProject>('/projects', data);
}

/**
 * Get a cloud project
 */
export async function getCloudProject(id: string): Promise<CloudProject> {
    return get<CloudProject>(`/projects/${id}`);
}

/**
 * List cloud projects
 */
export async function listCloudProjects(): Promise<CloudProject[]> {
    return get<CloudProject[]>('/projects');
}

/**
 * Enable a product on a cloud project
 */
export async function enableCloudProduct(projectId: string, product: 'axion' | 'gluon' | 'tachyon'): Promise<CloudProject> {
    return post<CloudProject>(`/projects/${projectId}/enable/${product}`);
}

/**
 * Disable a product on a cloud project
 */
export async function disableCloudProduct(projectId: string, product: 'axion' | 'gluon' | 'tachyon'): Promise<CloudProject> {
    return post<CloudProject>(`/projects/${projectId}/disable/${product}`);
}

// ─────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<CloudUser> {
    return apiRequest<CloudUser>('GET', '/auth/me');
}

/**
 * Get the current user (softly)
 */
export async function getCurrentUserSoft(): Promise<CloudUser | null> {
    return apiRequestSoft<CloudUser>('GET', '/auth/me');
}

/**
 * Get CLI auth URL for browser-based login
 */
export function getAuthUrl(): string {
    const baseUrl = getApiUrl();
    return `${baseUrl}/auth/cli`;
}
