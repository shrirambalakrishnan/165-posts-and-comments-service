const PORT = 9002;
const { ApolloServer, gql } = require("apollo-server");

// Posts dataset
const posts = [
  {
    id: 1,
    text: "Watch Avengers!"
  },
  {
    id: 2,
    text: "Iron Man rocks!!"
  }
];

const comments = [
  {
    id: 1,
    text: "Yes, we will!",
    postId: 1
  },
  {
    id: 2,
    text: "Definitely",
    postId: 1
  },
  {
    id: 3,
    text: "No, Jarvis rocks!",
    postId: 2
  }
];

const typeDefs = gql`
  type Comment {
    id: ID
    text: String
  }

  type Post {
    id: ID
    text: String
    comments: [Comment]
  }

  type Query {
    posts: [Post]
  }
`;

const allPosts = async () => {
  let allPosts = posts;
  let allComments = comments;
  let postsWithComments;

  await Promise.all(
    (postsWithComments = allPosts.map(post => {
      let currentPostComments = allComments.filter(comment => {
        if (comment.postId == post.id) return comment;
      });

      post.comments = currentPostComments;

      return post;
    }))
  );

  return postsWithComments;
};

const resolvers = {
  Query: {
    posts: async () => await allPosts()
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(PORT).then(({ url }) => {
  console.log(`🚀 PostsAndComments Service ready at ${url}`);
});
