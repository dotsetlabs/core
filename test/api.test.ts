/**
 * Core API Module Tests
 *
 * Tests API client types and URL generation.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import {
    getAuthUrl,
    type ApiResponse,
    type ApiError,
    type CloudProject,
    type CloudUser,
} from '../src/api.js';

describe('API Module', () => {
    describe('getAuthUrl', () => {
        const originalEnv = process.env.DOTSET_API_URL;

        afterEach(() => {
            if (originalEnv !== undefined) {
                process.env.DOTSET_API_URL = originalEnv;
            } else {
                delete process.env.DOTSET_API_URL;
            }
        });

        it('should return default auth URL', () => {
            delete process.env.DOTSET_API_URL;
            const url = getAuthUrl();
            expect(url).toBe('https://api.dotsetlabs.com/auth/cli');
        });

        it('should use custom API URL when set', () => {
            process.env.DOTSET_API_URL = 'https://custom-api.example.com';
            const url = getAuthUrl();
            expect(url).toBe('https://custom-api.example.com/auth/cli');
        });
    });

    describe('Type Exports', () => {
        // These are compile-time type checks to ensure exports are correct
        it('should export ApiResponse type', () => {
            const response: ApiResponse<{ data: string }> = {
                data: { data: 'test' },
                status: 200,
            };
            expect(response.status).toBe(200);
        });

        it('should export ApiError type', () => {
            const error: ApiError = {
                error: 'Something went wrong',
                code: 'ERROR_CODE',
                status: 400,
            };
            expect(error.status).toBe(400);
        });

        it('should export CloudProject type', () => {
            const project: CloudProject = {
                id: 'proj-123',
                name: 'Test Project',
                ownerId: 'user-456',
                axionEnabled: true,
                gluonEnabled: false,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            };
            expect(project.id).toBe('proj-123');
            expect(project.axionEnabled).toBe(true);
        });

        it('should export CloudUser type', () => {
            const user: CloudUser = {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
            };
            expect(user.email).toBe('test@example.com');
        });
    });
});
