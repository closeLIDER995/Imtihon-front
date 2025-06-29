import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import AppNavbar from '../Components/Navbar';
import PostHomeCard from '../Components/PostHomeCard';
import CommentModal from './CommentModal';
import './styles.css';

const socket = io('http://localhost:4000', { reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 1000 });
const API_URL = 'http://localhost:4000/api/post';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comment modal states:
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentError, setCommentError] = useState(null);

  // Loaderlar
  const [likeLoadingMap, setLikeLoadingMap] = useState({});
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentDeleteLoading, setCommentDeleteLoading] = useState({});
  const [commentUpdateLoading, setCommentUpdateLoading] = useState({});

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
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
        const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
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
      setPosts((prev) =>
        prev.map((post) =>
          post._id === comment.postId
            ? {
                ...post,
                comments: post.comments?.some((c) => c._id === comment._id)
                  ? post.comments
                  : [...(post.comments || []), comment]
              }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev && prev._id === comment.postId
          ? {
              ...prev,
              comments: prev.comments?.some((c) => c._id === comment._id)
                ? prev.comments
                : [...(prev.comments || []), comment]
            }
          : prev
      );
    });

    socket.on('deletedComment', ({ postId, commentId }) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, comments: post.comments?.filter((c) => c._id !== commentId) }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev && prev._id === postId
          ? { ...prev, comments: prev.comments?.filter((c) => c._id !== commentId) }
          : prev
      );
    });

    socket.on('updatedComment', (comment) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === comment.postId
            ? {
                ...post,
                comments: post.comments?.map((c) =>
                  c._id === comment._id ? { ...c, text: comment.text } : c
                )
              }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev && prev._id === comment.postId
          ? {
              ...prev,
              comments: prev.comments?.map((c) =>
                c._id === comment._id ? { ...c, text: comment.text } : c
              )
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

  // Like
  const handleLike = async (postId) => {
    const token = localStorage.getItem('token');
    setLikeLoadingMap((prev) => ({ ...prev, [postId]: true }));
    try {
      const response = await axios.put(
        `${API_URL}/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? response.data.post : post)));
      setSelectedPost((prev) =>
        prev && prev._id === postId ? response.data.post : prev
      );
    } catch (err) {
      setError(err.message || 'Error in laying down the like');
    } finally {
      setLikeLoadingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // --- COMMENT ACTIONS ---
  const openCommentModal = (post) => {
    setSelectedPost(post);
    setCommentModalOpen(true);
    setCommentText('');
    setEditingCommentId(null);
    setEditingCommentText('');
    setCommentError(null);
  };
  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedPost(null);
    setCommentText('');
    setEditingCommentId(null);
    setEditingCommentText('');
    setCommentError(null);
  };

  // CREATE COMMENT
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setCommentError('Komment bo‘sh bo‘lmasligi kerak!');
      return;
    }
    setCommentLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4000/api/comment',
        { postId: selectedPost._id, text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      setCommentError(null);
      const post = posts.find((p) => p._id === selectedPost._id);
      if (post && post.userId?._id && userId !== post.userId._id) {
        socket.emit('newNotification', {
          receiverId: post.userId._id,
          senderId: userId,
          type: 'comment',
          message: `${username || 'User'} he/she commented on your post: "${post.content.substring(0, 20)}..."`,
          postId: selectedPost._id,
        });
      }
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Error in writing a comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // DELETE COMMENT (Optimistic Update)
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Kommentni o‘chirishni xohlaysizmi?")) return;
    setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) =>
        prev.map((post) =>
          post._id === selectedPost._id
            ? { ...post, comments: post.comments?.filter((c) => c._id !== commentId) }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev
          ? { ...prev, comments: prev.comments?.filter((c) => c._id !== commentId) }
          : prev
      );

      setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: false }));
      socket.emit('deleteComment', { postId: selectedPost._id, commentId });
    } catch (err) {
      setCommentError('Error deleting the comment');
      setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // EDIT COMMENT (Optimistic Update)
  const handleUpdateComment = async () => {
    if (!editingCommentText.trim()) {
      setCommentError('The comment must not be empty!');
      return;
    }
    setCommentUpdateLoading((prev) => ({ ...prev, [editingCommentId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:4000/api/comment/${editingCommentId}`,
        { text: editingCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post._id === selectedPost._id
            ? {
                ...post,
                comments: post.comments?.map((c) =>
                  c._id === editingCommentId ? { ...c, text: editingCommentText } : c
                )
              }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments?.map((c) =>
                c._id === editingCommentId ? { ...c, text: editingCommentText } : c
              )
            }
          : prev
      );

      setCommentUpdateLoading((prev) => ({ ...prev, [editingCommentId]: false }));
      setEditingCommentId(null);
      setEditingCommentText('');
      setCommentError(null);
      socket.emit('updateComment', {
        postId: selectedPost._id,
        commentId: editingCommentId,
        text: editingCommentText
      });
    } catch (err) {
      setCommentError('Comment edit Error');
      setCommentUpdateLoading((prev) => ({ ...prev, [editingCommentId]: false }));
    }
  };

  return (
    <>
      <AppNavbar />
      <div className="container mt-5">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="post-grid">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 300, justifyContent: 'center' }}>
              <Spinner color="primary" style={{ width: 64, height: 64, fontSize: 36 }} />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 300, justifyContent: 'center' }}>
              <div style={{ marginTop: 24, fontSize: 24, fontWeight: 500 }}>No Posts</div>
            </div>
          ) : (
            [...posts]
              .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
              .map((post) => {
                const isLiked = Array.isArray(post.likes) && post.likes.includes(userId);
                return (
                  <PostHomeCard
                    key={post._id}
                    post={post}
                    onLike={() => handleLike(post._id)}
                    onComment={() => openCommentModal(post)}
                    likeLoading={!!likeLoadingMap[post._id]}
                    isLiked={isLiked}
                  />
                );
              })
          )}
        </div>
        {selectedPost && (
          <CommentModal
            isOpen={commentModalOpen}
            toggle={closeCommentModal}
            post={selectedPost}
            commentText={commentText}
            setCommentText={setCommentText}
            editingCommentId={editingCommentId}
            setEditingCommentId={setEditingCommentId}
            editingCommentText={editingCommentText}
            setEditingCommentText={setEditingCommentText}
            commentLoading={commentLoading}
            commentDeleteLoading={commentDeleteLoading}
            commentUpdateLoading={commentUpdateLoading}
            commentError={commentError}
            onCommentSubmit={handleCommentSubmit}
            onCommentDelete={handleDeleteComment}
            onCommentUpdate={handleUpdateComment}
            userId={userId}
          />
        )}
      </div>
    </>
  );
};

export default Feed;