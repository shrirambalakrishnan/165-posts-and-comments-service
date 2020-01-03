require("dotenv").config();

const PORT = 9002;
const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const DataLoader = require("dataloader");

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
  // Post: {
  //   comments: async parent => {
  //     const comment = await Comment.findAll({ where: { postId: parent.id } });
  //     return comment;
  //   }
  // },
  Post: {
    comments: async (parent, args, ctx) => {
      return ctx.commentsLoader.load(parent.id);
    }
  },
  Query: {
    postsV1: async () => await allPostsV1(),
    postsV2: async () => await allPostsV2()
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return {
      commentsLoader: new DataLoader(async keys => {
        const comments = await Comment.findAll({ where: { postId: keys } });

        const commentsMap = {};

        comments.forEach(comment => {
          if (commentsMap[comment.postId])
            commentsMap[comment.postId].push(comment);
          else commentsMap[comment.postId] = [comment];
        });

        console.log(`----------- commentsMap --------------`);
        console.log(JSON.stringify(commentsMap));
        console.log(`-------------------------------`);

        return keys.map(key => commentsMap[key]);
      })
    };
  }
});

// The `listen` method launches a web server.
server.listen(PORT).then(({ url }) => {
  console.log(`🚀 PostsAndComments Service ready at ${url}`);
});
