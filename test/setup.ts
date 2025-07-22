import { beforeEach } from 'node:test';
import { vi } from 'vitest';

// Mock n8n workflow types
vi.mock('n8n-workflow', () => ({
    NodeConnectionType: {
        Main: 'main',
    },
}));

// Global test setup
beforeEach(() => {
    vi.clearAllMocks();
}); 