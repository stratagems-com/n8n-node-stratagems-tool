import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeCheckSetValues } from '../nodes/StratagemsTool/operations/checkSetValues';
import { StratagemsHttpClient } from '../nodes/StratagemsTool/utils/httpClient';

// Mock the HTTP client
vi.mock('../nodes/StratagemsTool/utils/httpClient', () => ({
    StratagemsHttpClient: vi.fn(),
    buildSetEndpoint: vi.fn((setName: string, operation?: string) => {
        const base = `/api/v1/sets/${encodeURIComponent(setName)}`;
        return operation ? `${base}/${operation}` : base;
    }),
    validateSetName: vi.fn((name: string) => {
        if (!name || typeof name !== 'string') {
            throw new Error('Set name is required and must be a string');
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
            throw new Error('Set name can only contain letters, numbers, hyphens, and underscores');
        }
    }),
    validateValue: vi.fn((value: string) => {
        if (!value || typeof value !== 'string') {
            throw new Error('Value is required and must be a string');
        }
        if (value.length > 255) {
            throw new Error('Value cannot exceed 255 characters');
        }
    }),
}));

describe('checkSetValues Operation', () => {
    let mockExecuteFunctions: any;
    let mockHttpClient: any;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Mock HTTP client methods
        mockHttpClient = {
            get: vi.fn(),
            post: vi.fn(),
        };

        // Mock execute functions
        mockExecuteFunctions = {
            getNodeParameter: vi.fn(),
            getInputData: vi.fn(() => [{
                json: {
                    orderId: 'ORD-12345',
                    orderIds: ['ORD-12345', 'ORD-67890', 'ORD-11111'],
                    orderIdsString: 'ORD-12345,ORD-67890,ORD-11111',
                }
            }]),
            getCredentials: vi.fn(() => Promise.resolve({ host: 'http://localhost:3000' })),
        };

        // Mock StratagemsHttpClient constructor
        (StratagemsHttpClient as any).mockImplementation(() => mockHttpClient);
    });

    describe('Single Mode', () => {
        it('should check single value successfully', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders') // setName
                .mockReturnValueOnce('single') // mode
                .mockReturnValueOnce('orderId') // valueField
                .mockReturnValueOnce('exists') // outputField
                .mockReturnValueOnce('all') // filterMode
                .mockReturnValueOnce(false); // autoCreate

            mockHttpClient.get.mockResolvedValue({
                success: true,
                data: {
                    exists: true,
                    value: 'ORD-12345',
                    setValue: {
                        id: '123',
                        value: 'ORD-12345',
                        setId: '456',
                        createdAt: '2024-01-15T10:30:00Z'
                    }
                }
            });

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert
            expect(result).toEqual({
                exists: true,
                checkedValue: 'ORD-12345',
                operation: 'checkSetValues',
                mode: 'single',
                filterMode: 'all',
                setValue: {
                    id: '123',
                    value: 'ORD-12345',
                    setId: '456',
                    createdAt: '2024-01-15T10:30:00Z'
                }
            });

            expect(mockHttpClient.get).toHaveBeenCalledWith(
                'http://localhost:3000/api/v1/sets/processed-orders/contains?value=ORD-12345'
            );
        });

        it('should handle non-existing value', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            mockHttpClient.get.mockResolvedValue({
                success: true,
                data: {
                    exists: false,
                    value: 'ORD-99999'
                }
            });

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert
            expect(result).toEqual({
                exists: false,
                checkedValue: 'ORD-12345',
                operation: 'checkSetValues',
                mode: 'single',
                filterMode: 'all',
                setValue: null
            });
        });

        it('should filter existing only', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('existing')
                .mockReturnValueOnce(false);

            mockHttpClient.get.mockResolvedValue({
                success: true,
                data: {
                    exists: false,
                    value: 'ORD-99999'
                }
            });

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert - should return null for non-existing when filtering existing only
            expect(result).toBeNull();
        });

        it('should handle set not found with auto-create', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('new-set')
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(true);

            mockHttpClient.get.mockRejectedValue(new Error('API Error (404): Set not found - Code: SET_NOT_FOUND'));

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, true);

            // Assert
            expect(result).toEqual({
                exists: false,
                checkedValue: 'ORD-12345',
                operation: 'checkSetValues',
                mode: 'single',
                filterMode: 'all',
                setValue: null,
                note: 'Set created automatically'
            });
        });

        it('should throw error for set not found without auto-create', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('non-existent-set')
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            mockHttpClient.get.mockRejectedValue(new Error('API Error (404): Set not found - Code: SET_NOT_FOUND'));

            // Execute and assert
            await expect(executeCheckSetValues.call(mockExecuteFunctions, 0, false))
                .rejects.toThrow('Set "non-existent-set" not found. Enable "Auto Create Set/Lookup" to create it automatically.');
        });
    });

    describe('Bulk Mode', () => {
        it('should check bulk values with array input', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIds')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            mockHttpClient.post.mockResolvedValue({
                success: true,
                data: {
                    found: 2,
                    notFound: 1,
                    errors: [],
                    checks: [
                        { value: 'ORD-12345', exists: true, setValue: { id: '123' } },
                        { value: 'ORD-67890', exists: false },
                        { value: 'ORD-11111', exists: true, setValue: { id: '456' } }
                    ]
                }
            });

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert
            expect(result).toEqual({
                exists: [true, false, true],
                checkedValues: ['ORD-12345', 'ORD-67890', 'ORD-11111'],
                operation: 'checkSetValues',
                mode: 'bulk',
                filterMode: 'all',
                totalChecked: 3,
                found: 2,
                notFound: 1,
                errors: [],
                checks: [
                    { value: 'ORD-12345', exists: true, setValue: { id: '123' } },
                    { value: 'ORD-67890', exists: false },
                    { value: 'ORD-11111', exists: true, setValue: { id: '456' } }
                ],
                allChecks: [
                    { value: 'ORD-12345', exists: true, setValue: { id: '123' } },
                    { value: 'ORD-67890', exists: false },
                    { value: 'ORD-11111', exists: true, setValue: { id: '456' } }
                ]
            });

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                'http://localhost:3000/api/v1/sets/processed-orders/contains/bulk',
                { values: ['ORD-12345', 'ORD-67890', 'ORD-11111'] }
            );
        });

        it('should check bulk values with comma-separated string', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIdsString')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            mockHttpClient.post.mockResolvedValue({
                success: true,
                data: {
                    found: 2,
                    notFound: 1,
                    errors: [],
                    checks: [
                        { value: 'ORD-12345', exists: true },
                        { value: 'ORD-67890', exists: false },
                        { value: 'ORD-11111', exists: true }
                    ]
                }
            });

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert
            expect(result.exists).toEqual([true, false, true]);
            expect(result.checkedValues).toEqual(['ORD-12345', 'ORD-67890', 'ORD-11111']);
        });

        it('should filter existing only in bulk mode', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIds')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('existing')
                .mockReturnValueOnce(false);

            mockHttpClient.post.mockResolvedValue({
                success: true,
                data: {
                    found: 2,
                    notFound: 1,
                    errors: [],
                    checks: [
                        { value: 'ORD-12345', exists: true },
                        { value: 'ORD-67890', exists: false },
                        { value: 'ORD-11111', exists: true }
                    ]
                }
            });

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert - should only include existing values
            expect(result.exists).toEqual([true, true]);
            expect(result.checkedValues).toEqual(['ORD-12345', 'ORD-11111']);
            expect(result.checks).toHaveLength(2);
            expect(result.checks.every((check: any) => check.exists)).toBe(true);
        });

        it('should filter non-existing only in bulk mode', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIds')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('nonExisting')
                .mockReturnValueOnce(false);

            mockHttpClient.post.mockResolvedValue({
                success: true,
                data: {
                    found: 2,
                    notFound: 1,
                    errors: [],
                    checks: [
                        { value: 'ORD-12345', exists: true },
                        { value: 'ORD-67890', exists: false },
                        { value: 'ORD-11111', exists: true }
                    ]
                }
            });

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert - should only include non-existing values
            expect(result.exists).toEqual([false]);
            expect(result.checkedValues).toEqual(['ORD-67890']);
            expect(result.checks).toHaveLength(1);
            expect(result.checks.every((check: any) => !check.exists)).toBe(true);
        });

        it('should return null when no items match filter', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIds')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('existing')
                .mockReturnValueOnce(false);

            mockHttpClient.post.mockResolvedValue({
                success: true,
                data: {
                    found: 0,
                    notFound: 3,
                    errors: [],
                    checks: [
                        { value: 'ORD-12345', exists: false },
                        { value: 'ORD-67890', exists: false },
                        { value: 'ORD-11111', exists: false }
                    ]
                }
            });

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, false);

            // Assert - should return null when no existing values found
            expect(result).toBeNull();
        });

        it('should handle set not found with auto-create in bulk mode', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('new-set')
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIds')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(true);

            mockHttpClient.post.mockRejectedValue(new Error('API Error (404): Set not found - Code: SET_NOT_FOUND'));

            // Execute
            const result = await executeCheckSetValues.call(mockExecuteFunctions, 0, true);

            // Assert
            expect(result.exists).toEqual([false, false, false]);
            expect(result.checkedValues).toEqual(['ORD-12345', 'ORD-67890', 'ORD-11111']);
            expect(result.totalChecked).toBe(3);
            expect(result.found).toBe(0);
            expect(result.notFound).toBe(3);
            expect(result.note).toBe('Set created automatically');
        });
    });

    describe('Error Handling', () => {
        it('should throw error for missing value field', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('nonExistentField')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            // Execute and assert
            await expect(executeCheckSetValues.call(mockExecuteFunctions, 0, false))
                .rejects.toThrow('Value field "nonExistentField" is required and cannot be empty');
        });

        it('should throw error for invalid mode', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('invalid-mode')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            // Execute and assert
            await expect(executeCheckSetValues.call(mockExecuteFunctions, 0, false))
                .rejects.toThrow('Invalid mode: invalid-mode. Must be \'single\' or \'bulk\'');
        });

        it('should throw error for invalid value type in single mode', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('single')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            // Override input data to have non-string value
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderId: 12345 } // number instead of string
            }]);

            // Execute and assert
            await expect(executeCheckSetValues.call(mockExecuteFunctions, 0, false))
                .rejects.toThrow('Value must be a string, got number');
        });

        it('should throw error for invalid value type in bulk mode', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderId')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            // Override input data to have invalid bulk value
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderId: 12345 } // number instead of array/string
            }]);

            // Execute and assert
            await expect(executeCheckSetValues.call(mockExecuteFunctions, 0, false))
                .rejects.toThrow('For bulk mode, value must be an array or comma-separated string, got number');
        });

        it('should throw error for empty bulk values', async () => {
            // Setup
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('processed-orders')
                .mockReturnValueOnce('bulk')
                .mockReturnValueOnce('orderIds')
                .mockReturnValueOnce('exists')
                .mockReturnValueOnce('all')
                .mockReturnValueOnce(false);

            // Override input data to have empty array
            mockExecuteFunctions.getInputData = vi.fn(() => [{
                json: { orderIds: [] }
            }]);

            // Execute and assert
            await expect(executeCheckSetValues.call(mockExecuteFunctions, 0, false))
                .rejects.toThrow('No valid values provided for bulk check');
        });
    });
}); 