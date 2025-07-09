import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertCommentSchema, loginUserSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        user: { id: user._id, username: user.username, email: user.email },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        user: { id: user._id, username: user.username, email: user.email },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ id: user._id, username: user.username, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Posts routes
  app.get("/api/posts", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.userId;
      const posts = await storage.getAllPostsWithUserVotes(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse({
        ...req.body,
        authorId: req.user.userId,
      });

      const post = await storage.createPost(validatedData);
      const postWithAuthor = await storage.getPost(post._id);
      
      res.status(201).json(postWithAuthor);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.put("/api/posts/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.authorId !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized to edit this post" });
      }

      const validatedData = insertPostSchema.omit({ authorId: true }).parse(req.body);
      const updatedPost = await storage.updatePost(id, validatedData);
      const postWithAuthor = await storage.getPost(id);
      
      res.json(postWithAuthor);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.authorId !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }

      await storage.deletePost(id);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts/:id/vote", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const { voteType } = req.body;
      const userId = req.user.userId;
      
      const updatedPost = await storage.votePost(id, userId, voteType);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Comment routes
  app.get("/api/posts/:postId/comments", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user?.userId;
      const comments = await storage.getCommentsByPostWithUserVotes(postId, userId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts/:postId/comments", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.userId;
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        authorId: userId,
        postId,
      });
      
      const comment = await storage.createComment(validatedData);
      // Fetch the complete comment with author and vote data
      const comments = await storage.getCommentsByPostWithUserVotes(postId, userId);
      const fullComment = comments.find(c => c.id === comment.id);
      
      res.status(201).json(fullComment || comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.put("/api/comments/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Check if user owns the comment
      const comment = await storage.getComment(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      if (comment.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this comment" });
      }
      
      const validatedData = insertCommentSchema.omit({ authorId: true, postId: true }).parse(req.body);
      const updatedComment = await storage.updateComment(id, validatedData);
      
      if (!updatedComment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Fetch the complete comment with author data
      const fullComment = await storage.getComment(id);
      res.json(fullComment || updatedComment);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.delete("/api/comments/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Get the specific comment to check ownership
      const comment = await storage.getComment(id);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      if (comment.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      
      const success = await storage.deleteComment(id);
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/comments/:id/vote", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { voteType } = req.body;
      const userId = req.user.userId;
      
      const updatedComment = await storage.voteComment(id, userId, voteType);
      if (!updatedComment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json(updatedComment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
