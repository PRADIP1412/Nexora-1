import React from 'react';
import { Form, Button, Badge } from 'react-bootstrap';
import { useProductReviews } from '../../../../context/ProductReviewContext';
import { Eye, MessageSquare, Star, Package, Trash2 } from 'lucide-react';
import './ReviewItem.css';

const ReviewItem = ({ review, isSelected, onSelect, onDelete }) => {
    const { selectReview } = useProductReviews();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const truncateText = (text, maxLength = 80) => {
        if (!text) return '';
        return text.length > maxLength 
            ? text.substring(0, maxLength) + '...' 
            : text;
    };

    const handleCheckboxChange = (e) => {
        onSelect(review.review_id, e.target.checked);
    };

    const handleViewDetails = () => {
        selectReview(review);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(review.review_id);
    };
    
    return (
        <tr className={`review-item-row ${isSelected ? 'selected' : ''}`}>
            <td>
                <Form.Check
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    className="review-item-checkbox"
                />
            </td>
            <td>
                <div className="review-item-user-info">
                    <div className="review-item-avatar">
                        {review.user_name?.charAt(0) || 'U'}
                    </div>
                    <div className="review-item-user-details">
                        <div className="review-item-user-name">
                            {review.user_name}
                        </div>
                        <div className="review-item-user-id">
                            ID: {review.user_id}
                        </div>
                        <div className="review-item-product-info">
                            <Package size={12} />
                            <span className="review-item-product-name">
                                {review.product_name || `Variant ${review.variant_id}`}
                            </span>
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div className="review-item-content">
                    <div className="review-item-title">
                        {review.title || 'No Title'}
                    </div>
                    <div className="review-item-body">
                        {truncateText(review.body, 70)}
                    </div>
                </div>
            </td>
            <td>
                <div className="review-item-rating">
                    <Star size={14} className="review-item-rating-star" />
                    {review.rating || 0}.0
                </div>
            </td>
            <td className="review-item-status">
                <div 
                    className={`review-item-status-badge ${review.status}`}
                    title={review.status}
                >
                    {review.status?.charAt(0)?.toUpperCase() || '-'}
                </div>
            </td>
            <td className="review-item-replies">
                {review.replies && review.replies.length > 0 ? (
                    <div className="review-item-replies-badge">
                        <MessageSquare size={12} />
                        {review.replies.length}
                    </div>
                ) : (
                    <div className="review-item-replies-badge empty">
                        -
                    </div>
                )}
            </td>
            <td>
                <div className="review-item-date">
                    {formatDate(review.created_at)}
                </div>
            </td>
            <td>
                <div className="review-item-actions">
                    <button
                        className="review-item-action-btn view"
                        onClick={handleViewDetails}
                        title="View Details"
                    >
                        <Eye size={14} />
                    </button>
                    
                    {review.replies && review.replies.length > 0 && (
                        <button
                            className="review-item-action-btn reply"
                            onClick={handleViewDetails}
                            title={`Has ${review.replies.length} reply(s)`}
                        >
                            <MessageSquare size={14} />
                        </button>
                    )}
                    
                    <button
                        className="review-item-action-btn delete"
                        onClick={handleDelete}
                        title="Delete Review"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ReviewItem;
