import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardTitle, CardImg, Input, Button, Spinner } from 'reactstrap';
import { FaUserPlus, FaUserMinus } from 'react-icons/fa';
import AppNavbar from '../Components/Navbar';

const API_URL = 'http://localhost:4000/api/user';

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});
  const debounceTimeout = useRef(null);
  const navigate = useNavigate();

  // 👤 Foydalanuvchi ma'lumotini olish
  const fetchCurrentUser = async () => {
    setUserLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(res.data);
      setError(null);
    } catch {
      setError('Foydalanuvchi ma’lumotlari topilmadi');
    } finally {
      setUserLoading(false);
    }
  };

  // ➕ Sahifa yuklanganda tokenni tekshirish va foydalanuvchini olish
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth', { replace: true });
      return;
    }
    fetchCurrentUser();
  }, [navigate]);

  // 🔍 Foydalanuvchilarni umumiy olish
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || searchQuery.trim() !== '') return;

    setLoading(true);
    axios
      .get(`${API_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsers(res.data);
        setError(null);
      })
      .catch(() => {
        setUsers([]);
        setError('Foydalanuvchilarni olishda xatolik');
      })
      .finally(() => setLoading(false));
  }, [searchQuery]);

  // 🔍 Qidiruv bo'yicha foydalanuvchilarni olish (debounce)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || searchQuery.trim() === '') return;

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
        setError(null);
      } catch {
        setUsers([]);
        setError('Foydalanuvchilarni qidirishda xatolik');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchQuery]);

  // 🤝 Follow/Unfollow qilish
  const handleFollow = async (userId, isFollowing) => {
    setFollowLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const url = `${API_URL}/${isFollowing ? 'unfollow' : 'follow'}/${userId}`;
      await axios.put(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      // ✅ currentUser qayta olish (eng ishonchli usul)
      await fetchCurrentUser();
      setError(null);
    } catch {
      setError('Follow/Unfollow qilishda xatolik');
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // 💡 Bu userni follow qilganmizmi?
  const isFollowing = (userId) =>
    currentUser &&
    Array.isArray(currentUser.following) &&
    currentUser.following.some((id) => String(id) === String(userId));

  // 🔎 O'zini o'zi chiqarib tashlash
  const filteredUsers = users.filter(
    (user) => !(currentUser && user._id === currentUser._id)
  );

  // ✅ Render
  return (
    <>
      <AppNavbar />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Foydalanuvchilar</h2>
        {userLoading ? (
          <div className="text-center">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger">{error}</div>}
            <Input
              type="text"
              placeholder="Foydalanuvchi nomini qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="mt-4">
              {loading && <p className="text-center">Yuklanmoqda...</p>}
              {!loading && filteredUsers.length === 0 && (
                <p className="text-center">Foydalanuvchilar topilmadi</p>
              )}
              {filteredUsers.map((user) => {
                const currentlyFollowing = isFollowing(user._id);
                return (
                  <Card
                    key={user._id}
                    className="mb-3"
                    style={{
                      cursor: 'pointer',
                      background: '#f9f9f9',
                      transition: '0.2s',
                      boxShadow: 'rgb(170 91 172) 0px 3px 10px',
                    }}
                  >
                    <CardBody className="d-flex align-items-center">
                      <div
                        onClick={() => navigate(`/profile/${user._id}`)}
                        className="d-flex align-items-center flex-grow-1"
                      >
                        <CardImg
                          src={
                            user.profileImage?.url
                              ? user.profileImage.url
                              : 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'
                          }
                          alt="Profile"
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            marginRight: '15px',
                            objectFit: 'cover',
                            background: '#e0e0e0',
                          }}
                        />
                        <CardTitle
                          tag="h5"
                          className="mb-0"
                          style={{ flex: 1, margin: 0 }}
                        >
                          {user.username}
                        </CardTitle>
                      </div>
                      <div>
                        <Button
                          color={currentlyFollowing ? 'danger' : 'success'}
                          size="sm"
                          onClick={() =>
                            handleFollow(user._id, currentlyFollowing)
                          }
                          disabled={!!followLoading[user._id]}
                        >
                          {followLoading[user._id] ? (
                            <Spinner size="sm" color="secondary" />
                          ) : currentlyFollowing ? (
                            <>
                              <FaUserMinus /> Unfollow
                            </>
                          ) : (
                            <>
                              <FaUserPlus /> Follow
                            </>
                          )}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UserSearch;
