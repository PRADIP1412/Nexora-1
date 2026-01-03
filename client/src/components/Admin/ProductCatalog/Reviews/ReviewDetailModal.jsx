import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Badge, Alert, Spinner, Card, ListGroup } from 'react-bootstrap';
import { useProductReviews } from '../../../../context/ProductReviewContext';
import { 
    User, 
    Calendar, 
    Package, 
    MessageSquare, 
    CheckCircle, 
    XCircle, 
    Trash2,
    Clock
} from 'lucide-react';
import './ReviewDetailModal.css';

const ReviewDetailModal = () => {
    const { 
        selectedReview, 
        clearSelectedReview, 
        updateReviewStatus, 
        addAdminReply,
        deleteReply,
        adminDeleteReview,
        loading,
        error,
        clearError 
    } = useProductReviews();

    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeletingReview, setIsDeletingReview] = useState(false);

    useEffect(() => {
        if (!selectedReview) {
            setReplyText('');
            setIsSubmitting(false);
            setIsDeletingReview(false);
        }
    }, [selectedReview]);

    // handle status update
    const handleStatusUpdate = async (newStatus) => {
        if (!selectedReview) return;
        await updateReviewStatus(selectedReview.review_id, newStatus);
    };

    // reply submit
    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedReview) return;
        setIsSubmitting(true);
        await addAdminReply(selectedReview.review_id, { body: replyText.trim() });
        setIsSubmitting(false);
        setReplyText('');
    };

    // delete reply
    const handleDeleteReply = async (replyId) => {
        if (!selectedReview) return;
        if (window.confirm('Are you sure you want to delete this reply?')) {
            await deleteReply(replyId, selectedReview.review_id);
        }
    };

    // delete review
    const handleDeleteReview = async () => {
        if (!selectedReview) return;
        if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            setIsDeletingReview(true);
            await adminDeleteReview(selectedReview.review_id);
            setIsDeletingReview(false);
            clearSelectedReview();
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="text-warning d-flex align-items-center">
                {'★'.repeat(rating)}
                {'☆'.repeat(5 - (rating || 0))}
                <span className="text-muted ms-2 fs-6">({rating}.0)</span>
            </div>
        );
    };

    const renderStatusBadge = (status) => {
        const variants = {
            pending: { bg: 'warning', text: 'Pending', icon: <Clock size={14} /> },
            approved: { bg: 'success', text: 'Approved', icon: <CheckCircle size={14} /> },
            rejected: { bg: 'danger', text: 'Rejected', icon: <XCircle size={14} /> }
        };
        const config = variants[status] || { bg: 'secondary', text: 'Unknown', icon: null };
        
        return (
            <Badge bg={config.bg} className="d-flex align-items-center gap-1">
                {config.icon}
                {config.text}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    if (!selectedReview) return null;

    return (
        <Modal 
            show={!!selectedReview} 
            onHide={clearSelectedReview}
            size="lg"
            centered
            scrollable
        >
            <Modal.Header closeButton className="border-bottom-0">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <div>
                        Review Details
                        <div className="text-muted small">
                            ID: {selectedReview.review_id}
                        </div>
                    </div>
                    <div className="ms-auto">
                        {renderStatusBadge(selectedReview.status)}
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="pt-0">
                {error && (
                    <Alert variant="danger" onClose={clearError} dismissible className="mb-4">
                        {error}
                    </Alert>
                )}

                <Card className="mb-4 border-0 shadow-sm">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-light rounded-circle p-2">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h6 className="mb-0">{selectedReview.user_name || 'Unknown User'}</h6>
                                    <small className="text-muted">
                                        User ID: {selectedReview.user_id}
                                    </small>
                                </div>
                            </div>
                            <div className="text-end">
                                <small className="text-muted d-block">
                                    <Calendar size={14} className="me-1" />
                                    {formatDate(selectedReview.created_at)}
                                </small>
                                {selectedReview.updated_at && (
                                    <small className="text-muted d-block">
                                        Updated: {formatDate(selectedReview.updated_at)}
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Package size={18} className="text-muted" />
                                <strong>Product:</strong>
                                <span>{selectedReview.product_name || `Variant ID: ${selectedReview.variant_id}`}</span>
                            </div>
                        </div>

                        <div className="mb-3">
                            <strong>Rating:</strong>
                            <div className="mt-1">
                                {renderStars(selectedReview.rating || 0)}
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0">Review Content</h6>
                    </Card.Header>
                    <Card.Body>
                        {selectedReview.title && (
                            <div className="mb-3">
                                <strong>Title:</strong>
                                <div className="mt-1 fs-5">{selectedReview.title}</div>
                            </div>
                        )}

                        <div className="mb-3">
                            <strong>Review:</strong>
                            <div className="mt-2 p-3 bg-light rounded">
                                {selectedReview.body || 'No review text provided.'}
                            </div>
                        </div>

                        {selectedReview.images && (
                            <div className="mt-3">
                                <strong>Images:</strong>
                                <div className="mt-2">
                                    <small>
                                        Images attached: {selectedReview.images}
                                    </small>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">
                            <MessageSquare size={18} className="me-2" />
                            Replies ({selectedReview.replies?.length || 0})
                        </h6>
                    </Card.Header>
                    <Card.Body>
                        {selectedReview.replies && selectedReview.replies.length > 0 ? (
                            <ListGroup variant="flush">
                                {selectedReview.replies.map((reply) => (
                                    <ListGroup.Item key={reply.reply_id} className="border-0 px-0 py-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className={`rounded-circle p-1 ${reply.user_id === 1 ? 'bg-primary text-white' : 'bg-light'}`}>
                                                    <User size={14} />
                                                </div>
                                                <strong>{reply.user_name || (reply.user_id === 1 ? 'Admin' : 'Customer')}</strong>
                                                <Badge bg={reply.user_id === 1 ? 'primary' : 'secondary'} className="ms-2">
                                                    {reply.user_id === 1 ? 'Admin' : 'Customer'}
                                                </Badge>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <small className="text-muted">
                                                    {formatDate(reply.created_at)}
                                                </small>
                                                {reply.user_id === 1 && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteReply(reply.reply_id)}
                                                        disabled={loading}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ps-4">
                                            <div className="p-3 bg-light rounded">
                                                {reply.body}
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <Alert variant="light" className="mb-0">
                                No replies yet. You can add the first reply below.
                            </Alert>
                        )}
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0">Add Admin Reply</h6>
                    </Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleReplySubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Your Reply</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply to the customer here..."
                                    disabled={loading || isSubmitting}
                                />
                                <Form.Text className="text-muted">
                                    Your reply will be visible to the customer and marked as from Admin.
                                </Form.Text>
                            </Form.Group>
                            <div className="d-flex justify-content-between">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={!replyText.trim() || loading || isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Reply'}
                                </Button>
                                
                                <Button
                                    variant="outline-danger"
                                    onClick={handleDeleteReview}
                                    disabled={loading || isDeletingReview}
                                >
                                    {isDeletingReview ? 'Deleting...' : 'Delete Review'}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Modal.Body>

            <Modal.Footer className="border-top-0">
                <div className="d-flex justify-content-between w-100">
                    <div className="d-flex gap-2">
                        <Button
                            variant={selectedReview.status === 'approved' ? 'success' : 'outline-success'}
                            onClick={() => handleStatusUpdate('approved')}
                            disabled={loading || selectedReview.status === 'approved'}
                            className="d-flex align-items-center gap-1"
                        >
                            <CheckCircle size={16} />
                            Approve
                        </Button>
                        <Button
                            variant={selectedReview.status === 'rejected' ? 'danger' : 'outline-danger'}
                            onClick={() => handleStatusUpdate('rejected')}
                            disabled={loading || selectedReview.status === 'rejected'}
                            className="d-flex align-items-center gap-1"
                        >
                            <XCircle size={16} />
                            Reject
                        </Button>
                        <Button
                            variant={selectedReview.status === 'pending' ? 'warning' : 'outline-warning'}
                            onClick={() => handleStatusUpdate('pending')}
                            disabled={loading || selectedReview.status === 'pending'}
                            className="d-flex align-items-center gap-1"
                        >
                            <Clock size={16} />
                            Mark Pending
                        </Button>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={clearSelectedReview}
                        disabled={loading}
                    >
                        Close
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ReviewDetailModal;
