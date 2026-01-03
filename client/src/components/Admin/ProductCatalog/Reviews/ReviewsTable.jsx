import React, { useState } from 'react';
import { Table, Button, Badge, Spinner, Pagination, Form, Card } from 'react-bootstrap';
import { useProductReviews } from '../../../../context/ProductReviewContext';
import ReviewItem from './ReviewItem';
import { RefreshCw, Trash2, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import './ReviewsTable.css';

const ReviewsTable = ({ reviews, loading, pagination, onPageChange, onRefresh }) => {
    const { adminDeleteReview } = useProductReviews();
    const [selectedReviews, setSelectedReviews] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSelectReview = (reviewId, isSelected) => {
        if (isSelected) {
            setSelectedReviews(prev => Array.from(new Set([...prev, reviewId])));
        } else {
            setSelectedReviews(prev => prev.filter(id => id !== reviewId));
            setSelectAll(false);
        }
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedReviews(reviews.map(review => review.review_id));
        } else {
            setSelectedReviews([]);
        }
    };

    // Bulk delete by calling adminDeleteReview for each id
    const handleBulkDelete = async () => {
        if (selectedReviews.length === 0) return;
        if (!window.confirm(`Delete ${selectedReviews.length} review(s)? This cannot be undone.`)) return;

        setIsDeleting(true);
        for (const id of selectedReviews) {
            try {
                // eslint-disable-next-line no-await-in-loop
                await adminDeleteReview(id);
            } catch (err) {
                // continue deleting remaining
                console.error('Bulk delete error for id', id, err);
            }
        }
        setSelectedReviews([]);
        setSelectAll(false);
        setIsDeleting(false);
        // refresh current page
        onRefresh();
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        setIsDeleting(true);
        await adminDeleteReview(reviewId);
        setIsDeleting(false);
    };

    const renderPaginationItems = () => {
        const items = [];
        const { page, total_pages } = pagination;
        
        if (!total_pages || total_pages <= 1) return items;

        items.push(
            <Pagination.Prev 
                key="prev" 
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
            />
        );

        for (let i = 1; i <= total_pages; i++) {
            if (i === 1 || i === total_pages || (i >= page - 2 && i <= page + 2)) {
                items.push(
                    <Pagination.Item 
                        key={i}
                        active={i === page}
                        onClick={() => onPageChange(i)}
                        disabled={loading}
                    >
                        {i}
                    </Pagination.Item>
                );
            } else if (i === page - 3 || i === page + 3) {
                items.push(<Pagination.Ellipsis key={`ellipsis${i}`} />);
            }
        }

        items.push(
            <Pagination.Next 
                key="next" 
                onClick={() => onPageChange(Math.min(total_pages, page + 1))}
                disabled={page === total_pages || loading}
            />
        );

        return items;
    };

    if (loading && reviews.length === 0) {
        return (
            <Card>
                <Card.Body className="text-center py-5">
                    <Spinner animation="border" />
                    <p className="mt-3">Loading reviews...</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="mb-0">Customer Reviews</h5>
                    <small className="text-muted">
                        Showing {reviews.length} of {pagination.total} reviews
                    </small>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                    </Button>
                </div>
            </Card.Header>

            {/* Bulk Actions Bar */}
            {selectedReviews.length > 0 && (
                <div className="bg-light p-3 border-bottom">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <Badge bg="primary" className="me-2">
                                {selectedReviews.length}
                            </Badge>
                            <span>review(s) selected</span>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant="dark"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={loading || isDeleting}
                            >
                                <Trash2 size={16} className="me-1" />
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Card.Body className="p-0">
                <div className="table-responsive">
                    <Table hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th style={{ width: '50px' }}>
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        disabled={reviews.length === 0 || loading}
                                    />
                                </th>
                                <th>User & Product</th>
                                <th>Review Content</th>
                                <th>Rating</th>
                                <th>Status</th>
                                <th>Replies</th>
                                <th>Date</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <div className="text-muted">
                                            <MessageSquare size={48} className="mb-3 opacity-25" />
                                            <h5>No reviews found</h5>
                                            <p className="mb-0">Try adjusting your filters or check back later</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <ReviewItem
                                        key={review.review_id}
                                        review={review}
                                        isSelected={selectedReviews.includes(review.review_id)}
                                        onSelect={handleSelectReview}
                                        onDelete={handleDeleteReview}
                                    />
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>

            {pagination.total_pages > 1 && (
                <Card.Footer className="d-flex justify-content-between align-items-center">
                    <div>
                        <small className="text-muted">
                            Page {pagination.page} of {pagination.total_pages}
                            {' • '}
                            {pagination.per_page} per page
                        </small>
                    </div>
                    <Pagination className="mb-0">
                        {renderPaginationItems()}
                    </Pagination>
                </Card.Footer>
            )}
        </Card>
    );
};

export default ReviewsTable;
