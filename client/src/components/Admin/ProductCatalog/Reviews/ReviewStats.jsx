import React from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { Star, CheckCircle, XCircle, Clock, MessageSquare, Users } from 'lucide-react';
import './ReviewStats.css';

const ReviewStats = ({ stats, loading }) => {
    const statCards = [
        {
            title: 'Total Reviews',
            value: stats.total,
            icon: <Users size={24} />,
            color: 'primary',
            bg: 'bg-primary-light',
            description: 'All customer reviews'
        },
        {
            title: 'Pending',
            value: stats.pending,
            icon: <Clock size={24} />,
            color: 'warning',
            bg: 'bg-warning-light',
            description: 'Awaiting moderation'
        },
        {
            title: 'Approved',
            value: stats.approved,
            icon: <CheckCircle size={24} />,
            color: 'success',
            bg: 'bg-success-light',
            description: 'Published reviews'
        },
        {
            title: 'Rejected',
            value: stats.rejected,
            icon: <XCircle size={24} />,
            color: 'danger',
            bg: 'bg-danger-light',
            description: 'Not approved'
        },
        {
            title: 'With Replies',
            value: stats.withReplies,
            icon: <MessageSquare size={24} />,
            color: 'info',
            bg: 'bg-info-light',
            description: 'Has admin/customer replies'
        },
        {
            title: 'Avg Rating',
            value: stats.averageRating,
            icon: <Star size={24} />,
            color: 'warning',
            bg: 'bg-warning-light',
            description: 'Average star rating'
        }
    ];

    if (loading && stats.total === 0) {
        return (
            <Row>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Col key={i} md={4} lg={2} className="mb-3">
                        <Card>
                            <Card.Body className="text-center py-4">
                                <Spinner animation="border" size="sm" />
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }

    return (
        <Row>
            {statCards.map((stat, index) => (
                <Col key={index} md={4} lg={2} className="mb-3">
                    <Card className={`border-${stat.color} ${stat.bg}`}>
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 className="text-muted mb-1 small">{stat.title}</h6>
                                    <h3 className="mb-0">{stat.value}</h3>
                                </div>
                                <div className={`text-${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="small text-muted">
                                {stat.description}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default ReviewStats;
