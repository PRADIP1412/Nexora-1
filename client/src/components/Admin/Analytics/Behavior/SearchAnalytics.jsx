import React from 'react';

const SearchAnalytics = ({ data }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Search Analytics</h2>
                <div className="text-sm">
                    <span className="text-green-600 font-medium">{data.search_success_rate.toFixed(1)}%</span>
                    <span className="text-gray-500 ml-1">success rate</span>
                </div>
            </div>

            {/* Search Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{data.total_searches.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Searches</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                        {data.total_searches - data.no_result_searches}
                    </div>
                    <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{data.no_result_searches}</div>
                    <div className="text-sm text-gray-600">No Results</div>
                </div>
            </div>

            {/* Top Searches */}
            <div>
                <h4 className="font-medium text-gray-900 mb-4">Top Search Queries</h4>
                <div className="space-y-3">
                    {data.top_searches.slice(0, 5).map((search, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-blue-600 font-bold">{index + 1}</span>
                                </div>
                                <div className="font-medium text-gray-900">
                                    "{search.query}"
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-900">{search.count} searches</div>
                                <div className="text-sm text-gray-500">{search.avg_results.toFixed(0)} avg results</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchAnalytics;