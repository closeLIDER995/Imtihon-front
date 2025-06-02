import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Form, Input, Button } from 'reactstrap';

const CommentModal = ({
  isOpen,
  toggle,
  post,
  onCommentSubmit,
  onCommentDelete,
  onCommentUpdate,
}) => {
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    setCommentText('');
    setCommentError(null);
    setEditingCommentId(null);
    setEditingCommentText('');
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setCommentError('Komment bo‘sh bo‘lmasligi kerak!');
      return;
    }
    setCommentError(null);
    try {
      await onCommentSubmit(post._id, commentText);
      setCommentText('');
    } catch (err) {
      setCommentError('Komment yuborishda xatolik');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Kommentni o‘chirishni xohlaysizmi?")) return;
    try {
      await onCommentDelete(post._id, commentId);
    } catch (err) {
      setCommentError('Komment o‘chirishda xatolik');
    }
  };

  const handleEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.text);
  };

  const handleUpdate = async () => {
    if (!editingCommentText.trim()) {
      setCommentError('Komment bo‘sh bo‘lmasligi kerak!');
      return;
    }
    try {
      await onCommentUpdate(post._id, editingCommentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText('');
      setCommentError(null);
    } catch (err) {
      setCommentError('Komment tahrirlashda xatolik');
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Kommentlar</ModalHeader>
      <ModalBody>
        <div>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <div key={comment._id} className="mb-3 p-2 border rounded">
                <div>
                  <b>{comment.userId?.username || 'Anonim'}</b>:
                  {editingCommentId === comment._id ? (
                    <>
                      <Input
                        type="text"
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="my-2"
                      />
                      <Button size="sm" color="success" onClick={handleUpdate} className="me-2">
                        Saqlash
                      </Button>
                      <Button
                        size="sm"
                        color="secondary"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Bekor qilish
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="ms-2">{comment.text}</span>
                      {comment.userId?._id === userId && (
                        <>
                          <Button
                            size="sm"
                            color="warning"
                            className="ms-2"
                            onClick={() => handleEdit(comment)}
                          >
                            Tahrirlash
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            className="ms-2"
                            onClick={() => handleDelete(comment._id)}
                          >
                            O‘chirish
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div style={{ fontSize: '0.8em', color: '#888' }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div>Komentlar yo‘q</div>
          )}
        </div>
        <Form className="d-flex mt-2" onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Komment yozing..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="me-2"
          />
          <Button color="primary" type="submit">
            Yuborish
          </Button>
        </Form>
        {commentError && <div className="text-danger mt-2">{commentError}</div>}
      </ModalBody>
    </Modal>
  );
};

export default CommentModal;