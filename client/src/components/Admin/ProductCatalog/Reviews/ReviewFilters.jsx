import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, InputGroup, Card } from 'react-bootstrap';
import { Search, Filter, X } from 'lucide-react';
import './ReviewFilters.css';

const ReviewFilters = ({ filters, onFilterChange, onSearch, onClearFilters, loading }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search);

    useEffect(() => {
        setSearchTerm(filters.search || '');
    }, [filters.search]);

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
    ];

    const ratingOptions = [
        { value: 'all', label: 'All Ratings' },
        { value: '5', label: '★★★★★ (5)' },
        { value: '4', label: '★★★★☆ & above (4+)' },
        { value: '3', label: '★★★☆☆ & above (3+)' },
        { value: '2', label: '★★☆☆☆ & above (2+)' },
        { value: '1', label: '★☆☆☆☆ (1)' }
    ];

    const replyOptions = [
        { value: 'all', label: 'All Reviews' },
        { value: 'with_replies', label: 'With Replies' },
        { value: 'no_replies', label: 'No Replies' }
    ];

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        onFilterChange(newFilters);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const hasActiveFilters = filters.status !== 'all' || 
                           filters.rating !== 'all' || 
                           (filters.search && filters.search.trim() !== '') || 
                           filters.hasReplies !== 'all';

    return (
        <Card>
            <Card.Body>
                <Form onSubmit={handleSearchSubmit}>
                    <Row className="align-items-end">
                        <Col md={3} className="mb-3">
                            <Form.Label className="small text-muted mb-1">Search Reviews</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Search size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="User, product, or review text..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    disabled={loading}
                                />
                            </InputGroup>
                        </Col>

                        <Col md={2} className="mb-3">
                            <Form.Label className="small text-muted mb-1">Status</Form.Label>
                            <Form.Select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                disabled={loading}
                                size="sm"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Col md={2} className="mb-3">
                            <Form.Label className="small text-muted mb-1">Rating</Form.Label>
                            <Form.Select
                                value={filters.rating}
                                onChange={(e) => handleFilterChange('rating', e.target.value)}
                                disabled={loading}
                                size="sm"
                            >
                                {ratingOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Col md={2} className="mb-3">
                            <Form.Label className="small text-muted mb-1">Replies</Form.Label>
                            <Form.Select
                                value={filters.hasReplies}
                                onChange={(e) => handleFilterChange('hasReplies', e.target.value)}
                                disabled={loading}
                                size="sm"
                            >
                                {replyOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Col md={3} className="mb-3">
                            <div className="d-flex gap-2">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={loading}
                                    className="flex-grow-1"
                                >
                                    <Search size={16} className="me-1" />
                                    Search
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    onClick={onClearFilters}
                                    disabled={!hasActiveFilters || loading}
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>

                {hasActiveFilters && (
                    <div className="mt-3 pt-3 border-top">
                        <small className="text-muted d-flex align-items-center">
                            <Filter size={14} className="me-1" />
                            Active filters: 
                            {filters.status !== 'all' && (
                                <span className="badge bg-secondary ms-2">{filters.status}</span>
                            )}
                            {filters.rating !== 'all' && (
                                <span className="badge bg-secondary ms-2">{filters.rating} stars</span>
                            )}
                            {filters.hasReplies !== 'all' && (
                                <span className="badge bg-secondary ms-2">
                                    {filters.hasReplies === 'with_replies' ? 'Has Replies' : 'No Replies'}
                                </span>
                            )}
                            {filters.search && (
                                <span className="badge bg-secondary ms-2">Search: "{filters.search}"</span>
                            )}
                        </small>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ReviewFilters;
