import React from 'react';
import { FaStar, FaTrophy, FaUser, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import { useDeliveryContext } from '../../../context/DeliveryContext';

const DeliveryPerformance = () => {
    const {
        deliveryPerformance,
        deliveryPersons,
        loading
    } = useDeliveryContext();

    if (loading && deliveryPerformance.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Combine performance data with delivery person details
    const getPerformanceData = () => {
        if (!deliveryPerformance || !deliveryPersons) return [];
        
        return deliveryPerformance.map(perf => {
            const person = deliveryPersons.find(p => p.delivery_person_id === perf.delivery_person_id);
            return {
                ...perf,
                user_name: person?.user_name || `DP#${perf.delivery_person_id}`,
                rating: person?.rating || 0,
                status: person?.status || 'UNKNOWN'
            };
        }).sort((a, b) => b.completed - a.completed);
    };

    const performanceData = getPerformanceData();
    const topPerformer = performanceData.length > 0 ? performanceData[0] : null;

    const getRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FaStar key={i} className="w-4 h-4 text-yellow-500 fill-current" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FaStar key={i} className="w-4 h-4 text-yellow-500 fill-current" />);
            } else {
                stars.push(<FaStar key={i} className="w-4 h-4 text-gray-300" />);
            }
        }
        
        return stars;
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Delivery Performance</h3>
                        <p className="text-gray-600">Track performance metrics of delivery persons</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                        <FaTrophy className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* Top Performer */}
            {topPerformer && (
                <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <FaTrophy className="w-5 h-5 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-700">TOP PERFORMER</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800">{topPerformer.user_name}</h4>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                    <FaCheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium text-gray-700">{topPerformer.completed} deliveries</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaStar className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium text-gray-700">{topPerformer.rating}/5</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-yellow-600">🥇</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Delivery Person
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Completed Deliveries
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {performanceData.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    <FaChartLine className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                    <p>No performance data available</p>
                                    <p className="text-sm text-gray-400 mt-1">Performance metrics will appear after deliveries</p>
                                </td>
                            </tr>
                        ) : (
                            performanceData.map((person, index) => (
                                <tr key={person.delivery_person_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                #{index + 1}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <FaUser className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{person.user_name}</p>
                                                <p className="text-xs text-gray-500">ID: {person.delivery_person_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FaCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            <span className="text-sm font-semibold text-gray-800">
                                                {person.completed}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-1">deliveries</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex">
                                                {getRatingStars(person.rating)}
                                            </div>
                                            <span className="ml-2 text-sm font-medium text-gray-700">
                                                {person.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${person.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            person.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {person.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DeliveryPerformance;