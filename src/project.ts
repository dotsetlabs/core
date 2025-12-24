/**
 * Dotset Core - Unified Project Configuration
 * 
 * Manages the .dotset/ directory structure shared by all CLIs.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ProductKey = 'axion' | 'gluon' | 'tachyon';

export interface ProjectConfig {
    /** Schema version */
    version: 1;
    /** Project name */
    name: string;
    /** Enabled products */
    products: {
        axion: boolean;
        gluon: boolean;
        tachyon: boolean;
    };
    /** Cloud project ID (null if local-only) */
    cloudProjectId: string | null;
    /** When project was created */
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// Constants  
// ─────────────────────────────────────────────────────────────

/** Project config directory */
export const DOTSET_DIR = '.dotset';

/** Project config file */
export const PROJECT_CONFIG_FILE = 'project.yaml';

/** Global config directory */
export const GLOBAL_CONFIG_DIR = join(homedir(), '.dotset');

// ─────────────────────────────────────────────────────────────
// Path Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Get the .dotset directory path for a project
 */
export function getDotsetDir(cwd: string = process.cwd()): string {
    return join(cwd, DOTSET_DIR);
}

/**
 * Get the project config file path
 */
export function getProjectConfigPath(cwd: string = process.cwd()): string {
    return join(getDotsetDir(cwd), PROJECT_CONFIG_FILE);
}

/**
 * Get the product-specific directory path
 */
export function getProductDir(product: ProductKey, cwd: string = process.cwd()): string {
    return join(getDotsetDir(cwd), product);
}

// ─────────────────────────────────────────────────────────────
// Project Config Management
// ─────────────────────────────────────────────────────────────

/**
 * Check if a dotset project is initialized in the directory
 */
export function isProjectInitialized(cwd: string = process.cwd()): boolean {
    return existsSync(getProjectConfigPath(cwd));
}

/**
 * Load the project config
 */
export function loadProjectConfig(cwd: string = process.cwd()): ProjectConfig | null {
    const configPath = getProjectConfigPath(cwd);
    if (!existsSync(configPath)) {
        return null;
    }
    try {
        const content = readFileSync(configPath, 'utf-8');
        return parseYaml(content) as ProjectConfig;
    } catch {
        return null;
    }
}

/**
 * Save the project config
 */
export function saveProjectConfig(config: ProjectConfig, cwd: string = process.cwd()): void {
    const dotsetDir = getDotsetDir(cwd);
    const configPath = getProjectConfigPath(cwd);

    if (!existsSync(dotsetDir)) {
        mkdirSync(dotsetDir, { recursive: true });
    }

    writeFileSync(configPath, stringifyYaml(config), 'utf-8');
}

/**
 * Initialize a new project
 */
export function initializeProject(options: {
    name?: string;
    products: { axion: boolean; gluon: boolean; tachyon: boolean };
    cloudProjectId?: string;
    cwd?: string;
}): ProjectConfig {
    const cwd = options.cwd ?? process.cwd();
    const name = options.name ?? basename(cwd);

    const config: ProjectConfig = {
        version: 1,
        name,
        products: options.products,
        cloudProjectId: options.cloudProjectId ?? null,
        createdAt: new Date().toISOString(),
    };

    // Create .dotset directory
    const dotsetDir = getDotsetDir(cwd);
    if (!existsSync(dotsetDir)) {
        mkdirSync(dotsetDir, { recursive: true });
    }

    // Create product directories for enabled products
    for (const [product, enabled] of Object.entries(options.products)) {
        if (enabled) {
            const productDir = getProductDir(product as ProductKey, cwd);
            if (!existsSync(productDir)) {
                mkdirSync(productDir, { recursive: true });
            }
        }
    }

    // Save config
    saveProjectConfig(config, cwd);

    return config;
}

/**
 * Enable a product on an existing project
 */
export function enableProduct(product: ProductKey, cwd: string = process.cwd()): ProjectConfig {
    const config = loadProjectConfig(cwd);
    if (!config) {
        throw new Error('No dotset project found. Run `dotset init` first.');
    }

    config.products[product] = true;

    // Create product directory
    const productDir = getProductDir(product, cwd);
    if (!existsSync(productDir)) {
        mkdirSync(productDir, { recursive: true });
    }

    saveProjectConfig(config, cwd);
    return config;
}

/**
 * Disable a product on an existing project
 */
export function disableProduct(product: ProductKey, cwd: string = process.cwd()): ProjectConfig {
    const config = loadProjectConfig(cwd);
    if (!config) {
        throw new Error('No dotset project found. Run `dotset init` first.');
    }

    config.products[product] = false;
    saveProjectConfig(config, cwd);
    return config;
}

/**
 * Link project to cloud
 */
export function linkToCloud(cloudProjectId: string, cwd: string = process.cwd()): ProjectConfig {
    const config = loadProjectConfig(cwd);
    if (!config) {
        throw new Error('No dotset project found. Run `dotset init` first.');
    }

    config.cloudProjectId = cloudProjectId;
    saveProjectConfig(config, cwd);
    return config;
}

/**
 * Unlink project from cloud
 */
export function unlinkFromCloud(cwd: string = process.cwd()): ProjectConfig {
    const config = loadProjectConfig(cwd);
    if (!config) {
        throw new Error('No dotset project found. Run `dotset init` first.');
    }

    config.cloudProjectId = null;
    saveProjectConfig(config, cwd);
    return config;
}

/**
 * Check if project is linked to cloud
 */
export function isCloudLinked(cwd: string = process.cwd()): boolean {
    const config = loadProjectConfig(cwd);
    return config?.cloudProjectId != null;
}
