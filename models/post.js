"use strict";
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      text: DataTypes.STRING
    },
    {}
  );
  Post.associate = function(models) {
    // associations can be defined here
    Post.hasMany(models.Comment);
  };
  return Post;
};
