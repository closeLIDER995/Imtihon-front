import React, { useState, useEffect } from 'react';
import {
  Modal, Button, Form, FormGroup, Label, Input, Card, CardBody
} from 'reactstrap';
import { FaThumbsUp, FaComment, FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Navbar from '../Components/Navbar';

function Home() {
  const [posts, setPosts] = useState([]);
  const [modal, setModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [newPost, setNewPost] = useState({ description: '', file: null });

  useEffect(() => {
    const storedPosts = localStorage.getItem('posts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts));
  }, [posts]);

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      setNewPost({ description: '', file: null });
      setEditMode(false);
      setEditingPostId(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewPost({ ...newPost, file });
  };

  const handleCreatePost = () => {
    if (newPost.description.trim()) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPostObj = {
          id: Date.now(),
          description: newPost.description,
          file: newPost.file ? reader.result : null,
          likes: 0,
          comments: [],
          isLiked: false,
          isFollowed: false,
        };
        setPosts([newPostObj, ...posts]);
        toggleModal();
      };
      if (newPost.file) {
        reader.readAsDataURL(newPost.file);
      } else {
        reader.onloadend();
      }
    }
  };

  const handleUpdatePost = () => {
    if (newPost.description.trim()) {
      if (newPost.file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPosts(posts.map(post =>
            post.id === editingPostId
              ? { ...post, description: newPost.description, file: reader.result }
              : post
          ));
          toggleModal();
        };
        reader.readAsDataURL(newPost.file);
      } else {
        setPosts(posts.map(post =>
          post.id === editingPostId
            ? { ...post, description: newPost.description }
            : post
        ));
        toggleModal();
      }
    }
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== postId));
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handleFollow = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, isFollowed: !post.isFollowed } : post
    ));
  };

  const handleCommentSubmit = (postId, comment) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));
  };

  const openEditModal = (post) => {
    setEditMode(true);
    setEditingPostId(post.id);
    setNewPost({ description: post.description, file: null });
    setModal(true);
  };

  return (
    <>
      <Navbar />
    <div className="text-center mt-5">

      <h2 className="text-center mb-4">Post Page</h2>
      <div className="text-center mt-5">
        <Button color="primary" onClick={toggleModal}>
          + Create Post
        </Button>
      </div>


      {posts.map((post) => (
        <div key={post.id} className="card mb-3 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start flex-wrap">
              <p className="card-text mb-2">{post.description}</p>
              <div className="d-flex gap-2">
                <Button size="sm" color="warning" onClick={() => openEditModal(post)}>
                  <FaEdit /> Update
                </Button>
                <Button size="sm" color="danger" onClick={() => handleDeletePost(post.id)}>
                  <FaTrash /> Delete
                </Button>
              </div>
            </div>

            {post.file && (
              <div className="d-flex justify-content-center mt-2">
                <img
                  src={post.file}
                  alt="post"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}

            <div className="d-flex justify-content-between mt-3 flex-wrap">
              <button className="btn btn-light" onClick={() => handleLike(post.id)}>
                <FaThumbsUp /> {post.isLiked ? 'Unlike' : 'Like'} ({post.likes})
              </button>
              <button className="btn btn-light" onClick={() => {
                const comment = prompt('Enter your comment');
                if (comment) handleCommentSubmit(post.id, comment);
              }}>
                <FaComment /> Comment
              </button>
              <button className="btn btn-light" onClick={() => handleFollow(post.id)}>
                <FaUserPlus /> {post.isFollowed ? 'Unfollow' : 'Follow'}
              </button>
            </div>

            <ul className="list-unstyled mt-3">
              {post.comments.map((comment, index) => (
                <li key={index}><strong>User:</strong> {comment}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      <Modal isOpen={modal} toggle={toggleModal} size="lg" centered>
        <Card className="shadow">
          <CardBody>
            <div className="modal-header">
              <h5 className="modal-title">{editMode ? 'Update Post' : 'Create New Post'}</h5>
              <Button className="close" onClick={toggleModal}>&times;</Button>
            </div>
            <div className="modal-body">
              <Form>
                <FormGroup>
                  <Label for="description">Description</Label>
                  <Input
                    type="textarea"
                    id="description"
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    placeholder="Write your description here..."
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="file">Upload Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </FormGroup>

                {newPost.file && (
                  <div className="text-center mb-3">
                    <h6>Preview:</h6>
                    <img
                      src={URL.createObjectURL(newPost.file)}
                      alt="preview"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <Button color="dark" onClick={editMode ? handleUpdatePost : handleCreatePost} block>
                  {editMode ? 'Update' : 'Create'} Post
                </Button>
              </Form>
            </div>
          </CardBody>
        </Card>
      </Modal>
    </div>
    </>
  );
}

export default Home;