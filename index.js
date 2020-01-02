require("dotenv").config();

const PORT = 9002;
const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const { Post, Comment } = require("./models");

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
    postsV1: [Post]
    postsV2: [Post]
  }
`;

const allPostsV1 = async () => {
  let allPosts = await Post.findAll();
  let allComments = await Comment.findAll();
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

const allPostsV2 = async () => {
  let posts = await Post.findAll();
  return posts;
};

const resolvers = {
  Post: {
    comments: async parent => {
      const comment = await Comment.findAll({ where: { postId: parent.id } });
      return comment;
    }
  },
  Query: {
    postsV1: async () => await allPostsV1(),
    postsV2: async () => await allPostsV2()
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

// The `listen` method launches a web server.
server.listen(PORT).then(({ url }) => {
  console.log(`🚀 PostsAndComments Service ready at ${url}`);
});
