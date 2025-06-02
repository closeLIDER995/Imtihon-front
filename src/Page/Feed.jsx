import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody } from 'reactstrap';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import io from 'socket.io-client';
import AppNavbar from '../Components/Navbar';
import CommentModal from './CommentModal';
import { getAllPosts, likePost } from '../api/postReq';
import axios from 'axios';

const socket = io('http://localhost:4000', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token.trim() === '') {
      navigate('/auth', { replace: true });
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getAllPosts(token);
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Postlarni yuklashda xatolik');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/auth', { replace: true });
        }
      }
    };
    fetchPosts();

    socket.on('newComment', (comment) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === comment.postId
            ? {
                ...post,
                comments: post.comments
                  ? post.comments.some((c) => c._id === comment._id)
                    ? post.comments
                    : [...post.comments, comment]
                  : [comment],
              }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev && prev._id === comment.postId
          ? {
              ...prev,
              comments: prev.comments
                ? prev.comments.some((c) => c._id === comment._id)
                  ? prev.comments
                  : [...prev.comments, comment]
                : [comment],
            }
          : prev
      );
    });

    socket.on('deletedComment', ({ postId, commentId }) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments
                  ? post.comments.filter((c) => c._id !== commentId)
                  : [],
              }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev && prev._id === postId
          ? {
              ...prev,
              comments: prev.comments
                ? prev.comments.filter((c) => c._id !== commentId)
                : [],
            }
          : prev
      );
    });

    socket.on('updatedComment', (comment) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === comment.postId
            ? {
                ...post,
                comments: post.comments
                  ? post.comments.map((c) =>
                      c._id === comment._id ? { ...c, text: comment.text } : c
                    )
                  : [],
              }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev && prev._id === comment.postId
          ? {
              ...prev,
              comments: prev.comments
                ? prev.comments.map((c) =>
                    c._id === comment._id ? { ...c, text: comment.text } : c
                  )
                : [],
            }
          : prev
      );
    });

    return () => {
      socket.off('newComment');
      socket.off('deletedComment');
      socket.off('updatedComment');
    };
  }, [navigate]);

  const handleLike = async (postId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await likePost(postId, token);
      setPosts(posts.map((post) => (post._id === postId ? response.data.post : post)));
    } catch (err) {
      setError(err.message || 'Like qo‘yishda xatolik');
    }
  };

  const handleCommentSubmit = async (postId, commentText) => {
    const token = localStorage.getItem('token');
    await axios.post(
      'http://localhost:4000/api/comment',
      { postId, text: commentText },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleDeleteComment = async (postId, commentId) => {
    const token = localStorage.getItem('token');
    await axios.delete(
      `http://localhost:4000/api/comment/${commentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    socket.emit('deleteComment', { postId, commentId });
  };

  const handleUpdateComment = async (postId, commentId, newText) => {
    const token = localStorage.getItem('token');
    await axios.put(
      `http://localhost:4000/api/comment/${commentId}`,
      { text: newText },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    socket.emit('updateComment', { postId, commentId, text: newText });
  };

  const openCommentModal = (post) => {
    setSelectedPost(post);
    setCommentModalOpen(true);
  };
  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedPost(null);
  };

  const selectedPostData =
    selectedPost && posts.find((p) => p._id === selectedPost._id)
      ? posts.find((p) => p._id === selectedPost._id)
      : selectedPost;

  return (
    <>
      <AppNavbar />
      <div className="container mt-5">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="post-grid">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 300, justifyContent: 'center' }}>
              <div className="spinner-border" style={{ width: 64, height: 64, fontSize: 36 }} role="status">
                <span className="sr-only"></span>
              </div>
              <div style={{ marginTop: 24, fontSize: 24, fontWeight: 500 }}></div>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 300, justifyContent: 'center' }}>
              <div className="spinner-border" style={{ width: 64, height: 64, fontSize: 36 }} role="status">
                <span className="sr-only">Y</span>
              </div>
              <div style={{ marginTop: 24, fontSize: 24, fontWeight: 500 }}></div>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post._id} className="post-card">
                <CardBody>
                  <h5>{post.userId.username}</h5>
                  <p>{post.content}</p>
                  {post.postImage && post.postImage.url && (
                    <img src={post.postImage.url} alt="Post" className="post-image" />
                  )}
                  <div className="d-flex justify-content-between">
                    <Button color="link" onClick={() => handleLike(post._id)}>
                      <FaThumbsUp /> ({post.likes?.length || 0})
                    </Button>
                    <Button color="link" onClick={() => openCommentModal(post)}>
                      <FaComment /> ({post.comments?.length || 0})
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
        {selectedPost && (
          <CommentModal
            isOpen={commentModalOpen}
            toggle={closeCommentModal}
            post={selectedPostData}
            onCommentSubmit={handleCommentSubmit}
            onCommentDelete={handleDeleteComment}
            onCommentUpdate={handleUpdateComment}
          />
        )}
      </div>
    </>
  );
};

export default Feed;