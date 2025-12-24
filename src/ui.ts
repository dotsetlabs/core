/**
 * Dotset Core - UI Helpers
 * 
 * Shared terminal output formatting for all CLIs.
 */

// ─────────────────────────────────────────────────────────────
// ANSI Color Codes
// ─────────────────────────────────────────────────────────────

export const COLORS = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',

    // Standard colors
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    // Bright colors
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightCyan: '\x1b[96m',

    // Product colors (for branding)
    axion: '\x1b[32m',    // Green
    gluon: '\x1b[36m',    // Cyan
    tachyon: '\x1b[35m',  // Magenta/Violet
} as const;

// ─────────────────────────────────────────────────────────────
// Color Helpers
// ─────────────────────────────────────────────────────────────

export const colors = {
    green: (text: string) => `${COLORS.green}${text}${COLORS.reset}`,
    yellow: (text: string) => `${COLORS.yellow}${text}${COLORS.reset}`,
    red: (text: string) => `${COLORS.red}${text}${COLORS.reset}`,
    cyan: (text: string) => `${COLORS.cyan}${text}${COLORS.reset}`,
    magenta: (text: string) => `${COLORS.magenta}${text}${COLORS.reset}`,
    dim: (text: string) => `${COLORS.dim}${text}${COLORS.reset}`,
    bold: (text: string) => `${COLORS.bold}${text}${COLORS.reset}`,

    // Product-specific
    axion: (text: string) => `${COLORS.axion}${text}${COLORS.reset}`,
    gluon: (text: string) => `${COLORS.gluon}${text}${COLORS.reset}`,
    tachyon: (text: string) => `${COLORS.tachyon}${text}${COLORS.reset}`,
};

// ─────────────────────────────────────────────────────────────
// Output Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Print a success message
 */
export function success(message: string): void {
    console.log(`${COLORS.green}✓${COLORS.reset} ${message}`);
}

/**
 * Print an error message and exit
 */
export function error(message: string): never {
    console.error(`${COLORS.red}✗${COLORS.reset} ${message}`);
    process.exit(1);
}

/**
 * Print an error message without exiting
 */
export function errorNoExit(message: string): void {
    console.error(`${COLORS.red}✗${COLORS.reset} ${message}`);
}

/**
 * Print an info message
 */
export function info(message: string): void {
    console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${message}`);
}

/**
 * Print a warning message
 */
export function warn(message: string): void {
    console.log(`${COLORS.yellow}⚠${COLORS.reset} ${message}`);
}

/**
 * Print a debug message (only if DOTSET_DEBUG is set)
 */
export function debug(message: string): void {
    if (process.env.DOTSET_DEBUG) {
        console.log(`${COLORS.dim}[debug]${COLORS.reset} ${message}`);
    }
}

// ─────────────────────────────────────────────────────────────
// Branding
// ─────────────────────────────────────────────────────────────

/**
 * Print the dotset labs banner
 */
export function printBanner(product?: 'axion' | 'gluon' | 'tachyon'): void {
    const productColor = product ? COLORS[product] : COLORS.cyan;
    console.log(`${COLORS.bold}${productColor}dotset${COLORS.reset}${product ? ` ${COLORS.dim}${product}${COLORS.reset}` : ''}`);
}

/**
 * Product display names
 */
export const PRODUCT_NAMES = {
    axion: 'Axion',
    gluon: 'Gluon',
    tachyon: 'Tachyon',
} as const;

/**
 * Product descriptions
 */
export const PRODUCT_DESCRIPTIONS = {
    axion: 'Secrets Management',
    gluon: 'Security Monitoring',
    tachyon: 'Secure Tunnels',
} as const;
