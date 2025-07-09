import { type User, type Post, type Comment, type InsertUser, type InsertPost, type InsertComment } from "@shared/schema";
import UserModel from "./models/User";
import PostModel from "./models/Post";
import CommentModel from "./models/Comment";
import VoteModel from "./models/Vote";
import connectDB from "./db";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  getAllPosts(): Promise<(Post & { author: User })[]>;
  getAllPostsWithUserVotes(userId?: string): Promise<(Post & { author: User })[]>;
  getPost(id: string): Promise<(Post & { author: User }) | undefined>;
  getPostsByAuthor(authorId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  votePost(postId: string, userId: string, voteType: number): Promise<(Post & { author: User }) | undefined>;
  
  // Comment methods
  getCommentsByPost(postId: string): Promise<(Comment & { author: User })[]>;
  getCommentsByPostWithUserVotes(postId: string, userId?: string): Promise<(Comment & { author: User })[]>;
  getComment(id: string): Promise<(Comment & { author: User }) | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, updates: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;
  voteComment(commentId: string, userId: string, voteType: number): Promise<(Comment & { author: User }) | undefined>;
}

export class MongoStorage implements IStorage {
  private isConnected = false;
  private memoryStorage = new Map<string, any>();
  private userCounter = 1;
  private postCounter = 1;

  constructor() {
    this.initConnection();
  }

  private async initConnection() {
    try {
      await connectDB();
      this.isConnected = true;
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.warn("MongoDB connection failed, using in-memory storage:", error instanceof Error ? error.message : error);
      this.isConnected = false;
    }
  }

  private async ensureConnection() {
    if (!this.isConnected) {
      await this.initConnection();
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      await this.ensureConnection();
      const user = await UserModel.findById(id);
      if (!user) return undefined;
      
      return {
        _id: user._id.toString(),
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      await this.ensureConnection();
      const user = await UserModel.findOne({ username });
      if (!user) return undefined;
      
      return {
        _id: user._id.toString(),
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      await this.ensureConnection();
      const user = await UserModel.findOne({ email });
      if (!user) return undefined;
      
      return {
        _id: user._id.toString(),
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      await this.ensureConnection();
      const user = new UserModel(insertUser);
      const savedUser = await user.save();
      
      return {
        _id: savedUser._id.toString(),
        id: savedUser._id.toString(),
        username: savedUser.username,
        password: savedUser.password,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Post methods
  async getAllPostsWithUserVotes(userId?: string): Promise<(Post & { author: User })[]> {
    try {
      await this.ensureConnection();
      const posts = await PostModel.find().populate("authorId").sort({ createdAt: -1 });
      
      const postsWithVotes = await Promise.all(posts.map(async (post) => {
        let userVote = 0;
        if (userId) {
          const vote = await VoteModel.findOne({ userId, targetId: post._id, targetType: 'Post' });
          userVote = vote ? vote.voteType : 0;
        }
        
        return {
          _id: post._id.toString(),
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          authorId: post.authorId._id.toString(),
          votes: post.votes,
          userVote,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          author: {
            _id: post.authorId._id.toString(),
            id: post.authorId._id.toString(),
            username: post.authorId.username,
            password: post.authorId.password,
            email: post.authorId.email,
            createdAt: post.authorId.createdAt,
          },
        };
      }));
      
      return postsWithVotes;
    } catch (error) {
      console.error("Error getting posts with user votes:", error);
      return [];
    }
  }

  async getAllPosts(): Promise<(Post & { author: User })[]> {
    try {
      await this.ensureConnection();
      const posts = await PostModel.find().populate("authorId").sort({ createdAt: -1 });
      
      return posts.map(post => ({
        _id: post._id.toString(),
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        authorId: post.authorId._id.toString(),
        votes: post.votes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          _id: post.authorId._id.toString(),
          id: post.authorId._id.toString(),
          username: post.authorId.username,
          password: post.authorId.password,
          email: post.authorId.email,
          createdAt: post.authorId.createdAt,
        },
      }));
    } catch (error) {
      console.error("Error getting all posts:", error);
      return [];
    }
  }

  async getPost(id: string): Promise<(Post & { author: User }) | undefined> {
    try {
      await this.ensureConnection();
      const post = await PostModel.findById(id).populate("authorId");
      if (!post) return undefined;
      
      return {
        _id: post._id.toString(),
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        authorId: post.authorId._id.toString(),
        votes: post.votes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          _id: post.authorId._id.toString(),
          id: post.authorId._id.toString(),
          username: post.authorId.username,
          password: post.authorId.password,
          email: post.authorId.email,
          createdAt: post.authorId.createdAt,
        },
      };
    } catch (error) {
      console.error("Error getting post:", error);
      return undefined;
    }
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    try {
      await this.ensureConnection();
      const posts = await PostModel.find({ authorId }).sort({ createdAt: -1 });
      
      return posts.map(post => ({
        _id: post._id.toString(),
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        authorId: post.authorId.toString(),
        votes: post.votes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting posts by author:", error);
      return [];
    }
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    try {
      await this.ensureConnection();
      const post = new PostModel(insertPost);
      const savedPost = await post.save();
      
      return {
        _id: savedPost._id.toString(),
        id: savedPost._id.toString(),
        title: savedPost.title,
        content: savedPost.content,
        authorId: savedPost.authorId.toString(),
        votes: savedPost.votes,
        createdAt: savedPost.createdAt,
        updatedAt: savedPost.updatedAt,
      };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  async updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined> {
    try {
      await this.ensureConnection();
      const post = await PostModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      
      if (!post) return undefined;
      
      return {
        _id: post._id.toString(),
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        authorId: post.authorId.toString(),
        votes: post.votes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    } catch (error) {
      console.error("Error updating post:", error);
      return undefined;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      const result = await PostModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  }

  async votePost(postId: string, userId: string, voteType: number): Promise<(Post & { author: User }) | undefined> {
    try {
      await this.ensureConnection();
      
      // Remove existing vote if any
      await VoteModel.findOneAndDelete({ userId, targetId: postId, targetType: 'Post' });
      
      // Add new vote if not removing (voteType !== 0)
      if (voteType !== 0) {
        await VoteModel.create({ userId, targetId: postId, targetType: 'Post', voteType });
      }
      
      // Calculate total votes
      const upvotes = await VoteModel.countDocuments({ targetId: postId, targetType: 'Post', voteType: 1 });
      const downvotes = await VoteModel.countDocuments({ targetId: postId, targetType: 'Post', voteType: -1 });
      const totalVotes = upvotes - downvotes;
      
      // Update post votes without triggering updatedAt
      const post = await PostModel.findByIdAndUpdate(
        postId,
        { $set: { votes: totalVotes } },
        { new: true, timestamps: false }
      ).populate('authorId');
      
      if (!post) return undefined;
      
      return {
        _id: post._id.toString(),
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        authorId: post.authorId._id.toString(),
        votes: post.votes,
        userVote: voteType,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          _id: post.authorId._id.toString(),
          id: post.authorId._id.toString(),
          username: post.authorId.username,
          password: post.authorId.password,
          email: post.authorId.email,
          createdAt: post.authorId.createdAt,
        },
      };
    } catch (error) {
      console.error("Error voting on post:", error);
      return undefined;
    }
  }

  // Comment methods
  async getCommentsByPostWithUserVotes(postId: string, userId?: string): Promise<(Comment & { author: User })[]> {
    try {
      await this.ensureConnection();
      console.log('Fetching comments for postId:', postId);
      const comments = await CommentModel.find({ postId }).populate("authorId").sort({ createdAt: -1 });
      console.log('Found comments:', comments.length);
      
      const commentsWithVotes = await Promise.all(comments.map(async (comment) => {
        let userVote = 0;
        if (userId) {
          const vote = await VoteModel.findOne({ userId, targetId: comment._id, targetType: 'Comment' });
          userVote = vote ? vote.voteType : 0;
        }
        
        const author = comment.authorId as any;
        return {
          _id: (comment._id as any).toString(),
          id: (comment._id as any).toString(),
          content: comment.content,
          authorId: author._id.toString(),
          postId: comment.postId.toString(),
          votes: comment.votes,
          userVote,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          author: {
            _id: author._id.toString(),
            id: author._id.toString(),
            username: author.username,
            password: author.password,
            email: author.email,
            createdAt: author.createdAt,
          },
        };
      }));
      
      return commentsWithVotes;
    } catch (error) {
      console.error("Error getting comments with user votes:", error);
      return [];
    }
  }

  async getComment(id: string): Promise<(Comment & { author: User }) | undefined> {
    try {
      await this.ensureConnection();
      const comment = await CommentModel.findById(id).populate("authorId");
      if (!comment) return undefined;
      
      const author = comment.authorId as any;
      return {
        _id: (comment._id as any).toString(),
        id: (comment._id as any).toString(),
        content: comment.content,
        authorId: author._id.toString(),
        postId: comment.postId.toString(),
        votes: comment.votes,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          _id: author._id.toString(),
          id: author._id.toString(),
          username: author.username,
          password: author.password,
          email: author.email,
          createdAt: author.createdAt,
        },
      };
    } catch (error) {
      console.error("Error getting comment:", error);
      return undefined;
    }
  }

  async getCommentsByPost(postId: string): Promise<(Comment & { author: User })[]> {
    try {
      await this.ensureConnection();
      const comments = await CommentModel.find({ postId }).populate("authorId").sort({ createdAt: -1 });
      
      return comments.map(comment => {
        const author = comment.authorId as any;
        return {
          _id: (comment._id as any).toString(),
          id: (comment._id as any).toString(),
          content: comment.content,
          authorId: author._id.toString(),
          postId: comment.postId.toString(),
          votes: comment.votes,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          author: {
            _id: author._id.toString(),
            id: author._id.toString(),
            username: author.username,
            password: author.password,
            email: author.email,
            createdAt: author.createdAt,
          },
        };
      });
    } catch (error) {
      console.error("Error getting comments:", error);
      return [];
    }
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    try {
      await this.ensureConnection();
      const comment = new CommentModel({
        ...insertComment,
        postId: insertComment.postId // MongoDB will auto-convert string to ObjectId
      });
      const savedComment = await comment.save();
      
      return {
        _id: (savedComment._id as any).toString(),
        id: (savedComment._id as any).toString(),
        content: savedComment.content,
        authorId: savedComment.authorId.toString(),
        postId: savedComment.postId.toString(),
        votes: savedComment.votes,
        createdAt: savedComment.createdAt,
        updatedAt: savedComment.updatedAt,
      };
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  async updateComment(id: string, updates: Partial<InsertComment>): Promise<Comment | undefined> {
    try {
      await this.ensureConnection();
      const comment = await CommentModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      
      if (!comment) return undefined;
      
      return {
        _id: (comment._id as any).toString(),
        id: (comment._id as any).toString(),
        content: comment.content,
        authorId: comment.authorId.toString(),
        postId: comment.postId.toString(),
        votes: comment.votes,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    } catch (error) {
      console.error("Error updating comment:", error);
      return undefined;
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      const result = await CommentModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error("Error deleting comment:", error);
      return false;
    }
  }

  async voteComment(commentId: string, userId: string, voteType: number): Promise<(Comment & { author: User }) | undefined> {
    try {
      await this.ensureConnection();
      
      // Remove existing vote if any
      await VoteModel.findOneAndDelete({ userId, targetId: commentId, targetType: 'Comment' });
      
      // Add new vote if not removing (voteType !== 0)
      if (voteType !== 0) {
        await VoteModel.create({ userId, targetId: commentId, targetType: 'Comment', voteType });
      }
      
      // Calculate total votes
      const upvotes = await VoteModel.countDocuments({ targetId: commentId, targetType: 'Comment', voteType: 1 });
      const downvotes = await VoteModel.countDocuments({ targetId: commentId, targetType: 'Comment', voteType: -1 });
      const totalVotes = upvotes - downvotes;
      
      // Update comment votes without triggering updatedAt
      const comment = await CommentModel.findByIdAndUpdate(
        commentId,
        { $set: { votes: totalVotes } },
        { new: true, timestamps: false }
      ).populate('authorId');
      
      if (!comment) return undefined;
      
      const author = comment.authorId as any;
      return {
        _id: (comment._id as any).toString(),
        id: (comment._id as any).toString(),
        content: comment.content,
        authorId: author._id.toString(),
        postId: comment.postId.toString(),
        votes: comment.votes,
        userVote: voteType,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          _id: author._id.toString(),
          id: author._id.toString(),
          username: author.username,
          password: author.password,
          email: author.email,
          createdAt: author.createdAt,
        },
      };
    } catch (error) {
      console.error("Error voting on comment:", error);
      return undefined;
    }
  }
}

export const storage = new MongoStorage();
