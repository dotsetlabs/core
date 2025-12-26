/**
 * Dotset Core - Unified Authentication
 *
 * Manages credentials storage in ~/.dotset/ for all CLIs.
 * Includes RBAC permission types and client-side permission checking.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/**
 * Project-specific permissions for the authenticated user
 */
export interface ProjectPermission {
    /** Project ID */
    projectId: string;
    /** Project name for display */
    projectName: string;
    /** User's role in this project */
    role: 'admin' | 'member' | 'readonly';
    /** Scopes the user can access */
    allowedScopes: string[];
    /** Custom permissions (resource:action -> boolean) */
    customPermissions: Record<string, boolean>;
}

/**
 * Stored credentials with permission claims
 */
export interface Credentials {
    /** JWT access token */
    accessToken: string;
    /** Refresh token */
    refreshToken?: string;
    /** Token expiration (ISO string) */
    expiresAt?: string;
    /** User email */
    email?: string;
    /** User ID */
    userId?: string;
    /** Auth provider */
    provider?: 'github' | 'google';
    /** Project permissions (fetched from server) */
    permissions?: ProjectPermission[];
    /** When permissions were last updated */
    permissionsUpdatedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

/** Global config directory */
const GLOBAL_CONFIG_DIR = join(homedir(), '.dotset');

/** Credentials file */
const CREDENTIALS_FILE = 'credentials.yaml';

/** API base URL */
const DEFAULT_API_URL = 'https://api.dotsetlabs.com';

/** How often to refresh permissions (5 minutes) */
const PERMISSIONS_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

// ─────────────────────────────────────────────────────────────
// Path Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Get the global config directory
 */
export function getGlobalConfigDir(): string {
    return GLOBAL_CONFIG_DIR;
}

/**
 * Get the credentials file path
 */
export function getCredentialsPath(): string {
    return join(GLOBAL_CONFIG_DIR, CREDENTIALS_FILE);
}

/**
 * Get the API URL from environment or default
 */
export function getApiUrl(): string {
    return process.env.DOTSET_API_URL ?? DEFAULT_API_URL;
}

// ─────────────────────────────────────────────────────────────
// Credential Management
// ─────────────────────────────────────────────────────────────

/**
 * Ensure global config directory exists
 */
function ensureGlobalConfigDir(): void {
    if (!existsSync(GLOBAL_CONFIG_DIR)) {
        mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
}

/**
 * Load stored credentials
 */
export function loadCredentials(): Credentials | null {
    const credPath = getCredentialsPath();
    if (!existsSync(credPath)) {
        return null;
    }
    try {
        const content = readFileSync(credPath, 'utf-8');
        return parseYaml(content) as Credentials;
    } catch {
        return null;
    }
}

/**
 * Save credentials
 */
export function saveCredentials(credentials: Credentials): void {
    ensureGlobalConfigDir();
    const credPath = getCredentialsPath();
    writeFileSync(credPath, stringifyYaml(credentials), { encoding: 'utf-8', mode: 0o600 });
}

/**
 * Clear stored credentials
 */
export function clearCredentials(): void {
    const credPath = getCredentialsPath();
    if (existsSync(credPath)) {
        unlinkSync(credPath);
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    const creds = loadCredentials();
    if (!creds?.accessToken) {
        return false;
    }

    // Check if token is expired
    if (creds.expiresAt) {
        const expiry = new Date(creds.expiresAt);
        if (expiry <= new Date()) {
            return false;
        }
    }

    return true;
}

/**
 * Get the current access token
 */
export function getAccessToken(): string | null {
    const creds = loadCredentials();
    if (!creds?.accessToken) {
        return null;
    }

    // Check expiry
    if (creds.expiresAt) {
        const expiry = new Date(creds.expiresAt);
        if (expiry <= new Date()) {
            return null;
        }
    }

    return creds.accessToken;
}

/**
 * Require authentication - throws if not authenticated
 */
export function requireAuth(): Credentials {
    const creds = loadCredentials();
    if (!creds?.accessToken) {
        throw new AuthRequiredError('Not logged in. Run `dotset login` to authenticate.');
    }

    if (creds.expiresAt) {
        const expiry = new Date(creds.expiresAt);
        if (expiry <= new Date()) {
            throw new AuthRequiredError('Session expired. Run `dotset login` to re-authenticate.');
        }
    }

    return creds;
}

/**
 * Custom error for authentication requirements
 */
export class AuthRequiredError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthRequiredError';
    }
}

// ─────────────────────────────────────────────────────────────
// RBAC Permission Checking
// ─────────────────────────────────────────────────────────────

/**
 * Custom error for permission denied
 */
export class PermissionDeniedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PermissionDeniedError';
    }
}

