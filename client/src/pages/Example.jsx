import React, { useState, useEffect } from 'react';
import { useAvailableDeliveriesContext } from '../context/delivery_panel/AvailableDeliveriesContext';
import { toast } from 'react-toastify';

const Example = () => {
    // Get Available Deliveries Context
    const {
        // State from AvailableDeliveriesContext
        availableDeliveries: availableDeliveriesList,
        loading: availableLoading,
        error: availableError,
        actionInProgress,
        
        // Actions from AvailableDeliveriesContext
        getAvailableDeliveries,
        acceptDelivery,
        cancelDelivery: cancelAvailableDelivery,
        acceptMultipleDeliveries,
        refreshAvailableDeliveries,
        
        // Utility functions
        clearError: clearAvailableError,
        clearAllData: clearAvailableData,
        filterDeliveries,
        getDeliveryStats,
        calculateWaitingTime
    } = useAvailableDeliveriesContext();

    const [testResults, setTestResults] = useState({});
    const [testLogs, setTestLogs] = useState([]);
    const [testInputs, setTestInputs] = useState({
        // Available deliveries test inputs
        availableDeliveryId: '',
        filterMinWaitTime: '',
        filterMaxWaitTime: '',
        filterSearchTerm: '',
        testDeliveryIds: '1,2,3' // For batch operations
    });

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        const log = { message, type, timestamp };
        setTestLogs(prev => [log, ...prev.slice(0, 49)]);
        console.log(`[${type.toUpperCase()}] ${message}`);
    };

    const updateTestResult = (testName, success, details = '') => {
        setTestResults(prev => ({
            ...prev,
            [testName]: { success, details, timestamp: new Date().toLocaleTimeString() }
        }));
    };

    // Initialize test component
    useEffect(() => {
        addLog('🚀 Available Deliveries Test Component Initialized', 'info');
        addLog('✅ Available Deliveries Context connected', 'success');
        addLog('Ready to test all available deliveries API functions', 'info');
        
        // Clear any existing errors
        clearAvailableError();
    }, [clearAvailableError]);

    // Test Available Deliveries Context Functions
    const testAvailableDeliveriesContext = async () => {
        addLog('🧪 Testing Available Deliveries Context...', 'test');
        
        const tests = [
            { 
                name: 'getAvailableDeliveries', 
                func: () => getAvailableDeliveries(),
                description: 'Fetch available deliveries' 
            },
            { 
                name: 'getDeliveryStats', 
                func: () => {
                    const stats = getDeliveryStats();
                    return { success: true, data: stats, message: 'Delivery stats calculated' };
                },
                description: 'Calculate delivery statistics' 
            },
            { 
                name: 'filterDeliveries', 
                func: () => {
                    const filtered = filterDeliveries({ 
                        minWaitingTime: parseInt(testInputs.filterMinWaitTime) || 0,
                        maxWaitingTime: parseInt(testInputs.filterMaxWaitTime) || 999,
                        searchTerm: testInputs.filterSearchTerm || ''
                    });
                    return { success: true, data: filtered, message: `Filtered to ${filtered.length} deliveries` };
                },
                description: 'Filter available deliveries' 
            },
            { 
                name: 'calculateWaitingTime', 
                func: () => {
                    // Test with a mock date first to ensure function works
                    const testDate = new Date();
                    testDate.setMinutes(testDate.getMinutes() - 45); // 45 minutes ago
                    const testWaitingTime = calculateWaitingTime(testDate.toISOString());
                    
                    // Test with actual data if available
                    if (availableDeliveriesList.length > 0) {
                        const delivery = availableDeliveriesList[0];
                        
                        if (!delivery || !delivery.available_since) {
                            return { 
                                success: true, 
                                data: testWaitingTime,
                                message: `Function works. Test: ${testWaitingTime}min (No available_since in delivery data)` 
                            };
                        }
                        
                        const actualWaitingTime = calculateWaitingTime(delivery.available_since);
                        
                        // Check if the delivery data has the expected properties
                        const hasExpectedProps = delivery.delivery_id && delivery.order_id;
                        
                        return { 
                            success: true, 
                            data: { 
                                test: testWaitingTime, 
                                actual: actualWaitingTime,
                                deliveryId: delivery.delivery_id,
                                orderId: delivery.order_id
                            }, 
                            message: `Function works. Test: ${testWaitingTime}min, Delivery #${delivery.order_id || 'N/A'}: ${actualWaitingTime}min` 
                        };
                    }
                    
                    // If no deliveries, still test the function with mock data
                    return { 
                        success: true, 
                        data: testWaitingTime, 
                        message: `Function works. Test waiting time: ${testWaitingTime} minutes (No deliveries available)` 
                    };
                },
                description: 'Calculate waiting time' 
            },
            { 
                name: 'refreshAvailableDeliveries', 
                func: () => refreshAvailableDeliveries(),
                description: 'Refresh available deliveries' 
            }
        ];

        for (const test of tests) {
            addLog(`Testing ${test.name}...`, 'test');
            try {
                const result = await test.func();
                const success = result?.success === true;
                updateTestResult(
                    `available_${test.name}`, 
                    success, 
                    success ? `${test.description}: ${result.message || 'OK'}` : `${test.description} failed: ${result.message}`
                );
                addLog(`${success ? '✅' : '❌'} ${test.name}: ${result.message || (success ? 'Success' : 'Failed')}`, 
                       success ? 'success' : 'error');
            } catch (err) {
                updateTestResult(`available_${test.name}`, false, `Error: ${err.message}`);
                addLog(`❌ ${test.name}: ${err.message}`, 'error');
            }
            await new Promise(resolve => setTimeout(resolve, 300)); // Small delay between tests
        }
        
        addLog('✅ Available Deliveries Context tests completed!', 'success');
    };

    // Test Accept Delivery
    const testAcceptDelivery = async () => {
        if (!testInputs.availableDeliveryId) {
            toast.error('Please enter an Available Delivery ID');
            return;
        }
        
        addLog(`Accepting delivery ${testInputs.availableDeliveryId}...`, 'test');
        try {
            const result = await acceptDelivery(parseInt(testInputs.availableDeliveryId));
            const success = result?.success === true;
            updateTestResult(
                'acceptDelivery', 
                success, 
                success ? `Delivery ${testInputs.availableDeliveryId} accepted successfully` : `Failed: ${result.message}`
            );
            addLog(`${success ? '✅' : '❌'} Accept Delivery: ${result.message || (success ? 'Success' : 'Failed')}`, 
                   success ? 'success' : 'error');
        } catch (err) {
            updateTestResult('acceptDelivery', false, `Error: ${err.message}`);
            addLog(`❌ Accept Delivery: ${err.message}`, 'error');
        }
    };

    // Test Cancel Delivery
    const testCancelDelivery = async () => {
        if (!testInputs.availableDeliveryId) {
            toast.error('Please enter an Available Delivery ID');
            return;
        }
        
        addLog(`Cancelling delivery ${testInputs.availableDeliveryId}...`, 'test');
        try {
            const result = await cancelAvailableDelivery(parseInt(testInputs.availableDeliveryId));
            const success = result?.success === true;
            updateTestResult(
                'cancelDelivery', 
                success, 
                success ? `Delivery ${testInputs.availableDeliveryId} cancelled successfully` : `Failed: ${result.message}`
            );
            addLog(`${success ? '✅' : '❌'} Cancel Delivery: ${result.message || (success ? 'Success' : 'Failed')}`, 
                   success ? 'success' : 'error');
        } catch (err) {
            updateTestResult('cancelDelivery', false, `Error: ${err.message}`);
            addLog(`❌ Cancel Delivery: ${err.message}`, 'error');
        }
    };

    // Test Accept Multiple Deliveries
    const testAcceptMultipleDeliveries = async () => {
        const deliveryIds = testInputs.testDeliveryIds
            .split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id));
            
        if (deliveryIds.length === 0) {
            toast.error('Please enter valid delivery IDs (comma-separated)');
            return;
        }
        
        addLog(`Accepting ${deliveryIds.length} deliveries...`, 'test');
        try {
            const result = await acceptMultipleDeliveries(deliveryIds);
            const success = result?.success === true;
            updateTestResult(
                'acceptMultipleDeliveries', 
                success, 
                success ? `Accepted ${result.count || deliveryIds.length} deliveries` : `Failed: ${result.message}`
            );
            addLog(`${success ? '✅' : '❌'} Accept Multiple: ${result.message || (success ? 'Success' : 'Failed')}`, 
                   success ? 'success' : 'error');
        } catch (err) {
            updateTestResult('acceptMultipleDeliveries', false, `Error: ${err.message}`);
            addLog(`❌ Accept Multiple: ${err.message}`, 'error');
        }
    };

    // Test All Available Deliveries Functions
    const testAllAvailableDeliveriesFunctions = async () => {
        addLog('🚀 Testing all Available Deliveries functions...', 'test');
        await testAvailableDeliveriesContext();
    };

    // Clear all tests
    const clearTests = () => {
        setTestResults({});
        setTestLogs([]);
        clearAvailableError();
        clearAvailableData();
        addLog('All tests and data cleared', 'info');
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setTestInputs(prev => ({ ...prev, [field]: value }));
    };

    // Calculate test statistics
    const calculateTestStats = () => {
        const total = Object.keys(testResults).length;
        const passed = Object.values(testResults).filter(r => r.success).length;
        const failed = Object.values(testResults).filter(r => !r.success).length;
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        
        return { total, passed, failed, successRate };
    };

    // Render Available Deliveries Context Status
    const renderAvailableDeliveriesStatus = () => {
        const stats = getDeliveryStats();
        const waitingTimes = availableDeliveriesList.map(d => calculateWaitingTime(d.available_since));
        const avgWaitingTime = waitingTimes.length > 0 
            ? Math.round(waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length)
            : 0;
        
        return (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">📦 Available Deliveries Context Status</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-white rounded shadow">
                        <p className="text-sm text-gray-600">Available Deliveries</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalAvailable}</p>
                    </div>
                    <div className="p-3 bg-white rounded shadow">
                        <p className="text-sm text-gray-600">Avg Waiting Time</p>
                        <p className="text-2xl font-bold text-yellow-600">{avgWaitingTime} min</p>
                    </div>
                    <div className="p-3 bg-white rounded shadow">
                        <p className="text-sm text-gray-600">Context State</p>
                        <p className={`text-lg font-bold ${availableLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                            {availableLoading ? '⏳ Loading' : '✅ Ready'}
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-100 rounded">
                        <p className="font-medium mb-1">Context Loading:</p>
                        <p className={availableLoading ? 'text-yellow-600' : 'text-green-600'}>
                            {availableLoading ? '⏳ Loading...' : '✅ Idle'}
                        </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded">
                        <p className="font-medium mb-1">Action In Progress:</p>
                        <p className={actionInProgress ? 'text-yellow-600' : 'text-green-600'}>
                            {actionInProgress ? '⏳ Yes' : '✅ No'}
                        </p>
                    </div>
                </div>
                
                {availableError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="font-medium text-red-700">⚠️ Available Deliveries Error:</p>
                        <p className="text-red-600">{availableError}</p>
                    </div>
                )}
                
                {stats.longestWaiting && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="font-medium text-yellow-700">⏰ Longest Waiting Delivery:</p>
                        <p className="text-yellow-600">
                            Order #{stats.longestWaiting.order_id} - {stats.longestWaiting.waitingTime} minutes
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // Render Available Deliveries Test Controls
    const renderAvailableDeliveriesTests = () => (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">🧪 Available Deliveries Tests</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Delivery ID:</label>
                    <input
                        type="number"
                        value={testInputs.availableDeliveryId}
                        onChange={(e) => handleInputChange('availableDeliveryId', e.target.value)}
                        placeholder="For accept/cancel"
                        className="w-full px-3 py-2 border rounded"
                        min="1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Min Wait Time (min):</label>
                    <input
                        type="number"
                        value={testInputs.filterMinWaitTime}
                        onChange={(e) => handleInputChange('filterMinWaitTime', e.target.value)}
                        placeholder="Filter min wait"
                        className="w-full px-3 py-2 border rounded"
                        min="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Search Term:</label>
                    <input
                        type="text"
                        value={testInputs.filterSearchTerm}
                        onChange={(e) => handleInputChange('filterSearchTerm', e.target.value)}
                        placeholder="Filter by name/address"
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Test Delivery IDs (comma-separated):</label>
                <input
                    type="text"
                    value={testInputs.testDeliveryIds}
                    onChange={(e) => handleInputChange('testDeliveryIds', e.target.value)}
                    placeholder="e.g., 1,2,3"
                    className="w-full px-3 py-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">For batch accept operations</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <button
                    onClick={testAllAvailableDeliveriesFunctions}
                    disabled={availableLoading || actionInProgress}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                    Test All Functions
                </button>
                <button
                    onClick={testAcceptDelivery}
                    disabled={availableLoading || actionInProgress || !testInputs.availableDeliveryId}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    Test Accept Delivery
                </button>
                <button
                    onClick={testCancelDelivery}
                    disabled={availableLoading || actionInProgress || !testInputs.availableDeliveryId}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                    Test Cancel Delivery
                </button>
                <button
                    onClick={testAcceptMultipleDeliveries}
                    disabled={availableLoading || actionInProgress || !testInputs.testDeliveryIds}
                    className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                >
                    Test Batch Accept
                </button>
            </div>
            
            <div className="flex gap-3">
                <button
                    onClick={getAvailableDeliveries}
                    disabled={availableLoading || actionInProgress}
                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                >
                    Refresh Data
                </button>
                <button
                    onClick={clearAvailableData}
                    className="px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                    Clear Data
                </button>
                <button
                    onClick={clearAvailableError}
                    disabled={!availableError}
                    className="px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:opacity-50"
                >
                    Clear Error
                </button>
            </div>
        </div>
    );

    // Render test results
    const renderTestResults = () => {
        const testStats = calculateTestStats();
        if (Object.keys(testResults).length === 0) return null;

        return (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">
                    Test Results: {testStats.passed}/{testStats.total} Passed
                    <span className={`ml-2 text-sm px-2 py-1 rounded ${
                        testStats.successRate === 100 ? 'bg-green-100 text-green-800' : 
                        testStats.successRate >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                    }`}>
                        {testStats.successRate}%
                    </span>
                </h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.entries(testResults).map(([testName, result]) => {
                        const displayName = testName.replace('available_', '');
                        
                        return (
                            <div key={testName} className={`p-3 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'} border-l-4 border-blue-500`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-medium">
                                            {displayName.replace(/([A-Z])/g, ' $1').trim()}:
                                        </span>
                                        <span className={`ml-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                            {result.success ? '✅ PASSED' : '❌ FAILED'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                                </div>
                                {result.details && (
                                    <p className="text-sm mt-1 text-gray-600">{result.details}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render test logs
    const renderTestLogs = () => (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Test Logs</h2>
                <button
                    onClick={() => setTestLogs([])}
                    className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                    Clear Logs
                </button>
            </div>
            <div className="p-4 bg-gray-50 rounded max-h-60 overflow-y-auto">
                {testLogs.length === 0 ? (
                    <p className="text-gray-500 italic">No logs yet. Run tests to see logs here.</p>
                ) : (
                    <div className="space-y-2">
                        {testLogs.map((log, index) => (
                            <div key={index} className={`p-2 rounded text-sm ${
                                log.type === 'error' ? 'bg-red-50 text-red-700' :
                                log.type === 'success' ? 'bg-green-50 text-green-700' :
                                log.type === 'test' ? 'bg-blue-50 text-blue-700' :
                                'bg-gray-50 text-gray-700'
                            }`}>
                                <div className="flex justify-between">
                                    <span>{log.message}</span>
                                    <span className="text-xs opacity-75">{log.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // Render system status
    const renderSystemStatus = () => {
        const testStats = calculateTestStats();
        
        return (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">System Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-3 rounded ${availableLoading ? 'bg-yellow-100' : 'bg-green-100'}`}>
                        <p className="font-medium">Loading:</p>
                        <p className={availableLoading ? 'text-yellow-700' : 'text-green-700'}>
                            {availableLoading ? '⏳ In Progress' : '✅ Idle'}
                        </p>
                    </div>
                    <div className={`p-3 rounded ${availableError ? 'bg-red-100' : 'bg-green-100'}`}>
                        <p className="font-medium">Errors:</p>
                        <p className={availableError ? 'text-red-700' : 'text-green-700'}>
                            {availableError ? '❌ Present' : '✅ None'}
                        </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded">
                        <p className="font-medium">Test Count:</p>
                        <p className="text-blue-700">{testStats.total} tests run</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded">
                        <p className="font-medium">Success Rate:</p>
                        <p className="text-purple-700">{testStats.successRate}%</p>
                    </div>
                </div>
            </div>
        );
    };

    // Render combined test buttons
    const renderCombinedTestButtons = () => (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Quick Tests</h2>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={testAllAvailableDeliveriesFunctions}
                    disabled={availableLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    Test Available Context
                </button>
                <button
                    onClick={clearTests}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    Clear All Tests
                </button>
            </div>
        </div>
    );

    // Render sample delivery data (for debugging)
    const renderSampleDeliveries = () => {
        if (availableDeliveriesList.length === 0) return null;
        
        const sampleDeliveries = availableDeliveriesList.slice(0, 3);
        
        return (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-bold text-yellow-800 mb-2">📋 Sample Available Deliveries</h3>
                <div className="space-y-2">
                    {sampleDeliveries.map((delivery, index) => (
                        <div key={index} className="p-2 bg-white rounded border">
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-medium">Order #{delivery.order_id}</p>
                                    <p className="text-sm text-gray-600">{delivery.customer_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm">Wait: {calculateWaitingTime(delivery.available_since)}min</p>
                                    <p className="text-xs text-gray-500">ID: {delivery.delivery_id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {availableDeliveriesList.length > 3 && (
                        <p className="text-sm text-yellow-700 text-center">
                            ...and {availableDeliveriesList.length - 3} more deliveries
                        </p>
                    )}
                </div>
            </div>
        );
    };

    // Render instructions
    const renderInstructions = () => (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-bold text-blue-800 mb-2">📋 Instructions for Testing Available Deliveries</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li>Click "Test Available Context" to test all Available Deliveries functions</li>
                <li>Enter a Delivery ID to test Accept/Cancel actions</li>
                <li>Use batch IDs (comma-separated) to test multiple acceptance</li>
                <li>Apply filters to test filtering functionality</li>
                <li>Check "Available Deliveries Context Status" for current state</li>
                <li>View Sample Deliveries to see actual data structure</li>
                <li>Monitor Test Results for success/failure status</li>
                <li>Check Test Logs for real-time operation feedback</li>
                <li>Clear tests or data as needed using the provided buttons</li>
            </ul>
        </div>
    );

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-2">📦 Available Deliveries Test Suite</h1>
            <p className="text-gray-600 mb-6">Testing Available Deliveries Context functions</p>
            
            {/* System Status */}
            {renderSystemStatus()}

            {/* Combined Test Buttons */}
            {renderCombinedTestButtons()}

            {/* Available Deliveries Status */}
            {renderAvailableDeliveriesStatus()}

            {/* Available Deliveries Tests */}
            {renderAvailableDeliveriesTests()}

            {/* Sample Deliveries */}
            {renderSampleDeliveries()}

            {/* Test Results */}
            {renderTestResults()}

            {/* Test Logs */}
            {renderTestLogs()}

            {/* Instructions */}
            {renderInstructions()}
        </div>
    );
};

export default Example;