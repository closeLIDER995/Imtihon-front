import React, { useState } from 'react';
import './Profile.css';
import AppNavbar from '../Components/Navbar';

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('JohnDoe');
  const [bio, setBio] = useState('Frontend Developer | Tech Lover');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    setEditMode(false);
  };

  return (
    <>
    <AppNavbar/>
      <div className="text-center mt-5">
   
    <div className="profile-container">
      <h2>Profile Page</h2>
      <p>Profile ma'lumotlari bu yerda korsatiladi.</p>
      </div>

      <div className="profile-card">
        {editMode ? (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="avatar-input"
            />
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar" />
            )}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-text"
            />
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-text"
            />
            <div className="profile-actions">
              <button className="btn save" onClick={handleSave}>Save</button>
            </div>
          </>
        ) : (
          <>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar" />
            )}
            <h2>{name}</h2>
            <p className="bio">{bio}</p>
            <div className="profile-stats">
              <div><strong>0</strong><br />Posts</div>
              <div><strong>108</strong><br />Followers</div>
              <div><strong>75</strong><br />Following</div>
            </div>
            <div className="profile-actions">
              <button className="btn follow">Follow</button>
              <button className="btn edit" onClick={() => setEditMode(true)}>Edit Profile</button>
            </div>
          </>
        )}
      </div>

     
    </div>
    </>
  );
};

export default Profile;
