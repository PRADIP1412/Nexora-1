import React from 'react';
import './OrderFeedback.css';

const OrderFeedbackCard = ({ feedback }) => {
    if (!feedback) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">No Feedback Available</h3>
                <p className="text-gray-600">No feedback has been provided for this order.</p>
            </div>
        );
    }

    const renderStars = (rating) => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Customer Feedback</h3>
                    <p className="text-sm text-gray-600">
                        Submitted on {new Date(feedback.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="text-right">
                    <div className="mb-1">{renderStars(feedback.rating)}</div>
                    <span className="text-sm text-gray-600">{feedback.rating}/5</span>
                </div>
            </div>
            
            <div className="mb-4">
                <p className="text-gray-700">{feedback.comment}</p>
            </div>
            
            {feedback.suggestions && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-800 mb-1">Suggestions:</p>
                    <p className="text-blue-700">{feedback.suggestions}</p>
                </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-500">Order Experience:</span>
                    <span className="ml-2 font-medium">{feedback.order_experience || 'N/A'}</span>
                </div>
                <div>
                    <span className="text-gray-500">Delivery Experience:</span>
                    <span className="ml-2 font-medium">{feedback.delivery_experience || 'N/A'}</span>
                </div>
                <div>
                    <span className="text-gray-500">Product Quality:</span>
                    <span className="ml-2 font-medium">{feedback.product_quality || 'N/A'}</span>
                </div>
                <div>
                    <span className="text-gray-500">Would Recommend:</span>
                    <span className="ml-2 font-medium">
                        {feedback.would_recommend ? 'Yes' : 'No'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderFeedbackCard;