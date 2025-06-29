import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Button, Form, FormGroup, Label, Input, Card, CardBody,
  Modal, ModalHeader, ModalBody, Spinner
} from 'reactstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaPaperPlane } from 'react-icons/fa';
import io from 'socket.io-client';
import AppNavbar from '../Components/Navbar';
import PostCard from '../Components/PostCard';
import './styles.css';

const socket = io('http://localhost:4000', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [newPost, setNewPost] = useState({ description: '', file: null });
  const [postActionLoading, setPostActionLoading] = useState(false);
  const [postDeleteLoading, setPostDeleteLoading] = useState({});
  const [postLikeLoading, setPostLikeLoading] = useState({});
  const [error, setError] = useState(null);

  // Comment modal uchun
  const [commentModal, setCommentModal] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentError, setCommentError] = useState(null);

  // Comment loaderlar
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentDeleteLoading, setCommentDeleteLoading] = useState({});
  const [commentUpdateLoading, setCommentUpdateLoading] = useState({});

  const navigate = useNavigate();
  const API_URL = 'http://localhost:4000/api/post';

  // User info
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token.trim() === '') {
      navigate('/auth', { replace: true });
      return;
    }

    const fetchMyPosts = async () => {
      try {
        setPostsLoading(true);
        const endpoint = `${API_URL}/my-posts/${userId}`;
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data || []);
        setPostsLoading(false);
      } catch (err) {
        setPostsLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/auth', { replace: true });
        } else if (err.response?.status === 404) {
          setPosts([]);
          setError('Posts not found');
        } else {
          setError(err.response?.data?.message || 'Error in uploading posts');
        }
      }
    };
    fetchMyPosts();

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
      setActiveCommentPost((prev) =>
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

    return () => {
      socket.off('newComment');
    };
    // eslint-disable-next-line
  }, [navigate]);

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      setNewPost({ description: '', file: null });
      setEditMode(false);
      setEditingPostId(null);
      setError(null);
    }
  };

  // Comment modalni boshqarish
  const openCommentModal = (post) => {
    setActiveCommentPost(post);
    setCommentModal(true);
    setCommentText('');
    setEditingCommentId(null);
    setEditingCommentText('');
    setCommentError(null);
  };
  const closeCommentModal = () => {
    setActiveCommentPost(null);
    setCommentModal(false);
    setCommentText('');
    setEditingCommentId(null);
    setEditingCommentText('');
    setCommentError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewPost({ ...newPost, file });
  };

  const handleCreatePost = async () => {
    if (!newPost.description.trim()) {
      setError('The post text should not be empty!');
      return;
    }

    const formData = new FormData();
    formData.append('content', newPost.description);
    if (newPost.file) {
      formData.append('postImage', newPost.file);
    }

    try {
      setPostActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setPosts([response.data.post, ...posts]);
      toggleModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    } finally {
      setPostActionLoading(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!newPost.description.trim()) {
      setError('The post text should not be empty!');
      return;
    }

    const formData = new FormData();
    formData.append('content', newPost.description);
    if (newPost.file) {
      formData.append('postImage', newPost.file);
    }

    try {
      setPostActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/${editingPostId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setPosts(posts.map((post) => (post._id === editingPostId ? response.data.post : post)));
      toggleModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Error in updating the post');
    } finally {
      setPostActionLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Bu postni o‘chirishni xohlaysizmi?')) {
      try {
        setPostDeleteLoading((prev) => ({ ...prev, [postId]: true }));
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(posts.filter((post) => post._id !== postId));
      } catch (err) {
        setError(err.response?.data?.message || 'Post o‘chirishda xatolik');
      } finally {
        setPostDeleteLoading((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleLike = async (postId) => {
    try {
      setPostLikeLoading((prev) => ({ ...prev, [postId]: true }));
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/like/${postId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.map((post) => (post._id === postId ? response.data.post : post)));
      const post = response.data.post;
      if (post.userId?._id && userId !== post.userId._id) {
        socket.emit('newNotification', {
          receiverId: post.userId._id,
          senderId: userId,
          type: 'like',
          message: `${username || 'User'} sizning postingizga like bosdi: "${post.content.substring(0, 20)}..."`,
          postId: postId,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Like qo‘yishda xatolik');
    } finally {
      setPostLikeLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Comment create
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setCommentError('Komment bo‘sh bo‘lmasligi kerak!');
      return;
    }
    try {
      setCommentLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4000/api/comment',
        { postId: activeCommentPost._id, text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      setCommentError(null);

      const post = posts.find((p) => p._id === activeCommentPost._id);
      if (post && post.userId?._id && userId !== post.userId._id) {
        socket.emit('newNotification', {
          receiverId: post.userId._id,
          senderId: userId,
          type: 'comment',
          message: `${username || 'User'} sizning postingizga komment yozdi: "${post.content.substring(0, 20)}..."`,
          postId: activeCommentPost._id,
        });
      }
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Komment yozishda xatolik');
    } finally {
      setCommentLoading(false);
    }
  };

  // Comment delete
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Kommentni o‘chirishni xohlaysizmi?")) return;
    try {
      setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: true }));
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === activeCommentPost._id
            ? {
                ...post,
                comments: post.comments
                  ? post.comments.filter((c) => c._id !== commentId)
                  : [],
              }
            : post
        )
      );
      setActiveCommentPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments
                ? prev.comments.filter((c) => c._id !== commentId)
                : [],
            }
          : prev
      );
    } catch (err) {
      setCommentError('Komment o‘chirishda xatolik');
    } finally {
      setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Comment update
  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.text);
  };
  const handleUpdateComment = async () => {
    if (!editingCommentText.trim()) {
      setCommentError('Komment bo‘sh bo‘lmasligi kerak!');
      return;
    }
    try {
      setCommentUpdateLoading((prev) => ({ ...prev, [editingCommentId]: true }));
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:4000/api/comment/${editingCommentId}`,
        { text: editingCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === activeCommentPost._id
            ? {
                ...post,
                comments: post.comments
                  ? post.comments.map((c) =>
                      c._id === editingCommentId ? { ...c, text: response.data.text } : c
                    )
                  : [],
              }
            : post
        )
      );
      setActiveCommentPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments
                ? prev.comments.map((c) =>
                    c._id === editingCommentId ? { ...c, text: response.data.text } : c
                  )
                : [],
            }
          : prev
      );
      setEditingCommentId(null);
      setEditingCommentText('');
      setCommentError(null);
    } catch (err) {
      setCommentError('Komment tahrirlashda xatolik');
    } finally {
      setCommentUpdateLoading((prev) => ({ ...prev, [editingCommentId]: false }));
    }
  };

  const openEditModal = (post) => {
    setEditMode(true);
    setEditingPostId(post._id);
    setNewPost({ description: post.content, file: null });
    setModal(true);
    setError(null);
  };

  return (
    <>
      <AppNavbar />
<div className="text-center mt-5">
  {error && <div className="alert alert-danger">{error}</div>}
  
  <button
    onClick={toggleModal}
    style={{
      backgroundColor: 'rgb(170 91 172)',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      cursor: 'pointer'
    }}
  >
    + Yangi Post Qo‘shish
  </button>
</div>


      <div className="post-grid mt-4">
        {postsLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
            <Spinner color="primary" style={{ width: 60, height: 60 }} />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center">Hozircha postlar yo‘q</p>
        ) : (
          posts.map((post) => {
            const isLiked = Array.isArray(post.likes) && post.likes.includes(userId);
            return (
              <PostCard
                key={post._id}
                post={post}
                onLike={() => handleLike(post._id)}
                onComment={() => openCommentModal(post)}
                onEdit={() => openEditModal(post)}
                onDelete={() => handleDeletePost(post._id)}
                likeLoading={!!postLikeLoading[post._id]}
                deleteLoading={!!postDeleteLoading[post._id]}
                isLiked={isLiked}
              />
            );
          })
        )}
      </div>

      {/* Post create/edit modal */}
      <Modal className='modal-content-1' isOpen={modal} toggle={toggleModal} size="lg" centered>
        <Card className="shadow">
          <CardBody>
            <div className="modal-header">
              <h5 className="modal-title">{editMode ? 'Postni Tahrirlash' : 'Yangi Post Yaratish'}</h5>
              <Button className="close" onClick={toggleModal}>×</Button>
            </div>
            <div className="modal-body">
              <Form>
                <FormGroup>
                  <Label for="description">Matn</Label>
                  <Input
                    type="textarea"
                    id="description"
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    placeholder="Postingizni shu yerga yozing..."
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="file">Rasm Yuklash</Label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    id="file"
                    onChange={handleFileChange}
                  />
                </FormGroup>
                {newPost.file && (
                  <div className="text-center mb-3">
                    <h6>Rasm Oldindan Ko‘rish:</h6>
                    <img
                      src={URL.createObjectURL(newPost.file)}
                      alt="preview"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
                <Button
                  color="dark"
                  onClick={editMode ? handleUpdatePost : handleCreatePost}
                  block
                  disabled={postActionLoading}
                >
                  {postActionLoading ? (
                    <>
                      <Spinner size="sm" color="light" /> {editMode ? 'Yangilash...' : 'Yaratish...'}
                    </>
                  ) : (
                    editMode ? 'Yangilash' : 'Yaratish'
                  )}
                </Button>
              </Form>
            </div>
          </CardBody>
        </Card>
      </Modal>

      {/* Comment modal - loaderli */}
      <Modal isOpen={commentModal} toggle={closeCommentModal} size="md" centered className="comment-modal">
        <ModalHeader toggle={closeCommentModal}>Kommentlar</ModalHeader>
        <ModalBody>
          {activeCommentPost && (
            <>
              <div className="comment-list">
                {activeCommentPost.comments && activeCommentPost.comments.length > 0 ? (
                  activeCommentPost.comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <div className="comment-top">
                        <div>
                          <span className="comment-username">{comment.userId?.username || "Anonim"}:</span>
                          {editingCommentId === comment._id ? (
                            <input
                              className="comment-input"
                              value={editingCommentText}
                              onChange={e => setEditingCommentText(e.target.value)}
                              disabled={!!commentUpdateLoading[comment._id]}
                            />
                          ) : (
                            <span className="comment-text">{comment.text}</span>
                          )}
                        </div>
                        {comment.userId?._id === userId && (
                          <>
                            {editingCommentId === comment._id ? (
                              <div className="comment-actions comment-actions-below">
                                <button
                                  className="comment-action-btn edit"
                                  onClick={handleUpdateComment}
                                  disabled={!!commentUpdateLoading[comment._id]}
                                  title="Saqlash"
                                >
                                  {commentUpdateLoading[comment._id] ? (
                                    <Spinner size="sm" color="light" />
                                  ) : (
                                    <FaCheck />
                                  )}
                                </button>
                                <button
                                  className="comment-action-btn delete"
                                  onClick={() => setEditingCommentId(null)}
                                  disabled={!!commentUpdateLoading[comment._id]}
                                  title="Bekor qilish"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ) : (
                              <div className="comment-actions">
                                <button
                                  className="comment-action-btn edit"
                                  onClick={() => handleEditComment(comment)}
                                  disabled={!!commentUpdateLoading[comment._id]}
                                  title="Tahrirlash"
                                >
                                  {commentUpdateLoading[comment._id] ? (
                                    <Spinner size="sm" color="light" />
                                  ) : (
                                    <FaEdit />
                                  )}
                                </button>
                                <button
                                  className="comment-action-btn delete"
                                  onClick={() => handleDeleteComment(comment._id)}
                                  disabled={!!commentDeleteLoading[comment._id]}
                                  title="O‘chirish"
                                >
                                  {commentDeleteLoading[comment._id] ? (
                                    <Spinner size="sm" color="light" />
                                  ) : (
                                    <FaTrash />
                                  )}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="comment-meta">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", color: "#9ea5b5", fontSize: 16 }}>
                    Kommentlar yo‘q
                  </div>
                )}
              </div>
              <Form className="comment-modal-footer" onSubmit={handleCommentSubmit}>
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Komment yozing..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  disabled={commentLoading}
                />
                <button
                  className="comment-send-btn"
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  title="Yuborish"
                >
                  {commentLoading ? <Spinner size="sm" color="light" /> : <FaPaperPlane />}
                </button>
              </Form>
              {commentError && <div className="text-danger mt-2">{commentError}</div>}
            </>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default Post;