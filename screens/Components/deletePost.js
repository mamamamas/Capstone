import React, { useState } from 'react';
import axios from 'axios';

const DeletePost = ({ postId, onDeleteSuccess }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(`/posts/delete/${postId}`);
            if (response.status === 200) {
                onDeleteSuccess();
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <button onClick={handleDelete}>Delete Post</button>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default DeletePost;