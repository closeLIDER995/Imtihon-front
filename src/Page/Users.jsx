import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardTitle, CardImg, Input, Button } from 'reactstrap';
import { FaUserPlus, FaUserMinus } from 'react-icons/fa';
import AppNavbar from '../Components/Navbar';

const API_URL = 'http://localhost:4000/api/user';

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth', { replace: true });
      return;
    }
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
      } catch {
        setError('Foydalanuvchi ma’lumotlari topilmadi');
      }
    };
    fetchCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (searchQuery.trim() !== '') return;
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (searchQuery.trim() === '') return;
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
      }
      setLoading(false);
    }, 350);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchQuery]);

  // Yangi follow/unfollow handler
  const handleFollow = async (userId, isFollowing) => {
    try {
      const url = `${API_URL}/${isFollowing ? 'unfollow' : 'follow'}/${userId}`;
      const response = await axios.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      // Backenddan currentUser obyektini kutamiz (faqat following massivini emas, to‘liq user obyektini)
      if (response.data.currentUser) {
        setCurrentUser(response.data.currentUser);
      } else if (response.data.following) {
        // Agar faqat following massivini qaytarilsa
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                following: response.data.following,
              }
            : prev
        );
      }
      // Users massivini ham yangilash (isFollowed ni userga qo‘shish)
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isFollowed: !isFollowing }
            : user
        )
      );
      setError(null);
    } catch {
      setError('Follow/Unfollow qilishda xatolik');
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Faqat currentUser.following ni tekshirib isFollowing aniqlanadi!
  const isFollowing = (userId) =>
    currentUser &&
    Array.isArray(currentUser.following) &&
    currentUser.following.some((id) => String(id) === String(userId));

  return (
    <>
      <AppNavbar />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Foydalanuvchilar</h2>
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
          {!loading && users.length === 0 && (
            <p className="text-center">Foydalanuvchilar topilmadi</p>
          )}
          {users.map((user) => (
            <Card
              key={user._id}
              className="mb-3"
              style={{ cursor: 'pointer', background: '#f9f9f9', transition: '0.2s' }}
            >
              <CardBody className="d-flex align-items-center">
                {user.profileImage?.url && (
                  <CardImg
                    src={user.profileImage.url}
                    alt="Profile"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      marginRight: '15px',
                    }}
                  />
                )}
                <CardTitle
                  tag="h5"
                  className="mb-0"
                  style={{ flex: 1, margin: 0 }}
                  onClick={() => handleUserClick(user._id)}
                >
                  {user.username}
                </CardTitle>
                <div>
                  {currentUser && user._id !== currentUser._id && (
                    <Button
                      color={isFollowing(user._id) ? 'danger' : 'success'}
                      size="sm"
                      onClick={() => handleFollow(user._id, isFollowing(user._id))}
                    >
                      {isFollowing(user._id) ? (
                        <>
                          <FaUserMinus /> Unfollow
                        </>
                      ) : (
                        <>
                          <FaUserPlus /> Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default UserSearch;