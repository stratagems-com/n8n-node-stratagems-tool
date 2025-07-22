import { beforeAll, describe, expect, it } from 'vitest';

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_SET_NAME = 'orders'; // Using the seed data set

describe('Stratagems API Integration Tests', () => {
    beforeAll(async () => {
        // Wait for API to be ready
        await waitForApi(API_BASE_URL);
    });

    describe('Set Operations', () => {
        it('should check if a value exists in orders set (single)', async () => {
            // Test with a value that should exist in seed data
            const testValue = '12345';
            const response = await fetch(
                `${API_BASE_URL}/api/v1/sets/${TEST_SET_NAME}/contains?value=${encodeURIComponent(testValue)}`
            );

            expect(response.ok).toBe(true);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.data).toBeDefined();
            expect(typeof data.data.exists).toBe('boolean');
            expect(data.data.value).toBe(testValue);
        });

        it('should check if a non-existing value returns false', async () => {
            // Test with a value that should not exist
            const testValue = '99999';
            const response = await fetch(
                `${API_BASE_URL}/api/v1/sets/${TEST_SET_NAME}/contains?value=${encodeURIComponent(testValue)}`
            );

            expect(response.ok).toBe(true);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.data.exists).toBe(false);
            expect(data.data.value).toBe(testValue);
        });

        it('should check multiple values in bulk', async () => {
            // Test bulk check with mix of existing and non-existing values
            const testValues = ['12345', '99999', '54321', '88888'];
            const response = await fetch(
                `${API_BASE_URL}/api/v1/sets/${TEST_SET_NAME}/contains/bulk`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ values: testValues }),
                }
            );

            expect(response.ok).toBe(true);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.data).toBeDefined();
            expect(typeof data.data.found).toBe('number');
            expect(typeof data.data.notFound).toBe('number');
            expect(Array.isArray(data.data.checks)).toBe(true);
            expect(data.data.checks.length).toBe(testValues.length);

            // Verify each check has the expected structure
            data.data.checks.forEach((check: any) => {
                expect(typeof check.value).toBe('string');
                expect(typeof check.exists).toBe('boolean');
            });
        });

        it('should handle non-existent set', async () => {
            const nonExistentSet = 'non-existent-set';
            const testValue = '12345';
            const response = await fetch(
                `${API_BASE_URL}/api/v1/sets/${nonExistentSet}/contains?value=${encodeURIComponent(testValue)}`
            );

            expect(response.status).toBe(404);
            const data = await response.json();

            expect(data.success).toBe(false);
            expect(data.error).toBe('Set not found');
            expect(data.code).toBe('SET_NOT_FOUND');
        });

        it('should handle invalid set name', async () => {
            const invalidSetName = 'invalid@set#name';
            const testValue = '12345';
            const response = await fetch(
                `${API_BASE_URL}/api/v1/sets/${encodeURIComponent(invalidSetName)}/contains?value=${encodeURIComponent(testValue)}`
            );

            // Should return 400 or 404 depending on validation
            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('App Health', () => {
        it('should return health status', async () => {
            const response = await fetch(`${API_BASE_URL}/api/v1/apps/health`);

            expect(response.ok).toBe(true);
            const data = await response.json();

            expect(data.success).toBe(true);
        });
    });

    describe('Set Information', () => {
        it('should get set information', async () => {
            const response = await fetch(`${API_BASE_URL}/api/v1/sets/${TEST_SET_NAME}`);

            expect(response.ok).toBe(true);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.data).toBeDefined();
            expect(data.data.name).toBe(TEST_SET_NAME);
        });
    });
});

// Helper function to wait for API to be ready
async function waitForApi(baseUrl: string, maxAttempts = 10): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await fetch(`${baseUrl}/api/v1/apps/health`);
            if (response.ok) {
                console.log(`✅ API is ready at ${baseUrl}`);
                return;
            }
        } catch (error) {
            // Ignore errors and retry
        }

        if (attempt < maxAttempts) {
            console.log(`⏳ Waiting for API... (attempt ${attempt}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    throw new Error(`API at ${baseUrl} is not responding after ${maxAttempts} attempts`);
} 