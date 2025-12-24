/**
 * Dotset Core
 * 
 * Shared utilities for all dotset labs CLIs.
 */

// Project configuration
export {
    type ProductKey,
    type ProjectConfig,
    DOTSET_DIR,
    PROJECT_CONFIG_FILE,
    GLOBAL_CONFIG_DIR,
    getDotsetDir,
    getProjectConfigPath,
    getProductDir,
    isProjectInitialized,
    loadProjectConfig,
    saveProjectConfig,
    initializeProject,
    enableProduct,
    disableProduct,
    linkToCloud,
    unlinkFromCloud,
    isCloudLinked,
} from './project.js';

// Authentication
export {
    type Credentials,
    getGlobalConfigDir,
    getCredentialsPath,
    getApiUrl,
    loadCredentials,
    saveCredentials,
    clearCredentials,
    isAuthenticated,
    getAccessToken,
    requireAuth,
    AuthRequiredError,
} from './auth.js';

// UI helpers
export {
    COLORS,
    colors,
    success,
    error,
    errorNoExit,
    info,
    warn,
    debug,
    printBanner,
    PRODUCT_NAMES,
    PRODUCT_DESCRIPTIONS,
} from './ui.js';

// API client
export {
    type CloudProject,
    type CloudUser,
    apiRequest,
    get,
    post,
    patch,
    del,
    createCloudProject,
    getCloudProject,
    listCloudProjects,
    enableCloudProduct,
    disableCloudProduct,
    getCurrentUser,
    getAuthUrl,
} from './api.js';

// Integrations
export {
    type ProductDetection,
    isProductInstalled,
    detectProduct,
    detectAllProducts,
    getInstalledProducts,
    getPackageName,
    getInstallCommand,
} from './integrations.js';
