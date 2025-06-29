import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/instance';
import AppNavbar from '../Components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../Components/Loader';
import './Admin.css';

const API = '/api/admin';

const LoaderMini = () => <span className="admin-spinner-mini"></span>;
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <span>{title}</span>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editData, setEditData] = useState({});
  const [tab, setTab] = useState('posts');
  const [err, setErr] = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [statModal, setStatModal] = useState(null);
  const [statUserModal, setStatUserModal] = useState(null);
  const [statUserPosts, setStatUserPosts] = useState([]);
  const [statUserLoading, setStatUserLoading] = useState(false);
  const [statUserType, setStatUserType] = useState('');
  const [deleting, setDeleting] = useState({});
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Faqat faol postlar
  const activePosts = posts.filter(p => !p.deleted && !p.isDeleted);

  // Faqat faol va faol postga bog‘langan kommentlar
  const activeComments = comments.filter(c => {
    let postId = (typeof c.postId === "object" && c.postId !== null) ? c.postId._id : c.postId;
    return (
      postId &&
      activePosts.find(p => String(p._id) === String(postId)) &&
      !c.deleted && !c.isDeleted
    );
  });

  const activeLikes = activePosts.reduce((sum, p) => sum + (Array.isArray(p.likes) ? p.likes.length : 0), 0);

  const status = {
    posts: activePosts.length,
    comments: activeComments.length,
    likes: activeLikes,
  };

  // Reytinglar
  const postReyting = Object.values(activePosts.reduce((acc, post) => {
    const uid = post.userId?._id;
    if (!uid) return acc;
    if (!acc[uid]) acc[uid] = { user: post.userId, count: 0 };
    acc[uid].count += 1;
    return acc;
  }, {})).sort((a, b) => b.count - a.count);

  const likeReyting = Object.values(activePosts.reduce((acc, post) => {
    (Array.isArray(post.likes) ? post.likes : []).forEach(uid => {
      const userObj = users.find(u => u._id === uid);
      if (!userObj) return;
      if (!acc[uid]) acc[uid] = { user: userObj, count: 0 };
      acc[uid].count += 1;
    });
    return acc;
  }, {})).sort((a, b) => b.count - a.count);

  const commentReyting = Object.values(activeComments.reduce((acc, c) => {
    const uid = c.userId?._id;
    if (!uid) return acc;
    const userObj = users.find(u => u._id === uid);
    if (!userObj) return acc;
    if (!acc[uid]) acc[uid] = { user: userObj, count: 0 };
    acc[uid].count += 1;
    return acc;
  }, {})).sort((a, b) => b.count - a.count);

  const openStatModal = (type) => setStatModal(type);
  const closeStatModal = () => setStatModal(null);

  const statMap = {
    post: {
      title: "Top post joylaganlar",
      data: postReyting,
      badge: "post",
      countLabel: "post"
    },
    like: {
      title: "Top like bosganlar",
      data: likeReyting,
      badge: "like",
      countLabel: "like"
    },
    comment: {
      title: "Top komment yozganlar",
      data: commentReyting,
      badge: "comment",
      countLabel: "komment"
    }
  };

  // STAT USER MODAL — LIKE/COMMENT/POSTLARI
  const handleStatUserClick = async (user, type) => {
    setStatUserModal({ user, type });
    setStatUserType(type);
    setStatUserLoading(true);
    setStatUserPosts([]);
    try {
      let url = "";
      if (type === "like") url = `/api/user/${user._id}/liked-posts`;
      if (type === "comment") url = `/api/user/${user._id}/commented-posts`;
      if (type === "post") url = `/api/user/${user._id}/my-posts`;
      const res = await axios.get(url);
      setStatUserPosts(res.data);
    } catch (e) {
      setStatUserPosts([]);
    }
    setStatUserLoading(false);
  };

  const closeStatUserModal = () => {
    setStatUserModal(null);
    setStatUserPosts([]);
    setStatUserLoading(false);
    setStatUserType('');
  };

  // Barcha ma'lumotlarni olish
  const fetchAll = async () => {
    setLoading(true); setErr('');
    try {
      const [usersR, postsR, commentsR] = await Promise.all([
        axios.get(`${API}/users`),
        axios.get(`${API}/posts`),
        axios.get(`${API}/comments`),
      ]);
      setUsers(usersR.data);
      setPosts(postsR.data);
      setComments(commentsR.data);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Xatolik");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // O'chirish
  const handleDelete = async (type, id) => {
    if (!window.confirm('Ishonchingiz komilmi?')) return;
    setErr('');
    setDeleting({ type, id });
    try {
      await axios.delete(`${API}/${type}/${id}`);
      fetchAll();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
    setDeleting({});
  };

  // Edit modal ochish
  const handleEdit = (type, data) => {
    setModal({ type, data });
    setEditData({ ...data, password: "" });
    setImgPreview(data.profileImage?.url || data.postImage?.url || '');
  };

  // Edit modal inputlar
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setEditData(prev => ({ ...prev, [name]: files[0] }));
      setImgPreview(URL.createObjectURL(files[0]));
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Edit modal saqlash
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const fd = new FormData();
      for (let key in editData) {
        if (
          editData[key] !== undefined &&
          (key !== "password" || editData.password)
        ) {
          fd.append(key, editData[key]);
        }
      }
      const url = `${API}/${modal.type}/${editData._id}`;
      await axios.put(url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setModal(null); setImgPreview(''); fetchAll();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
    setSaving(false);
  };

  // Faqat admin kirishi mumkin
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== "101") navigate('/home', { replace: true });
  }, [navigate]);

  const closeModal = () => { setModal(null); setImgPreview(''); };
  const isAdmin = user => (user.role === 101 || user.role === '101');
  const normalUsers = users.filter(u => u.role !== 101 && u.role !== "101");

  return (
    <div className="admin-container">
      <AppNavbar />
      <div className="admin-section-wrap mt-5">
        <div className="admin-section-card" onClick={() => openStatModal('post')}>
          <div>Postlar</div>
          <div className="admin-section-count">{status.posts}</div>
        </div>
        <div className="admin-section-card" onClick={() => openStatModal('comment')}>
          <div>Komentlar</div>
          <div className="admin-section-count">{status.comments}</div>
        </div>
        <div className="admin-section-card" onClick={() => openStatModal('like')}>
          <div>Like'lar</div>
          <div className="admin-section-count">{status.likes}</div>
        </div>
      </div>

      {statModal && (
        <Modal
          show={!!statModal}
          onClose={closeStatModal}
          title={statMap[statModal].title}
        >
          {statMap[statModal].data.length === 0 && <p>Hali ma'lumot yo‘q</p>}
          <ol>
            {statMap[statModal].data.map((row, i) =>
              <li key={row.user?._id || i} className="mb-2">
                <img src={row.user?.profileImage?.url} alt="" width={30} height={30} style={{ borderRadius: '50%', objectFit: 'cover', marginRight: 6 }} />
                <span style={{ fontWeight: 500, cursor: 'pointer', color: '#008cff' }}
                  onClick={() => handleStatUserClick(row.user, statModal)}
                >{row.user?.username}</span>
                <span className="mx-2">{row.count} ta {statMap[statModal].countLabel}</span>
                {row.user && (
                  <span className={`badge ms-2 ${isAdmin(row.user) ? 'bg-danger' : 'bg-secondary'}`}>
                    {isAdmin(row.user) ? "admin" : "user"}
                  </span>
                )}
                <Link to={`/profile/${row.user?._id}`} style={{ marginLeft: 10, textDecoration: 'underline', color: '#007bff' }} onClick={closeStatModal}>Profil</Link>
              </li>
            )}
          </ol>
          <button className="admin-modal-btn" onClick={closeStatModal}>Orqaga</button>
        </Modal>
      )}

      <Modal
        show={!!statUserModal}
        onClose={closeStatUserModal}
        title={
          statUserModal
            ? statUserType === "like"
              ? `${statUserModal.user?.username} — Posts that have received likes`
              : statUserType === "comment"
                ? `${statUserModal.user?.username} — Komment qoldirgan postlari`
                : `${statUserModal.user?.username} — Posted locations`
            : ""
        }
      >
        {statUserLoading && <LoaderMini />}
        {!statUserLoading && statUserType === "like" && (
          <ul className="admin-modal-list">
            {statUserPosts
              .filter(post => post && !post.deleted && !post.isDeleted)
              .length === 0 ? (
              <li>There is nothing.</li>
            ) : (
              statUserPosts
                .filter(post => post && !post.deleted && !post.isDeleted)
                .map(post =>
                  <li key={post._id}>
                    <b>{post.title}</b>
                    <div style={{ color: "#008cff" }}>Like pressed</div>
                    <div>{post.content?.slice(0, 80)}</div>
                    {post.postImage?.url &&
                      <div style={{ marginTop: 6 }}>
                        <img src={post.postImage.url} width={30} height={30} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="post" />
                      </div>
                    }
                  </li>
                )
            )}
          </ul>
        )}
        {!statUserLoading && statUserType === "comment" && (
          <ul className="admin-modal-list">
            {statUserPosts
              .filter(item =>
                item.post && !item.post.deleted && !item.post.isDeleted
              )
              .length === 0 ? (
              <li>There is nothing</li>
            ) : (
              statUserPosts
                .filter(item =>
                  item.post && !item.post.deleted && !item.post.isDeleted
                )
                .map(item =>
                  <li key={item.comment._id}>
                    <b>{item.post.title}</b>
                    <div style={{ color: "#008cff" }}>Comment written:</div>
                    <div>{item.comment.text}</div>
                    <div style={{ color: "#7a7" }}>Post: {item.post.content?.slice(0, 60)}</div>
                    {item.post.postImage?.url &&
                      <div style={{ marginTop: 6 }}>
                        <img src={item.post.postImage.url} width={30} height={30} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="post" />
                      </div>
                    }
                  </li>
                )
            )}
          </ul>
        )}
        {!statUserLoading && statUserType === "post" && (
          <ul className="admin-modal-list">
            {statUserPosts
              .filter(post => post && !post.deleted && !post.isDeleted)
              .length === 0 ? (
              <li>Hech narsa yo‘q</li>
            ) : (
              statUserPosts
                .filter(post => post && !post.deleted && !post.isDeleted)
                .map(post =>
                  <li key={post._id}>
                    <b>{post.title}</b>
                    <div style={{ color: "#008cff" }}>O‘zi joylagan</div>
                    <div>{post.content?.slice(0, 80)}</div>
                    {post.postImage?.url &&
                      <div style={{ marginTop: 6 }}>
                        <img src={post.postImage.url} width={30} height={30} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="post" />
                      </div>
                    }
                  </li>
                )
            )}
          </ul>
        )}
      </Modal>

      {err && <div className="admin-alert">{err}</div>}
      {loading ? <Loader /> : (
        <>
          <ul className="admin-tabs">
            <li>
              <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>Posts</button>
            </li>
            <li>
              <button className={tab === 'comments' ? 'active' : ''} onClick={() => setTab('comments')}>Comments</button>
            </li>
            <li>
              <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
            </li>
          </ul>

          {tab === 'posts' && (
            <div className="admin-table-wrap">
              <table className="admin-table posts-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Photo</th>
                    <th>text</th>
                    <th>Like</th>
                    <th>comment</th>
                    <th>Data</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className='table-tdlar'>
                  {activePosts.map(post => (
                    <tr key={post._id}>
                      {/* Username (avatar bilan) */}
                      <td>
                        <span style={{
                          display: "flex", alignItems: "center", gap: "7px", fontWeight: 600
                        }}>
                          {post.userId?.profileImage?.url &&
                            <img src={post.userId.profileImage.url}
                              alt="avatar"
                              width={36} height={36}
                              style={{ borderRadius: "50%", objectFit: "cover", background: "#f5f5f5", border: "1.5px solid #e7ecf4" }}
                            />
                          }
                          {post.userId?.username}
                        </span>
                      </td>

                      {/* Post rasm */}
                      <td>
                        {post.postImage?.url
                          ? <img src={post.postImage.url} alt="post"
                            style={{
                              width: "100%",
                              maxWidth: 290,
                              height: 110,
                              objectFit: "cover",
                              borderRadius: 7,
                              background: "#e5eefa",
                              display: "block",
                              margin: "0 auto"
                            }}
                          />
                          : null}
                      </td>

                      {/* Matn */}
                      <td>{post.content}</td>

                      {/* Like va Comment birga */}
                      <td colSpan={2} style={{ padding: 0, margin: 0 }}>
                        <div className="post-stats-row">
                          <span>
                            <span className="icon-like">❤️</span>
                            {Array.isArray(post.likes) ? post.likes.length : 0}
                          </span>
                          <span>
                            <span className="icon-comment">💬</span>
                            {activeComments.filter(c => {
                              let cid = (typeof c.postId === "object" && c.postId !== null) ? c.postId._id : c.postId;
                              return String(cid) === String(post._id);
                            }).length}
                          </span>
                        </div>
                      </td>

                      {/* Sana (faqat katta ekranda) */}
                      <td>{new Date(post.createdAt).toLocaleString()}</td>

                      {/* Edit/Delete (faqat katta ekranda) */}
                      <td className='edit-delete-btns'>
                        <button className="admin-table-btn warning">Edit</button>
                        <button className="admin-table-btn danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'comments' && (
            <div className="admin-table-wrap">
              <table className="admin-table comments-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Post</th>
                    <th>Matn</th>
                    <th>Sana</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {activeComments.map(c =>
                    <tr key={c._id}>
                      <td>
                        <Link to={`/profile/${c.userId?._id}`} className="admin-table-link">
                          <img src={c.userId?.profileImage?.url} width={30} height={30} style={{ borderRadius: "50%", objectFit: "cover" }} alt="" />
                          <span className="ms-2">{c.userId?.username}</span>
                        </Link>
                        {c.userId && (
                          <span className={`badge ms-2 ${isAdmin(c.userId) ? 'bg-danger' : 'bg-secondary'}`}>
                            {isAdmin(c.userId) ? "admin" : "user"}
                          </span>
                        )}
                      </td>
                      <td>
                        <span>
                          {typeof c.postId === 'object' && c.postId?.content
                            ? c.postId.content.slice(0, 24)
                            : activePosts.find(p => String(p._id) === String(c.postId))
                              ? activePosts.find(p => String(p._id) === String(c.postId)).content.slice(0, 24)
                              : <span className="text-danger">[PDelete post]</span>
                          }
                        </span>
                      </td>
                      <td>{c.text}</td>
                      <td>{new Date(c.createdAt).toLocaleString()}</td>
                      <td >
                        <button className="admin-table-btn warning me-1" onClick={() => handleEdit('comment', c)}>Edit</button>
                        <button className="admin-table-btn danger" onClick={() => handleDelete('comment', c._id)} disabled={deleting.type === 'comment' && deleting.id === c._id}>
                          {deleting.type === 'comment' && deleting.id === c._id ? <LoaderMini /> : "Delete"}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'users' && (
            <div className="admin-table-wrap">
              <table className="admin-table users-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {normalUsers.map(user => (
                    <tr key={user._id}>
                      <td>
                        {user.profileImage?.url
                          ? <img src={user.profileImage.url} width={30} height={30} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
                          : <span style={{ display: 'inline-block', width: 30, height: 30, borderRadius: '50%', background: '#eee' }}></span>
                        }
                      </td>
                      <td>
                        <Link
                          to={`/profile/${user._id}`}
                          className="admin-table-link"
                          style={{ fontWeight: 500 }}
                        >
                          {user.username}
                        </Link>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <button className="admin-table-btn warning me-1"
                          onClick={() => handleEdit('user', user)}
                        >Edit</button>
                        <button className="admin-table-btn danger"
                          onClick={() => handleDelete('user', user._id)} disabled={deleting.type === 'user' && deleting.id === user._id}>
                          {deleting.type === 'user' && deleting.id === user._id ? <LoaderMini /> : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Modal
            show={!!modal}
            onClose={closeModal}
            title={modal ? `Edit ${modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}` : ""}
          >
            {modal && (
              <form className="admin-modal-form" onSubmit={handleEditSubmit} encType="multipart/form-data">
                {modal.type === 'user' && (
                  <>
                    <label>Username:
                      <input className="admin-form-control" name="username" value={editData.username || ""}
                        onChange={handleEditChange} required />
                    </label>
                    <label>Email:
                      <input className="admin-form-control" name="email" value={editData.email || ""}
                        onChange={handleEditChange} required />
                    </label>
                    <label>Password:
                      <input className="admin-form-control" name="password" type="password" value={editData.password || ""}
                        onChange={handleEditChange} />
                      <span className="admin-modal-hint">If you fill it out, the password will be updated.</span>
                    </label>
                    <label>Avatar:
                      <input className="admin-form-control" type="file" name="profileImage"
                        ref={fileInputRef}
                        onChange={handleEditChange} />
                      {imgPreview && <img src={imgPreview} alt="preview" width={30} height={30} style={{ borderRadius: "50%", objectFit: "cover" }} />}
                    </label>
                  </>
                )}
                {modal.type === 'post' && (
                  <>
                    <label>Matn: <textarea className="admin-form-control" name="content" value={editData.content || ""}
                      onChange={handleEditChange} required /></label>
                    <label>Rasm:
                      <input className="admin-form-control" type="file" name="postImage"
                        ref={fileInputRef}
                        onChange={handleEditChange} />
                      {imgPreview && <img src={imgPreview} alt="preview" width={30} height={30} style={{ borderRadius: "50%", objectFit: "cover" }} />}
                    </label>
                  </>
                )}
                {modal.type === 'comment' && (
                  <>
                    <label>Matn: <textarea className="admin-form-control" name="text" value={editData.text || ""}
                      onChange={handleEditChange} required /></label>
                  </>
                )}
                <button className="admin-modal-btn primary" type="submit" disabled={saving}>
                  {saving ? <LoaderMini /> : "Saqlash"}
                </button>
                <button type="button" className="admin-modal-btn" onClick={closeModal}>Orqaga</button>
              </form>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default AdminPage;