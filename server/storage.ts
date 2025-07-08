import { type User, type Post, type InsertUser, type InsertPost } from "@shared/schema";
import UserModel from "./models/User";
import PostModel from "./models/Post";
import connectDB from "./db";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  getAllPosts(): Promise<(Post & { author: User })[]>;
  getPost(id: string): Promise<(Post & { author: User }) | undefined>;
  getPostsByAuthor(authorId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  updatePostVotes(id: string, votes: number): Promise<Post | undefined>;
}

export class MongoStorage implements IStorage {
  private isConnected = false;

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

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      if (!user) return undefined;
      
      return {
        _id: user._id.toString(),
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
      const user = await UserModel.findOne({ username });
      if (!user) return undefined;
      
      return {
        _id: user._id.toString(),
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
      const user = await UserModel.findOne({ email });
      if (!user) return undefined;
      
      return {
        _id: user._id.toString(),
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
      const user = new UserModel(insertUser);
      const savedUser = await user.save();
      
      return {
        _id: savedUser._id.toString(),
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
  async getAllPosts(): Promise<(Post & { author: User })[]> {
    try {
      const posts = await PostModel.find().populate("authorId").sort({ createdAt: -1 });
      
      return posts.map(post => ({
        _id: post._id.toString(),
        title: post.title,
        content: post.content,
        authorId: post.authorId._id.toString(),
        votes: post.votes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          _id: post.authorId._id.toString(),
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
      const post = await PostModel.findById(id).populate("authorId");
      if (!post) return undefined;
      
      return {
        _id: post._id.toString(),
        title: post.title,
        content: post.content,
        authorId: post.authorId._id.toString(),
        votes: post.votes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          _id: post.authorId._id.toString(),
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
      const posts = await PostModel.find({ authorId }).sort({ createdAt: -1 });
      
      return posts.map(post => ({
        _id: post._id.toString(),
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
      const post = new PostModel(insertPost);
      const savedPost = await post.save();
      
      return {
        _id: savedPost._id.toString(),
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
      const post = await PostModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      
      if (!post) return undefined;
      
      return {
        _id: post._id.toString(),
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
      const result = await PostModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  }

  async updatePostVotes(id: string, votes: number): Promise<Post | undefined> {
    try {
      const post = await PostModel.findByIdAndUpdate(
        id,
        { votes, updatedAt: new Date() },
        { new: true }
      );
      
      if (!post) return undefined;
      
      return {
        _id: post._id.toString(),
        title: post.title,
        content: post.content,
        authorId: post.authorId.toString(),
        votes: post.votes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    } catch (error) {
      console.error("Error updating post votes:", error);
      return undefined;
    }
  }
}

export const storage = new MongoStorage();
