import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Profile.css';
import AppNavbar from '../Components/Navbar';

const API_URL = 'http://localhost:4000/api';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_preset';
const CLOUDINARY_CLOUD_NAME = 'dobriy011';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId');
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');

  const [showImgModal, setShowImgModal] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editJob, setEditJob] = useState('');
  const [editHobby, setEditHobby] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [followLoading, setFollowLoading] = useState(false);

  // Fetch user/profile data, current user, posts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !loggedInUserId) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth', { replace: true });
        return;
      }
      const targetUserId = paramUserId || loggedInUserId;
      try {
        // Profil egasi
        const userResponse = await fetch(`${API_URL}/user/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error(await userResponse.text());
        setUser(await userResponse.json());

        // Kirgan user (siz)
        const meResponse = await fetch(`${API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meResponse.ok) setCurrentUser(await meResponse.json());

        // Postlar
        const postsResponse = await fetch(`${API_URL}/post/my-posts/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!postsResponse.ok) throw new Error(await postsResponse.text());
        setPosts(await postsResponse.json());

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (err.message?.includes('401')) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/auth', { replace: true });
        }
      }
    };
    fetchUserData();
  }, [token, loggedInUserId, paramUserId, navigate]);

  // LIKE/UNLIKE
  const handleLike = async (postId, liked) => {
    try {
      const url = `${API_URL}/post/${liked ? "unlike" : "like"}/${postId}`;
      const response = await fetch(url, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(await response.text());
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: liked
                  ? post.likes.filter((id) => id !== loggedInUserId)
                  : [...post.likes, loggedInUserId],
              }
            : post
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // COMMENTS MODAL
  const openCommentsModal = async (post) => {
    setModalPost(post);
    setNewComment('');
    setCommentError('');
    setShowCommentsModal(true);
    try {
      const response = await fetch(`${API_URL}/comment/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.text());
      setComments(await response.json());
    } catch {
      setComments([]);
    }
  };
  const closeCommentsModal = () => {
    setShowCommentsModal(false);
    setModalPost(null);
    setComments([]);
    setNewComment('');
    setCommentError('');
  };
  const handleCommentSubmit = async () => {
    if (!modalPost || !newComment.trim()) return;
    setCommentError('');
    try {
      const response = await fetch(`${API_URL}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: modalPost._id, text: newComment }),
      });
      if (!response.ok) {
        setCommentError(await response.text());
        return;
      }
      const addedComment = await response.json();
      setComments((prev) => [addedComment, ...prev]);
      setNewComment('');
    } catch {
      setCommentError('Komment qo‘shishda xatolik');
    }
  };

  // FOLLOW/UNFOLLOW LOGIC
  const isOwnProfile = loggedInUserId === user?._id;
  const isFollowing = !!currentUser?.following?.some(id => String(id) === String(user?._id));

  const handleFollow = async (targetUserId) => {
    setFollowLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/follow/${targetUserId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUser(data.user);
      setCurrentUser(data.currentUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    setFollowLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/unfollow/${targetUserId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUser(data.user);
      setCurrentUser(data.currentUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  // PROFILE IMAGE UPLOAD (Cloudinary)
  const openImgModal = () => {
    setShowImgModal(true);
    setImgFile(null);
    setImgPreview(null);
  };
  const closeImgModal = () => {
    setShowImgModal(false);
    setImgFile(null);
    setImgPreview(null);
  };
  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImgFile(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await res.json();
    if (!data.secure_url) throw new Error(data.error?.message || "Cloudinary upload error");
    return data.secure_url;
  };
  const handleImgUpload = async (e) => {
    e.preventDefault();
    if (!imgFile) return;
    try {
      const imgUrl = await uploadToCloudinary(imgFile);
      const response = await fetch(`${API_URL}/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileImage: { url: imgUrl } }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUser((prev) => ({
        ...prev,
        profileImage: data.user.profileImage,
      }));
      closeImgModal();
    } catch (err) {
      setError("Rasm yuklashda xatolik: " + err.message);
    }
  };

  // EDIT INFO MODAL
  const openEditModal = () => {
    setEditUsername(user.username || "");
    setEditJob(user.job || "");
    setEditHobby(user.hobby || "");
    setEditError('');
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError('');
  };
  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const body = { username: editUsername, job: editJob, hobby: editHobby };
      const response = await fetch(`${API_URL}/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUser((prev) => ({
        ...prev,
        username: data.user.username,
        job: data.user.job,
        hobby: data.user.hobby
      }));
      closeEditModal();
    } catch (err) {
      setEditError('Tahrirlashda xatolik: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading">Ma’lumotlar yuklanmoqda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error">Xatolik yuz berdi: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <div className="error">Foydalanuvchi ma’lumotlari topilmadi</div>
      </div>
    );
  }

  return (
    <>
      <AppNavbar />
      <div className="profile-page-ig">
        <div className="profile-ig-header">
          <div style={{ position: 'relative' }}>
            <img
              src={user.profileImage && user.profileImage.url ? user.profileImage.url : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_items_boosted&w=740"}
              alt="Profile"
              className="profile-ig-avatar"
              onClick={isOwnProfile ? openImgModal : undefined}
              style={{ cursor: isOwnProfile ? 'pointer' : 'default', border: isOwnProfile ? '2px solid #3897f0' : undefined }}
              title={isOwnProfile ? "Rasmni o'zgartirish" : ""}
            />
            {isOwnProfile && (
              <button className="profile-img-edit-btn" onClick={openImgModal} title="Rasmni o'zgartirish">
                <span role="img" aria-label="edit">🖊️</span>
              </button>
            )}
          </div>
          <div className="profile-ig-info">
            <div className="profile-ig-username-row">
              <span className="profile-ig-username">{user.username}</span>
              {isOwnProfile ? (
                <button className="profile-ig-edit-btn" onClick={openEditModal}>
                  Profilni tahrirlash
                </button>
              ) : (
                isFollowing ? (
                  <button className="profile-ig-edit-btn" onClick={() => handleUnfollow(user._id)} disabled={followLoading}>
                    {followLoading ? "..." : "Unfollow"}
                  </button>
                ) : (
                  <button className="profile-ig-edit-btn" onClick={() => handleFollow(user._id)} disabled={followLoading}>
                    {followLoading ? "..." : "Follow"}
                  </button>
                )
              )}
            </div>
            <div className="profile-ig-stats">
              <div className="profile-ig-stat"><span className="profile-ig-stat-value">{posts.length}</span><span className="profile-ig-stat-label">posts</span></div>
              <div className="profile-ig-stat"><span className="profile-ig-stat-value">{user.followers?.length || 0}</span><span className="profile-ig-stat-label">followers</span></div>
              <div className="profile-ig-stat"><span className="profile-ig-stat-value">{user.following?.length || 0}</span><span className="profile-ig-stat-label">following</span></div>
            </div>
            {/* Kasb va Hobby yonma-yon */}
            <div className="profile-ig-jobhobby-row" style={{display: 'flex', gap: '24px', marginTop: 8}}>
              <div><b>Kasbi:</b> <span>{user.job ? user.job : "Ko'rsatilmagan"}</span></div>
              <div><b>Hobby:</b> <span>{user.hobby ? user.hobby : "Ko'rsatilmagan"}</span></div>
            </div>
          </div>
        </div>
        <div className="profile-ig-posts">
          <h3>Postlar</h3>
          {posts.length > 0 ? (
            <div className="profile-ig-posts-list">
              {posts.map((post) => (
                <div key={post._id} className="profile-ig-post-card">
                  {post.postImage && post.postImage.url && (
                    <img src={post.postImage.url} alt="Post" className="profile-ig-post-image" />
                  )}
                  <div className="profile-ig-post-content">{post.content}</div>
                  <div className="profile-ig-post-likecomment">
                    <button
                      className={`like-btn ${post.likes && post.likes.includes(loggedInUserId) ? "liked" : ""}`}
                      onClick={() => handleLike(post._id, post.likes && post.likes.includes(loggedInUserId))}
                    >
                      ❤️ {post.likes?.length || 0}
                    </button>
                    <button
                      className="open-comments-btn"
                      onClick={() => openCommentsModal(post)}
                    >
                      💬 Kommentlar
                    </button>
                  </div>
                  <div className="profile-ig-post-date">
                    {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Noma’lum vaqt'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="profile-ig-no-posts">Hozircha postlar yo‘q</p>
          )}
        </div>
      </div>

      {/* --- IMAGE MODAL --- */}
      {showImgModal && (
        <div className="comments-modal-backdrop" onClick={closeImgModal}>
          <div className="comments-modal" onClick={e => e.stopPropagation()}>
            <div className="comments-modal-header">
              <span>Profil rasmni yuklash</span>
              <button className="close-comments-btn" onClick={closeImgModal}>✖</button>
            </div>
            <form className="comments-modal-body" onSubmit={handleImgUpload}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImgChange}
                style={{ marginBottom: 16 }}
              />
              {imgPreview && (
                <img src={imgPreview} alt="preview" style={{ width: 100, height: 100, borderRadius: '50%', marginBottom: 16 }} />
              )}
              <button className="modal-add-comment-btn" type="submit">Saqlash</button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && (
        <div className="comments-modal-backdrop" onClick={closeEditModal}>
          <div className="comments-modal" onClick={e => e.stopPropagation()}>
            <div className="comments-modal-header">
              <span>Profilni tahrirlash</span>
              <button className="close-comments-btn" onClick={closeEditModal}>✖</button>
            </div>
            <form className="comments-modal-body" onSubmit={handleEditSave}>
              <label>
                Username:
                <input
                  type="text"
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="modal-comment-input"
                  required
                  style={{ marginBottom: 12 }}
                />
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ flex: 1 }}>
                  Kasbi:
                  <input
                    type="text"
                    value={editJob}
                    onChange={e => setEditJob(e.target.value)}
                    className="modal-comment-input"
                    placeholder="Kasbingiz"
                  />
                </label>
                <label style={{ flex: 1 }}>
                  Hobby:
                  <input
                    type="text"
                    value={editHobby}
                    onChange={e => setEditHobby(e.target.value)}
                    className="modal-comment-input"
                    placeholder="Hobbiyingiz"
                  />
                </label>
              </div>
              <button className="modal-add-comment-btn" type="submit" disabled={editLoading} style={{ marginTop: 14 }}>
                {editLoading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              {editError && <div className="modal-comment-error">{editError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* --- COMMENTS MODAL --- */}
      {showCommentsModal && modalPost && (
        <div className="comments-modal-backdrop" onClick={closeCommentsModal}>
          <div className="comments-modal" onClick={e => e.stopPropagation()}>
            <div className="comments-modal-header">
              <span>Komentlar</span>
              <button className="close-comments-btn" onClick={closeCommentsModal}>✖</button>
            </div>
            <div className="comments-modal-body">
              {comments.length > 0 ? (
                <div className="modal-comment-list">
                  {comments.map((c) => (
                    <div key={c._id} className="modal-comment-item">
                      <img
                        src={c.userId?.profileImage?.url ? c.userId.profileImage.url : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_items_boosted&w=740"}
                        alt="avatar"
                        className="modal-comment-avatar"
                        style={{ width: 28, height: 28, borderRadius: "50%", marginRight: 8 }}
                      />
                      <span className="modal-comment-user">{c.userId?.username || "user"}:</span>
                      <span className="modal-comment-text">{c.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="modal-no-comments">Kommentlar yo‘q</div>
              )}
            </div>
            <div className="comments-modal-footer">
              <input
                type="text"
                className="modal-comment-input"
                placeholder="Komment yozish..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleCommentSubmit(); }}
              />
              <button className="modal-add-comment-btn" onClick={handleCommentSubmit}>
                Qo‘shish
              </button>
            </div>
            {commentError && <div className="modal-comment-error">{commentError}</div>}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;