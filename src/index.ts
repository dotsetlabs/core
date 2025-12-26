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
    type ProjectPermission,
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
    // RBAC Permission Utilities
    PermissionDeniedError,
    getProjectPermission,
    canAccessScope,
    hasPermission,
    canWrite,
    getRole,
    requireScopeAccess,
    requirePermission,
    permissionsNeedRefresh,
    updatePermissions,
    refreshPermissions,
    ensurePermissions,
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
    PLATFORM_TAGLINE,
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

// Tachyon configuration
export * from './tachyon.js';
