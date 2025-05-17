import React, { useState } from "react";

import './PostCard.css';
import {
  Card,
  CardBody,
  CardTitle,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  CardImg,
} from "reactstrap";

const PostCard = ({ title, content, imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState("");

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleSend = () => {
    console.log("Comment sent:", comment);
    setComment("");
    toggleModal();
  };

  return (
    <>
      <Card className="mb-4">
        {imageUrl && (
          <CardImg
            top
            width="100%"
            src={imageUrl}
            alt="Post image"
            style={{ maxHeight: "300px", objectFit: "cover" }}
          />
        )}
        <CardBody>
          <CardTitle tag="h5">{title}</CardTitle>
          <p>{content}</p>
          <div className="d-flex gap-2">
            <Button color="danger" size="sm">Like</Button>
            <Button color="info" size="sm" onClick={toggleModal}>Comment</Button>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Add a Comment</ModalHeader>
        <ModalBody>
          <Input
            type="textarea"
            placeholder="Write your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <div className="text-end mt-3">
            <Button color="primary" onClick={handleSend} disabled={!comment.trim()}>
              Send
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default PostCard;
