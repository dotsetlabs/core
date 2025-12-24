/**
 * Dotset Core - Peer Product Detection
 * 
 * Helpers for detecting other dotset products.
 */

import { execSync } from 'node:child_process';
import type { ProductKey } from './project.js';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ProductDetection {
    installed: boolean;
    version?: string;
    path?: string;
}

// ─────────────────────────────────────────────────────────────
// CLI Binary Names
// ─────────────────────────────────────────────────────────────

const PRODUCT_BINARIES: Record<ProductKey, string> = {
    axion: 'axn',
    gluon: 'gln',
    tachyon: 'tcn',
};

// ─────────────────────────────────────────────────────────────
// Detection
// ─────────────────────────────────────────────────────────────

/**
 * Check if a product CLI is installed
 */
export function isProductInstalled(product: ProductKey): boolean {
    const binary = PRODUCT_BINARIES[product];
    try {
        execSync(`which ${binary}`, { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Get detailed product installation info
 */
export function detectProduct(product: ProductKey): ProductDetection {
    const binary = PRODUCT_BINARIES[product];

    try {
        const path = execSync(`which ${binary}`, { stdio: 'pipe' }).toString().trim();
        let version: string | undefined;

        try {
            version = execSync(`${binary} --version`, { stdio: 'pipe' }).toString().trim();
        } catch {
            // Version command might not exist
        }

        return { installed: true, path, version };
    } catch {
        return { installed: false };
    }
}

/**
 * Detect all installed products
 */
export function detectAllProducts(): Record<ProductKey, ProductDetection> {
    return {
        axion: detectProduct('axion'),
        gluon: detectProduct('gluon'),
        tachyon: detectProduct('tachyon'),
    };
}

/**
 * Get list of installed product keys
 */
export function getInstalledProducts(): ProductKey[] {
    const products: ProductKey[] = [];
    for (const product of ['axion', 'gluon', 'tachyon'] as ProductKey[]) {
        if (isProductInstalled(product)) {
            products.push(product);
        }
    }
    return products;
}

/**
 * Get NPM package name for a product
 */
export function getPackageName(product: ProductKey): string {
    return `@dotsetlabs/${product}`;
}

/**
 * Get install command for missing products
 */
export function getInstallCommand(products: ProductKey[]): string {
    if (products.length === 3) {
        return 'npm i -g @dotsetlabs/cli';
    }
    return `npm i -g ${products.map(getPackageName).join(' ')}`;
}
