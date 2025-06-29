import React from 'react';
import { Card, CardBody, Button, Spinner } from 'reactstrap';
import { FaRegHeart, FaHeart, FaRegCommentDots } from 'react-icons/fa';

const HomeCard = ({
  post,
  onLike,
  onComment,
  likeLoading = false,
  isLiked = false, // hozirgi user like bosganmi
}) => {
  return (
    <Card className="mb-3 post-card">
      <CardBody>
        <h5>{post.userId?.username || 'Anonim'}</h5>
        <p>{post.content}</p>
        {post.postImage && (
          typeof post.postImage === "string" ? (
            <img src={post.postImage} alt="Post" className="post-image" />
          ) : post.postImage.url ? (
            <img src={post.postImage.url} alt="Post" className="post-image" />
          ) : null
        )}
        <div className="btn-post-link">
          <Button
            color=""
            onClick={onLike}
            disabled={likeLoading}
            style={{ minWidth: 50 }}
            title="Like"
          >
            {likeLoading ? (
              <Spinner size="sm" color="danger" />
            ) : (
              isLiked ? (
                <FaHeart style={{ color: '#ff5252', fontSize: 22 }} />
              ) : (
                <FaRegHeart style={{ color: '#ff5252', fontSize: 22 }} />
              )
            )}
            <span style={{ fontWeight: 500, color: '#444', marginLeft: 4 }}>
              {post.likes?.length || 0}
            </span>
          </Button>
          <Button color="" onClick={onComment} title="Comment">
            <FaRegCommentDots style={{ color: '#0ea5e9', fontSize: 22 }} />
            <span style={{ fontWeight: 500, color: '#444', marginLeft: 4 }}>
              {post.comments?.length || 0}
            </span>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default HomeCard;