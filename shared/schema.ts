import { z } from "zod";

// MongoDB schemas using Zod
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  email: z.string().email(),
});

export const insertPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  authorId: z.string(),
});

export const loginUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

// MongoDB document types
export interface User {
  _id: string;
  id: string;
  username: string;
  password: string;
  email: string;
  createdAt: Date;
}

export interface Post {
  _id: string;
  id: string;
  title: string;
  content: string;
  authorId: string;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}
