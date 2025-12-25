/**
 * Dotset Core - Unified Authentication
 * 
 * Manages credentials storage in ~/.dotset/ for all CLIs.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

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
