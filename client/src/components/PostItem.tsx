import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { deletePost, votePost } from "../store/postsSlice";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, MessageCircle, Share, Bookmark, Edit, Trash2 } from "lucide-react";
import CreatePostModal from "./CreatePostModal";

interface User {
  id: string;
  username: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  votes: number;
  createdAt: string;
  updatedAt: string;
  author: User;
}

interface PostItemProps {
  post: Post;
  currentUser: User;
}

export default function PostItem({ post, currentUser }: PostItemProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleUpvote = () => {
    dispatch(votePost({ id: post.id, votes: post.votes + 1 }));
  };

  const handleDownvote = () => {
    dispatch(votePost({ id: post.id, votes: post.votes - 1 }));
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch(deletePost(post.id));
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getSnippet = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-reddit-border hover:border-gray-500 transition-all">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Vote Section */}
            <div className="flex flex-col items-center space-y-1 min-w-0">
              <button
                onClick={handleUpvote}
                className="text-muted-foreground hover:text-reddit-orange transition-colors"
              >
                <ArrowUp size={18} />
              </button>
              <span className="text-sm font-medium text-foreground">{post.votes}</span>
              <button
                onClick={handleDownvote}
                className="text-muted-foreground hover:text-reddit-blue transition-colors"
              >
                <ArrowDown size={18} />
              </button>
            </div>

            {/* Post Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                <span>b/programming</span>
                <span>•</span>
                <span>Posted by</span>
                <span>u/{post.author.username}</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2 cursor-pointer hover:text-reddit-blue">
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                {getSnippet(post.content)}
              </p>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle size={14} />
                  <span className="text-sm">0 comments</span>
                </button>
                <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                  <Share size={14} />
                  <span className="text-sm">Share</span>
                </button>
                <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                  <Bookmark size={14} />
                  <span className="text-sm">Save</span>
                </button>
                
                {/* Owner Actions */}
                {currentUser.id === post.authorId && (
                  <div className="flex items-center space-x-2 ml-auto">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-muted-foreground hover:text-reddit-blue transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editPost={post}
      />
    </>
  );
}
