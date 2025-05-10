import React from 'react';
import { Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';

const PostCard = ({ title, content, author }) => (
  <Card className="mb-4">
    <CardBody>
      <CardTitle tag="h5">{title}</CardTitle>
      <CardText>{content}</CardText>
      <CardText><small className="text-muted">By {author}</small></CardText>
      <Button color="primary">Like</Button>
    </CardBody>
  </Card>
);

export default PostCard;