/**
 * Get permissions for a specific project
 */
export function getProjectPermission(projectId: string): ProjectPermission | null {
    const creds = loadCredentials();
    if (!creds?.permissions) {
        return null;
    }
    return creds.permissions.find(p => p.projectId === projectId) ?? null;
}

/**
 * Check if user can access a specific scope in a project
 */
export function canAccessScope(projectId: string, scope: string): boolean {
    const perm = getProjectPermission(projectId);
    if (!perm) {
        // No cached permission - allow (server will enforce)
        return true;
    }

    // Admins can access all scopes
    if (perm.role === 'admin') {
        return true;
    }

    return perm.allowedScopes.includes(scope) || perm.allowedScopes.includes('*');
}

/**
 * Check if user has a specific permission (resource:action)
 */
export function hasPermission(projectId: string, resource: string, action: string): boolean {
    const perm = getProjectPermission(projectId);
    if (!perm) {
        // No cached permission - allow (server will enforce)
        return true;
    }

    // Admins have all permissions
    if (perm.role === 'admin') {
        return true;
    }

    const key = `${resource}:${action}`;
    return perm.customPermissions[key] === true;
}

/**
 * Check if user can write in a project
 */
export function canWrite(projectId: string): boolean {
    const perm = getProjectPermission(projectId);
    if (!perm) {
        return true; // Server will enforce
    }
    return perm.role === 'admin' || perm.role === 'member';
}

/**
 * Get user's role in a project
 */
export function getRole(projectId: string): 'admin' | 'member' | 'readonly' | null {
    const perm = getProjectPermission(projectId);
    return perm?.role ?? null;
}

/**
 * Require scope access - throws PermissionDeniedError if denied
 */
export function requireScopeAccess(projectId: string, scope: string): void {
    if (!canAccessScope(projectId, scope)) {
        const perm = getProjectPermission(projectId);
        const projectName = perm?.projectName ?? projectId;
        throw new PermissionDeniedError(
            `Access Denied: Your role does not have permission to access the [${scope}] scope in project "${projectName}".`
        );
    }
}

/**
 * Require a specific permission - throws PermissionDeniedError if denied
 */
export function requirePermission(projectId: string, resource: string, action: string): void {
    if (!hasPermission(projectId, resource, action)) {
        const perm = getProjectPermission(projectId);
        const projectName = perm?.projectName ?? projectId;
        throw new PermissionDeniedError(
            `Access Denied: Your role does not have permission for [${resource}:${action}] in project "${projectName}".`
        );
    }
}

/**
 * Check if permissions need refresh
 */
export function permissionsNeedRefresh(): boolean {
    const creds = loadCredentials();
    if (!creds?.permissionsUpdatedAt) {
        return true;
    }
    const lastUpdate = new Date(creds.permissionsUpdatedAt);
    return Date.now() - lastUpdate.getTime() > PERMISSIONS_REFRESH_INTERVAL_MS;
}

/**
 * Update stored permissions
 */
export function updatePermissions(permissions: ProjectPermission[]): void {
    const creds = loadCredentials();
    if (!creds) {
        return;
    }
    creds.permissions = permissions;
    creds.permissionsUpdatedAt = new Date().toISOString();
    saveCredentials(creds);
}

/**
 * Fetch and update permissions from server
 */
export async function refreshPermissions(): Promise<ProjectPermission[]> {
    const token = getAccessToken();
    if (!token) {
        return [];
    }

    try {
        const response = await fetch(`${getApiUrl()}/auth/permissions`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json() as { permissions: ProjectPermission[] };
        const permissions = data.permissions ?? [];
        updatePermissions(permissions);
        return permissions;
    } catch {
        return [];
    }
}

/**
 * Ensure permissions are loaded, refreshing if needed
 */
export async function ensurePermissions(): Promise<ProjectPermission[]> {
    const creds = loadCredentials();
    
    if (!creds?.accessToken) {
        return [];
    }

    if (permissionsNeedRefresh()) {
        return await refreshPermissions();
    }

    return creds.permissions ?? [];
}
