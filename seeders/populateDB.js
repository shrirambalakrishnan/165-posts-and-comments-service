"use strict";

const { Post, Comment } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let posts = [{ text: "Watch Avengers" }, { text: "Follow Marvel" }];
    let comments = [
      { text: "Yes" },
      { text: "We will" },
      { text: "No we wont" }
    ];

    let post0 = await Post.create(posts[0]);
    let post1 = await Post.create(posts[1]);

    let comment0 = comments[0];
    let comment1 = comments[1];
    let comment2 = comments[2];

    let comment0_hash = { ...comment0, postId: post0.id };
    let comment1_hash = { ...comment1, postId: post0.id };
    let comment2_hash = { ...comment2, postId: post1.id };

    let comment0Object = await Comment.create(comment0_hash);
    let comment1Object = await Comment.create(comment1_hash);
    let comment2Object = await Comment.create(comment2_hash);

    return { status: true };
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete("Post", null, {});
    queryInterface.bulkDelete("Comment", null, {});
    return { status: false };
  }
};
