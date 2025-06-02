import React from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import { FaThumbsUp, FaComment, FaEdit, FaTrash } from 'react-icons/fa';

const PostCard = ({ post, onLike, onComment, onEdit, onDelete }) => {
  return (
    <Card className="mb-3 post-card">
      <CardBody>
        <h5>{post.userId?.username || "Anonim"}</h5>
        <p>{post.content}</p>
        {post.postImage && (typeof post.postImage === "string" ? (
          <img src={post.postImage} alt="Post" className="post-image" />
        ) : post.postImage.url ? (
          <img src={post.postImage.url} alt="Post" className="post-image" />
        ) : null)}
        <div className="d-flex justify-content-between">
          <Button color="link" onClick={() => onLike(post._id)}>
            <FaThumbsUp /> ({post.likes?.length || 0})
          </Button>
          <Button color="link" onClick={() => onComment(post)}>
            <FaComment /> ({post.comments?.length || 0})
          </Button>
          <Button color="link" onClick={onEdit}>
            <FaEdit />
          </Button>
          <Button color="link" onClick={onDelete}>
            <FaTrash />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default PostCard;