import React, { useState, useEffect, useMemo } from 'react';
import { useProductReviews } from '../../../context/ProductReviewContext';
import ReviewStats from '../../../components/Admin/ProductCatalog/Reviews/ReviewStats';
import ReviewFilters from '../../../components/Admin/ProductCatalog/Reviews/ReviewFilters';
import ReviewsTable from '../../../components/Admin/ProductCatalog/Reviews/ReviewsTable';
import ReviewDetailModal from '../../../components/Admin/ProductCatalog/Reviews/ReviewDetailModal';
import { Alert, Container, Row, Col, Card } from 'react-bootstrap';
import './Review.css';

const ReviewsPage = () => {
    const { 
        reviews, 
        loading, 
        error, 
        pagination,
        fetchAllReviews,
        clearError 
    } = useProductReviews();

    // UI-level filters (client-side)
    const [filters, setFilters] = useState({
        status: 'all',
        rating: 'all',
        search: '',
        hasReplies: 'all'
    });

    // Local filtered reviews (derived)
    const filteredReviews = useMemo(() => {
        if (!reviews) return [];
        return reviews.filter(r => {
            // status filter
            if (filters.status !== 'all' && (r.status || '').toLowerCase() !== filters.status) {
                return false;
            }

            // rating filter
            if (filters.rating !== 'all') {
                const minRating = parseInt(filters.rating, 10);
                if (isNaN(minRating)) return true;
                if ((r.rating || 0) < minRating) return false;
            }

            // hasReplies filter
            if (filters.hasReplies === 'with_replies' && (!r.replies || r.replies.length === 0)) return false;
            if (filters.hasReplies === 'no_replies' && (r.replies && r.replies.length > 0)) return false;

            // search filter (user name, product name, review body/title)
            if (filters.search && filters.search.trim() !== '') {
                const q = filters.search.trim().toLowerCase();
                const user = (r.user_name || '').toLowerCase();
                const product = (r.product_name || '').toLowerCase();
                const title = (r.title || '').toLowerCase();
                const body = (r.body || '').toLowerCase();

                if (!user.includes(q) && !product.includes(q) && !title.includes(q) && !body.includes(q)) {
                    return false;
                }
            }

            return true;
        });

    }, [reviews, filters]);

    // Load reviews when component mounts (page 1)
    useEffect(() => {
        fetchAllReviews(1, pagination.per_page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When page changes (triggered from table), load that page
    const handlePageChange = async (page) => {
        await fetchAllReviews(page, pagination.per_page);
    };

    // Handle filter changes (client-side)
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Handle search from filters component
    const handleSearch = (searchTerm) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
    };

    // Clear filters
    const handleClearFilters = () => {
        const defaultFilters = {
            status: 'all',
            rating: 'all',
            search: '',
            hasReplies: 'all'
        };
        setFilters(defaultFilters);
    };

    // recompute stats from filteredReviews (so stats reflect current UI filters)
    const calculateStats = () => {
        const list = filteredReviews;
        const total = list.length;
        const pending = list.filter(r => r.status === 'pending').length;
        const approved = list.filter(r => r.status === 'approved').length;
        const rejected = list.filter(r => r.status === 'rejected').length;
        const withReplies = list.filter(r => r.replies && r.replies.length > 0).length;
        const averageRating = list.length > 0 
            ? (list.reduce((sum, r) => sum + (r.rating || 0), 0) / list.length).toFixed(1)
            : 0;

        return { total, pending, approved, rejected, withReplies, averageRating };
    };

    const stats = calculateStats();

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="mb-0">Product Reviews Management</h2>
                    <p className="text-muted">Manage, moderate, and reply to customer reviews</p>
                </Col>
            </Row>

            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger" onClose={clearError} dismissible>
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Review Stats */}
            <Row className="mb-4">
                <Col>
                    <ReviewStats stats={stats} loading={loading} />
                </Col>
            </Row>

            {/* Quick Info Card */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Admin Actions Available:</strong>
                                    <div className="text-muted small mt-1">
                                        • Approve/Reject reviews • Add admin replies • Delete inappropriate content
                                    </div>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted">
                                        Showing {filteredReviews.length} of {pagination.total} reviews (server)
                                    </small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-4">
                <Col>
                    <ReviewFilters 
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onSearch={handleSearch}
                        onClearFilters={handleClearFilters}
                        loading={loading}
                    />
                </Col>
            </Row>

            {/* Reviews Table */}
            <Row>
                <Col>
                    <ReviewsTable 
                        reviews={filteredReviews}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onRefresh={() => fetchAllReviews(pagination.page, pagination.per_page)}
                    />
                </Col>
            </Row>

            {/* Review Detail Modal */}
            <ReviewDetailModal />
        </Container>
    );
};

export default ReviewsPage;
