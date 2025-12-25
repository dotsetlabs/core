/**
 * Dotset Core - Tachyon Configuration Management
 * 
 * Manages Tachyon-specific project configuration, state, and webhooks.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { getProductDir } from './project.js';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface TachyonProjectConfig {
    version: string;
    projectId?: string;
    projectName?: string;
    defaultSubdomain?: string;
    defaultPort?: number;
    preferences?: {
        captureLimit?: number;
        autoReconnect?: boolean;
    };
}

export interface TunnelState {
    activeTunnels: Array<{
        id: string;
        port: number;
        subdomain: string;
        url: string;
        public: boolean;
        pid: number;
        startedAt: string;
    }>;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const CONFIG_FILE = 'config.yaml';
const STATE_FILE = 'state.json';
const WEBHOOKS_FILE = 'webhooks.json';

const DEFAULT_CONFIG: TachyonProjectConfig = {
    version: '1',
    preferences: {
        captureLimit: 100,
        autoReconnect: true,
    },
};

// ─────────────────────────────────────────────────────────────
// Logic
// ─────────────────────────────────────────────────────────────

/**
 * Get path to Tachyon project config file
 */
export function getTachyonConfigPath(cwd: string = process.cwd()): string {
    return join(getProductDir('tachyon', cwd), CONFIG_FILE);
}

/**
 * Get path to Tachyon state file
 */
export function getTachyonStatePath(cwd: string = process.cwd()): string {
    return join(getProductDir('tachyon', cwd), STATE_FILE);
}

/**
 * Get path to Tachyon webhooks file
 */
export function getTachyonWebhooksPath(cwd: string = process.cwd()): string {
    return join(getProductDir('tachyon', cwd), WEBHOOKS_FILE);
}

/**
 * Load Tachyon project configuration
 */
export function loadTachyonConfig(cwd: string = process.cwd()): TachyonProjectConfig | null {
    const configPath = getTachyonConfigPath(cwd);
    if (!existsSync(configPath)) {
        return null;
    }

    try {
        const content = readFileSync(configPath, 'utf-8');
        const config = parseYaml(content) as TachyonProjectConfig;
        return { ...DEFAULT_CONFIG, ...config };
    } catch {
        return null;
    }
}

/**
 * Save Tachyon project configuration
 */
export function saveTachyonConfig(config: TachyonProjectConfig, cwd: string = process.cwd()): void {
    const productDir = getProductDir('tachyon', cwd);
    if (!existsSync(productDir)) {
        mkdirSync(productDir, { recursive: true });
    }
    const configPath = getTachyonConfigPath(cwd);
    writeFileSync(configPath, stringifyYaml(config), { encoding: 'utf-8', mode: 0o644 });
}

/**
 * Load Tachyon tunnel state
 */
export function loadTachyonState(cwd: string = process.cwd()): TunnelState {
    const statePath = getTachyonStatePath(cwd);
    if (!existsSync(statePath)) {
        return { activeTunnels: [] };
    }

    try {
        const content = readFileSync(statePath, 'utf-8');
        return JSON.parse(content) as TunnelState;
    } catch {
        return { activeTunnels: [] };
    }
}

/**
 * Save Tachyon tunnel state
 */
export function saveTachyonState(state: TunnelState, cwd: string = process.cwd()): void {
    const productDir = getProductDir('tachyon', cwd);
    if (!existsSync(productDir)) {
        mkdirSync(productDir, { recursive: true });
    }
    const statePath = getTachyonStatePath(cwd);
    writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
}
