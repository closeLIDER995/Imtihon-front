import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import AppNavbar from '../Components/Navbar';
import PostCard from '../Components/PostCard';

const posts = [
  { id: 1, title: 'Hello', content: 'First post', author: 'John' },
  { id: 2, title: 'React is fun', content: 'I love coding', author: 'Ali' },
];

const Feed = () => (
  <>
    <AppNavbar />
    <Container className="mt-4">
      <h2 className="text-center mb-4">SocialApp</h2>
      <div className="text-center mb-3">
        <a href="/post" className="btn btn-primary">Create Post</a>
      </div>
      <Row>
        {posts.map(post => (
          <Col md="4" key={post.id}>
            <PostCard {...post} />
          </Col>
        ))}
      </Row>
    </Container>
  </>
);

export default Feed;
