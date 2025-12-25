/**
 * Core Auth Module Tests
 *
 * Tests authentication utilities like credential management and path helpers.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';

// Mock homedir to use temp directory for tests
const originalHomedir = homedir;
let testDir: string;

// We'll test the pure functions that don't require mocking
import {
    getGlobalConfigDir,
    getCredentialsPath,
    getApiUrl,
    AuthRequiredError,
} from '../src/auth.js';

describe('Auth Module', () => {
    describe('getGlobalConfigDir', () => {
        it('should return ~/.dotset path', () => {
            const result = getGlobalConfigDir();
            expect(result).toBe(join(homedir(), '.dotset'));
        });
    });

    describe('getCredentialsPath', () => {
        it('should return ~/.dotset/credentials.yaml path', () => {
            const result = getCredentialsPath();
            expect(result).toBe(join(homedir(), '.dotset', 'credentials.yaml'));
        });
    });

    describe('getApiUrl', () => {
        const originalEnv = process.env.DOTSET_API_URL;

        afterEach(() => {
            if (originalEnv !== undefined) {
                process.env.DOTSET_API_URL = originalEnv;
            } else {
                delete process.env.DOTSET_API_URL;
            }
        });

        it('should return default API URL when env not set', () => {
            delete process.env.DOTSET_API_URL;
            const result = getApiUrl();
            expect(result).toBe('https://api.dotsetlabs.com');
        });

        it('should return custom API URL when env is set', () => {
            process.env.DOTSET_API_URL = 'https://custom-api.example.com';
            const result = getApiUrl();
            expect(result).toBe('https://custom-api.example.com');
        });
    });

    describe('AuthRequiredError', () => {
        it('should be an instance of Error', () => {
            const error = new AuthRequiredError('Test message');
            expect(error).toBeInstanceOf(Error);
        });

        it('should have correct name', () => {
            const error = new AuthRequiredError('Test message');
            expect(error.name).toBe('AuthRequiredError');
        });

        it('should have correct message', () => {
            const error = new AuthRequiredError('Not logged in');
            expect(error.message).toBe('Not logged in');
        });
    });
});
