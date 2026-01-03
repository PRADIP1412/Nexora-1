import React, { createContext, useState, useContext, useCallback } from "react";
import * as reviewApi from "../api/product_review";

const ProductReviewContext = createContext();

export const useProductReviews = () => {
    const context = useContext(ProductReviewContext);
    if (!context) {
        throw new Error("useProductReviews must be used within a ProductReviewProvider");
    }
    return context;
};

export const ProductReviewProvider = ({ children }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);

    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0,
    });

    /* ==========================================================
       ADMIN: Fetch all reviews (REAL API)
    ========================================================== */
    const fetchAllReviews = useCallback(
        async (page = 1, perPage = 20) => {
            setLoading(true);
            setError(null);
            try {
                const result = await reviewApi.fetchAllReviews(page, perPage);

                if (result.success) {
                    setReviews(result.data.items);
                    setPagination({
                        page: result.data.page,
                        per_page: result.data.per_page,
                        total: result.data.total,
                        total_pages: result.data.total_pages,
                    });
                    return result;
                } else {
                    setError(result.message);
                    return { success: false, message: result.message };
                }
            } catch (err) {
                const msg = err.response?.data?.detail || err.message || "Failed to fetch admin reviews";
                setError(msg);
                return { success: false, message: msg };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /* ==========================================================
       ADMIN: Update Review Status (approve/reject)
    ========================================================== */
    const updateReviewStatus = async (reviewId, status) => {
        setLoading(true);
        setError(null);
        try {
            const result = await reviewApi.updateReviewStatus(reviewId, status);

            if (result.success) {
                // Update local state
                setReviews(prev =>
                    prev.map(r =>
                        r.review_id === reviewId
                            ? { ...r, status: status }
                            : r
                    )
                );

                // Update selected review if open
                if (selectedReview?.review_id === reviewId) {
                    setSelectedReview(prev => ({ ...prev, status }));
                }

                return result;
            } else {
                setError(result.message);
                return { success: false, message: result.message };
            }
        } catch (err) {
            const msg = err.response?.data?.detail || "Failed to update review status";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    /* ==========================================================
       ADMIN: Add Reply to Review
    ========================================================== */
    const addAdminReply = async (reviewId, replyData) => {
        setLoading(true);
        setError(null);
        try {
            const result = await reviewApi.addAdminReply(reviewId, replyData);

            if (result.success) {
                // Update reviews list
                setReviews(prev =>
                    prev.map(r =>
                        r.review_id === reviewId
                            ? { ...r, replies: [...(r.replies || []), result.data] }
                            : r
                    )
                );

                // Update selected review
                if (selectedReview?.review_id === reviewId) {
                    setSelectedReview(prev => ({
                        ...prev,
                        replies: [...(prev.replies || []), result.data],
                    }));
                }

                return result;
            } else {
                setError(result.message);
                return { success: false, message: result.message };
            }
        } catch (err) {
            const msg = err.response?.data?.detail || "Failed to add reply";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    /* ==========================================================
       ADMIN: Delete a Reply
    ========================================================== */
    const deleteReply = async (replyId, reviewId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await reviewApi.deleteReply(replyId);

            if (result.success) {
                // Update list
                setReviews(prev =>
                    prev.map(r =>
                        r.review_id === reviewId
                            ? {
                                  ...r,
                                  replies: r.replies?.filter(rep => rep.reply_id !== replyId),
                              }
                            : r
                    )
                );

                // Update selected review
                if (selectedReview?.review_id === reviewId) {
                    setSelectedReview(prev => ({
                        ...prev,
                        replies: prev.replies?.filter(rep => rep.reply_id !== replyId),
                    }));
                }

                return result;
            } else {
                setError(result.message);
                return { success: false, message: result.message };
            }
        } catch (err) {
            const msg = err.response?.data?.detail || "Failed to delete reply";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    /* ==========================================================
       ADMIN: Hard Delete Review
    ========================================================== */
    const adminDeleteReview = async (reviewId) => {
        setLoading(true);
        setError(null);

        try {
            const result = await reviewApi.adminDeleteReview(reviewId);

            if (result.success) {
                // Remove from UI list
                setReviews(prev => prev.filter(r => r.review_id !== reviewId));

                // Remove selected review
                if (selectedReview?.review_id === reviewId) {
                    setSelectedReview(null);
                }

                return result;
            } else {
                setError(result.message);
                return { success: false, message: result.message };
            }
        } catch (err) {
            const msg = err.response?.data?.detail || "Failed to delete review";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    /* ==========================================================
       SELECT / CLEAR REVIEW
    ========================================================== */
    const selectReview = review => setSelectedReview(review);

    const clearSelectedReview = () => setSelectedReview(null);

    const clearError = () => setError(null);

    /* ==========================================================
       PROVIDER VALUE
    ========================================================== */
    const value = {
        reviews,
        loading,
        error,
        selectedReview,
        pagination,

        fetchAllReviews,
        updateReviewStatus,
        addAdminReply,
        deleteReply,
        adminDeleteReview,

        selectReview,
        clearSelectedReview,
        clearError,
    };

    return (
        <ProductReviewContext.Provider value={value}>
            {children}
        </ProductReviewContext.Provider>
    );
};
