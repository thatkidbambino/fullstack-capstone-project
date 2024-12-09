import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DetailsPage.css';

function DetailsPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [gift, setGift] = useState(null);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState('');

    // Task 1: Check for authentication
    useEffect(() => {
        if (!sessionStorage.getItem('authToken')) {
            navigate('/app/login');
        }
    }, [navigate]);

    // Task 2: Fetch gift details
    useEffect(() => {
        const fetchGiftDetails = async () => {
            try {
                const response = await fetch(`/api/gifts/${productId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch gift details.');
                }
                const data = await response.json();
                setGift(data);
                setComments(data.comments || []);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchGiftDetails();
    }, [productId]);

    // Task 3: Scroll to the top on component mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Task 4: Handle Back Click
    const handleBackClick = () => {
        navigate(-1);
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!gift) {
        return <div className="loading-message">Loading gift details...</div>;
    }

    return (
        <div className="details-container">
            <button className="btn btn-secondary mb-3" onClick={handleBackClick}>
                Back
            </button>
            <h1 className="gift-name">{gift.name}</h1>

            {/* Task 5: Display Gift Image */}
            {gift.image ? (
                <img src={gift.image} alt={gift.name} className="product-image-large" />
            ) : (
                <div className="placeholder-image">No Image Available</div>
            )}

            {/* Task 6: Display Gift Details */}
            <div className="gift-details">
                <p><strong>Category:</strong> {gift.category}</p>
                <p><strong>Condition:</strong> {gift.condition}</p>
                <p><strong>Date Added:</strong> {new Date(gift.date_added).toLocaleDateString()}</p>
                <p><strong>Age:</strong> {gift.age_years} years</p>
                <p><strong>Description:</strong> {gift.description}</p>
            </div>

            {/* Task 7: Render Comments Section */}
            <div className="comments-section">
                <h2>Comments</h2>
                {comments.length > 0 ? (
                    comments.map((comment, index) => (
                        <div key={index} className="comment">
                            <p><strong>{comment.user}:</strong> {comment.text}</p>
                        </div>
                    ))
                ) : (
                    <p>No comments available for this gift.</p>
                )}
            </div>
        </div>
    );
}

export default DetailsPage;
