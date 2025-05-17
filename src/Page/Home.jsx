import React, { useState } from 'react';
import { Modal, Button, Form, FormGroup, Label, Input, Card, CardBody } from 'reactstrap';
import { FaThumbsUp, FaComment, FaUserPlus } from 'react-icons/fa';
import '../components/Navbar.css';  
import Navbar from '../Components/Navbar';

function Home() {
  const [posts, setPosts] = useState([]);
  const [modal, setModal] = useState(false);
  const [newPost, setNewPost] = useState({
    description: '',
    file: null,
  });

  const toggleModal = () => setModal(!modal);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewPost({ ...newPost, file });
  };

  const handleCreatePost = () => {
    if (newPost.description.trim()) {
      const newPostObj = {
        id: Date.now(),
        description: newPost.description,
        file: newPost.file,
        likes: 0,
        comments: [],
        isLiked: false,
        isFollowed: false,
      };
      setPosts([newPostObj, ...posts]);
      setNewPost({ description: '', file: null });
      toggleModal();
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map((post) =>
      post.id === postId
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handleFollow = (postId) => {
    setPosts(posts.map((post) =>
      post.id === postId
        ? { ...post, isFollowed: !post.isFollowed }
        : post
    ));
  };

  const handleCommentSubmit = (postId, comment) => {
    setPosts(posts.map((post) =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));
  };

  return (
    <div className="container mt-5">
      <Navbar />

      {/* Create Post button */}
      <div className="d-flex justify-content-end mb-3">
        <Button color="primary" onClick={toggleModal}>
          + Create Post
        </Button>
      </div>

      <h2 className="text-center mb-4">Home Page</h2>

      {/* Posts */}
      {posts.map((post) => (
        <div key={post.id} className="card mb-3">
          <div className="card-body">
            <p className="card-text">{post.description}</p>
            {post.file && (
              <div className="mb-2">
                <img src={URL.createObjectURL(post.file)} alt="post" className="img-fluid" />
              </div>
            )}

            {/* Like, Comment, Follow buttons */}
            <div className="d-flex justify-content-between">
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

            {/* Comments Section */}
            <ul className="list-unstyled mt-2">
              {post.comments.map((comment, index) => (
                <li key={index}>
                  <strong>User:</strong> {comment}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Modal for New Post */}
      <Modal isOpen={modal} toggle={toggleModal} size="lg" centered>
        <Card className="shadow-lg">
          <CardBody>
            <div className="modal-header">
              <h5 className="modal-title">Create New Post</h5>
              <Button className="close" onClick={toggleModal}>
                &times;
              </Button>
            </div>
            <div className="modal-body">
              <Form>
                <FormGroup>
                  <Label for="description">Description</Label>
                  <Input
                    type="textarea"
                    name="description"
                    id="description"
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    placeholder="Write your description here..."
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="file">Upload Image/Video</Label>
                  <Input
                    type="file"
                    name="file"
                    id="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                </FormGroup>

                {newPost.file && (
                  <div className="mb-3">
                    <h6>Preview:</h6>
                    <img
                      src={URL.createObjectURL(newPost.file)}
                      alt="preview"
                      className="img-fluid"
                    />
                  </div>
                )}

                <Button color="dark" onClick={handleCreatePost} block>
                  Create Post
                </Button>
              </Form>
            </div>
          </CardBody>
        </Card>
      </Modal>
    </div>
  );
}

export default Home;
