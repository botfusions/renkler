#!/usr/bin/env node

/**
 * API Testing Script
 * Quick validation script to test API endpoints
 */

const axios = require('axios');

class APITester {
    constructor(baseURL = 'http://localhost:3000') {
        this.baseURL = baseURL;
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async runTests() {
        console.log('🧪 Testing Sanzo Color Advisor API');
        console.log(`📍 Base URL: ${this.baseURL}`);
        console.log('=' .repeat(50));

        const tests = [
            { name: 'Health Check', test: () => this.testHealthCheck() },
            { name: 'API Documentation', test: () => this.testDocs() },
            { name: 'Color Analysis', test: () => this.testColorAnalysis() },
            { name: 'Get Colors', test: () => this.testGetColors() },
            { name: 'Get Combinations', test: () => this.testGetCombinations() },
            { name: 'Similar Colors', test: () => this.testSimilarColors() },
            { name: 'Cache Status', test: () => this.testCacheStatus() }
        ];

        let passed = 0;
        let failed = 0;

        for (const test of tests) {
            try {
                console.log(`\n🔄 Running: ${test.name}`);
                const result = await test.test();
                if (result.success) {
                    console.log(`✅ ${test.name}: PASSED`);
                    if (result.message) console.log(`   ${result.message}`);
                    passed++;
                } else {
                    console.log(`❌ ${test.name}: FAILED`);
                    if (result.error) console.log(`   Error: ${result.error}`);
                    failed++;
                }
            } catch (error) {
                console.log(`❌ ${test.name}: FAILED`);
                console.log(`   Error: ${error.message}`);
                failed++;
            }
        }

        console.log('\n' + '=' .repeat(50));
        console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
        console.log(`✨ Overall: ${failed === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

        return failed === 0;
    }

    async testHealthCheck() {
        const response = await this.client.get('/api/health');

        if (response.status !== 200) {
            return { success: false, error: `Expected 200, got ${response.status}` };
        }

        const data = response.data;
        if (!data.success || data.data.status !== 'healthy') {
            return { success: false, error: 'Health check indicates unhealthy status' };
        }

        return {
            success: true,
            message: `Response time: ${data.data.services?.colorAgent ? 'ColorAgent OK' : 'ColorAgent issue'}`
        };
    }

    async testDocs() {
        const response = await this.client.get('/api/docs');

        if (response.status !== 200) {
            return { success: false, error: `Expected 200, got ${response.status}` };
        }

        const data = response.data;
        if (!data.success || !data.data.title) {
            return { success: false, error: 'Invalid documentation structure' };
        }

        return {
            success: true,
            message: `Found ${data.data.endpoints?.length || 0} documented endpoints`
        };
    }

    async testColorAnalysis() {
        const payload = {
            roomType: 'living_room',
            ageGroup: 'adult',
            wall: '#F5F5F5',
            furniture: '#8B4513'
        };

        const response = await this.client.post('/api/analyze', payload);

        if (response.status !== 200) {
            return { success: false, error: `Expected 200, got ${response.status}` };
        }

        const data = response.data;
        if (!data.success || !data.data.recommendations) {
            return { success: false, error: 'No recommendations received' };
        }

        return {
            success: true,
            message: `Generated ${data.data.recommendations.length} recommendations`
        };
    }

    async testGetColors() {
        const response = await this.client.get('/api/colors?limit=5');

        if (response.status !== 200) {
            return { success: false, error: `Expected 200, got ${response.status}` };
        }

        const data = response.data;
        if (!data.success || !Array.isArray(data.data.colors)) {
            return { success: false, error: 'Invalid colors response' };
        }

        return {
            success: true,
            message: `Retrieved ${data.data.colors.length} colors, total: ${data.data.pagination.total}`
        };
    }

    async testGetCombinations() {
        const response = await this.client.get('/api/combinations?limit=3');

        if (response.status !== 200) {
            return { success: false, error: `Expected 200, got ${response.status}` };
        }

        const data = response.data;
        if (!data.success || !Array.isArray(data.data.combinations)) {
            return { success: false, error: 'Invalid combinations response' };
        }

        return {
            success: true,
            message: `Retrieved ${data.data.combinations.length} combinations`
        };
    }

    async testSimilarColors() {
        const payload = {
            color: '#FF0000',
            limit: 3,
            threshold: 30
        };

        const response = await this.client.post('/api/colors/similar', payload);

        if (response.status !== 200) {
            return { success: false, error: `Expected 200, got ${response.status}` };
        }

        const data = response.data;
        if (!data.success || !Array.isArray(data.data.colors)) {
            return { success: false, error: 'Invalid similar colors response' };
        }

        return {
            success: true,
            message: `Found ${data.data.colors.length} similar colors`
        };
    }

    async testCacheStatus() {
        const response = await this.client.get('/api/cache/status');

        if (response.status !== 200) {
            return { success: false, error: `Expected 200, got ${response.status}` };
        }

        const data = response.data;
        if (!data.success) {
            return { success: false, error: 'Cache status request failed' };
        }

        return {
            success: true,
            message: 'Cache status retrieved successfully'
        };
    }

    async waitForServer(maxRetries = 30, delay = 1000) {
        console.log(`⏳ Waiting for server at ${this.baseURL}...`);

        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.client.get('/api/health');
                console.log('✅ Server is ready!');
                return true;
            } catch (error) {
                if (i === maxRetries - 1) {
                    console.log('❌ Server did not start in time');
                    return false;
                }
                process.stdout.write('.');
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return false;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const baseURL = args[0] || 'http://localhost:3000';
    const waitForServer = args.includes('--wait');

    async function main() {
        const tester = new APITester(baseURL);

        if (waitForServer) {
            const serverReady = await tester.waitForServer();
            if (!serverReady) {
                process.exit(1);
            }
        }

        const success = await tester.runTests();
        process.exit(success ? 0 : 1);
    }

    main().catch(error => {
        console.error('💥 Test runner failed:', error.message);
        process.exit(1);
    });
}

module.exports = APITester;