import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { executeCheckSetValues } from '../../nodes/StratagemsTool/operations/checkSetValues';

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_SET_NAME = 'orders'; // Using the seed data set

describe('checkSetValues Integration Tests', () => {
    let mockExecuteFunctions: any;

    beforeAll(async () => {
        // Wait for API to be ready
        await waitForApi(API_BASE_URL);

        // Setup mock execute functions
        mockExecuteFunctions = {
            getNodeParameter: vi.fn(),
            getInputData: vi.fn(),
            getCredentials: vi.fn(() => Promise.resolve({ host: API_BASE_URL })),
        };
    });

    afterAll(async () => {
        // Cleanup if needed
    });

    describe('Single Mode Integration Tests', () => {
        it('should check existing value in orders set', async () => {
            // Setup - use a value that should exist in the seed data
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce(TEST_SET_NAME) // setName
                .mockReturnValueOnce('single') // mode
                .mockReturnValueOnce('orderId') // valueField
                .mockReturnValueOnce('exists') // outputField
                .mockReturnValueOnce('all') // filterMode
                .mockReturnValueOnce(false); // autoCreate

            // Use a value that should exist in the seed data (5-digit number)
            const existingValue = '12345';
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderId: existingValue }
            }]);

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert
            expect(result).toBeDefined();
            expect(result.operation).toBe('checkSetValues');
            expect(result.mode).toBe('single');
            expect(result.checkedValue).toBe(existingValue);
            expect(typeof result.exists).toBe('boolean');
            expect(result.filterMode).toBe('all');
        });

        it('should check non-existing value in orders set', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce(TEST_SET_NAME)
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            // Use a value that should not exist
            const nonExistingValue = '99999';
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderId: nonExistingValue }
            }]);

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert
            expect(result).toBeDefined();
            expect(result.exists).toBe(false);
            expect(result.checkedValue).toBe(nonExistingValue);
        });

        it('should filter existing only', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce(TEST_SET_NAME)
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('existing')
                .mockReturnValueOnce(false);

            // Use a value that should exist
            const existingValue = '54321';
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderId: existingValue }
            }]);

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert - should return result if exists, null if not
            if (result) {
                expect(result.exists).toBe(true);
                expect(result.filterMode).toBe('existing');
            }
        });

        it('should filter non-existing only', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce(TEST_SET_NAME)
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('nonExisting')
                .mockReturnValueOnce(false);

            // Use a value that should not exist
            const nonExistingValue = '88888';
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderId: nonExistingValue }
            }]);

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert - should return result if not exists, null if exists
            if (result) {
                expect(result.exists).toBe(false);
                expect(result.filterMode).toBe('nonExisting');
            }
        });
    });

    describe('Bulk Mode Integration Tests', () => {
        it('should check bulk values with array input', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce(TEST_SET_NAME)
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIds')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            // Use a mix of existing and non-existing values
            const testValues = ['12345', '99999', '54321', '88888'];
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderIds: testValues }
            }]);

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert
            expect(result).toBeDefined();
            expect(result.operation).toBe('checkSetValues');
            expect(result.mode).toBe('bulk');
            expect(result.filterMode).toBe('all');
            expect(Array.isArray(result.exists)).toBe(true);
            expect(Array.isArray(result.checkedValues)).toBe(true);
            expect(result.totalChecked).toBe(testValues.length);
            expect(typeof result.found).toBe('number');
            expect(typeof result.notFound).toBe('number');
            expect(Array.isArray(result.checks)).toBe(true);
            expect(Array.isArray(result.allChecks)).toBe(true);
        });

        it('should check bulk values with comma-separated string', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce(TEST_SET_NAME)
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIds')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            // Use comma-separated string
            const testValues = '12345,99999,54321,88888';
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderIds: testValues }
            }]);

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert
            expect(result).toBeDefined();
            expect(Array.isArray(result.exists)).toBe(true);
            expect(Array.isArray(result.checkedValues)).toBe(true);
            expect(result.totalChecked).toBe(4);
        });

        it('should filter existing only in bulk mode', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce(TEST_SET_NAME)
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIds')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('existing')
                .mockReturnValueOnce(false);

            const testValues = ['12345', '99999', '54321'];
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderIds: testValues }
            }]);

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert
            if (result) {
                expect(result.filterMode).toBe('existing');
                expect(Array.isArray(result.exists)).toBe(true);
                expect(Array.isArray(result.checkedValues)).toBe(true);
                expect(result.checks.every((check: any) => check.exists)).toBe(true);
            }
        });

        it('should filter non-existing only in bulk mode', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce(TEST_SET_NAME)
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIds')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('nonExisting')
                .mockReturnValueOnce(false);

            const testValues = ['12345', '99999', '54321'];
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderIds: testValues }
            }]);

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert
            if (result) {
                expect(result.filterMode).toBe('nonExisting');
                expect(Array.isArray(result.exists)).toBe(true);
                expect(Array.isArray(result.checkedValues)).toBe(true);
                expect(result.checks.every((check: any) => !check.exists)).toBe(true);
            }
        });
    });

    describe('Auto-Create Integration Tests', () => {
        it('should handle non-existent set with auto-create enabled', async () => {
            // Setup
            const nonExistentSet = `test-set-${Date.now()}`; // Unique name
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce(nonExistentSet)
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(true);

            const testValue = '12345';
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderId: testValue }
            }]);

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, true);

            // Assert
            expect(result).toBeDefined();
            expect(result.exists).toBe(false);
            expect(result.note).toBe('Set created automatically');
        });
    });

    describe('Error Handling Integration Tests', () => {
        it('should handle invalid set name', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('invalid@set#name')
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderId: '12345' }
            }]);

            // Execute and assert
            await expect(executeCheckSetValues.call(mockExecuteFunctions, 0, false))
                .rejects.toThrow('Set name can only contain letters, numbers, hyphens, and underscores');
        });

        it('should handle missing value field', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce(TEST_SET_NAME)
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('nonExistentField')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { someOtherField: 'value' }
            }]);

            // Execute and assert
            await expect(executeCheckSetValues.call(mockExecuteFunctions, 0, false))
                .rejects.toThrow('Value field "nonExistentField" is required and cannot be empty');
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