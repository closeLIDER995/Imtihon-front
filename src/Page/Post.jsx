import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, Card, CardBody, Modal, ModalHeader, ModalBody } from 'reactstrap';
import io from 'socket.io-client';
import AppNavbar from '../Components/Navbar';
import PostCard from '../Components/PostCard';

const socket = io('http://localhost:4000', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [modal, setModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [newPost, setNewPost] = useState({ description: '', file: null });
  const [error, setError] = useState(null);

  // Comment modal uchun
  const [commentModal, setCommentModal] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentError, setCommentError] = useState(null);

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
        const endpoint = `${API_URL}/my-posts/${userId}`;
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/auth', { replace: true });
        } else if (err.response?.status === 404) {
          setPosts([]);
          setError('Postlar topilmadi');
        } else {
          setError(err.response?.data?.message || 'Postlarni yuklashda xatolik');
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
      // Agar modal ochiq va shu postga comment bo'lsa, activeCommentPost-ni ham yangilaymiz
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
      setError('Post matni bo‘sh bo‘lmasligi kerak!');
      return;
    }

    const formData = new FormData();
    formData.append('content', newPost.description);
    if (newPost.file) {
      formData.append('postImage', newPost.file);
    }

    try {
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
      setError(err.response?.data?.message || 'Post yaratishda xatolik');
    }
  };

  const handleUpdatePost = async () => {
    if (!newPost.description.trim()) {
      setError('Post matni bo‘sh bo‘lmasligi kerak!');
      return;
    }

    const formData = new FormData();
    formData.append('content', newPost.description);
    if (newPost.file) {
      formData.append('postImage', newPost.file);
    }

    try {
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
      setError(err.response?.data?.message || 'Post yangilashda xatolik');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Bu postni o‘chirishni xohlaysizmi?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(posts.filter((post) => post._id !== postId));
      } catch (err) {
        setError(err.response?.data?.message || 'Post o‘chirishda xatolik');
      }
    }
  };

  const handleLike = async (postId) => {
    try {
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
    }
  };

  // Comment create
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      setCommentError('Komment bo‘sh bo‘lmasligi kerak!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4000/api/comment',
        { postId: activeCommentPost._id, text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // posts va activeCommentPost-ni yangilamaysiz!
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
    }
  };

  // Comment delete
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Kommentni o‘chirishni xohlaysizmi?")) return;
    try {
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
    }
  };

  const openEditModal = (post) => {
    setEditMode(true);
    setEditingPostId(post._id);
    setNewPost({ description: post.content, file: null });
    setModal(true);
  };

  return (
    <>
      <AppNavbar />
      <div className="text-center mt-5">
        {error && <div className="alert alert-danger">{error}</div>}
        <Button color="primary" onClick={toggleModal}>
          + Yangi Post Qo‘shish
        </Button>
      </div>

      <div className="post-grid mt-4">
        {posts.length === 0 ? (
          <p className="text-center">Hozircha postlar yo‘q</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onComment={openCommentModal}
              onEdit={() => openEditModal(post)}
              onDelete={() => handleDeletePost(post._id)}
            />
          ))
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
                >
                  {editMode ? 'Yangilash' : 'Yaratish'}
                </Button>
              </Form>
            </div>
          </CardBody>
        </Card>
      </Modal>

      {/* Comment modal */}
      <Modal isOpen={commentModal} toggle={closeCommentModal} size="md" centered>
        <ModalHeader toggle={closeCommentModal}>Kommentlar</ModalHeader>
        <ModalBody>
          {activeCommentPost && (
            <>
              <div>
                {activeCommentPost.comments && activeCommentPost.comments.length > 0 ? (
                  activeCommentPost.comments.map((comment) => (
                    <div key={comment._id} className="mb-3 p-2 border rounded">
                      <div>
                        <b>{comment.userId?.username || 'Anonim'}</b>:
                        {editingCommentId === comment._id ? (
                          <>
                            <Input
                              type="text"
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="my-2"
                            />
                            <Button size="sm" color="success" onClick={handleUpdateComment} className="me-2">Saqlash</Button>
                            <Button size="sm" color="secondary" onClick={() => setEditingCommentId(null)}>Bekor qilish</Button>
                          </>
                        ) : (
                          <>
                            <span className="ms-2">{comment.text}</span>
                            {comment.userId?._id === userId && (
                              <>
                                <Button size="sm" color="warning" className="ms-2"
                                  onClick={() => handleEditComment(comment)}
                                  >Tahrirlash</Button>
                                <Button size="sm" color="danger" className="ms-2"
                                  onClick={() => handleDeleteComment(comment._id)}
                                  >O‘chirish</Button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#888' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div>Komentlar yo‘q</div>
                )}
              </div>
              <Form inline className="d-flex mt-2" onSubmit={e => { e.preventDefault(); handleCommentSubmit(); }}>
                <Input
                  type="text"
                  placeholder="Komment yozing..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="me-2"
                />
                <Button color="primary" onClick={handleCommentSubmit}>Yuborish</Button>
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