import React from 'react';

const SearchQueryCard = ({ search, rank }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">
                            #{rank}
                        </span>
                        <h4 className="font-medium text-gray-900">"{search.query}"</h4>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        {search.avg_results.toFixed(0)} average results
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-2xl font-bold text-gray-900">{search.count}</div>
                    <div className="text-sm text-gray-600">Total searches</div>
                </div>
                <div className="text-right">
                    <div className={`text-sm font-medium px-2 py-1 rounded ${
                        search.avg_results > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {search.avg_results > 0 ? 'Successful' : 'No Results'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchQueryCard;