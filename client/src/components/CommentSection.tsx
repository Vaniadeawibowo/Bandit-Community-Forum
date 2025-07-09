import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, ChevronUp, ChevronDown, Edit, Trash2 } from "lucide-react";
import { AppDispatch, RootState } from "../store/store";
import { fetchComments, createComment, voteComment, updateComment, deleteComment } from "../store/commentsSlice";

interface User {
  id: string;
  username: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  votes: number;
  createdAt: string;
  updatedAt: string;
  author: User;
}

interface CommentSectionProps {
  postId: string;
  user: User | null;
}

export default function CommentSection({ postId, user }: CommentSectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { comments: allComments, isLoading } = useSelector((state: RootState) => state.comments);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  const comments = allComments[postId] || [];
  
  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    await dispatch(createComment({ postId, content: commentText }));
    setCommentText("");
    setShowCommentForm(false);
  };
  
  const handleVote = (comment: Comment, voteType: number) => {
    const newVote = comment.userVote === voteType ? 0 : voteType;
    const voteChange = newVote - (comment.userVote || 0);
    dispatch(voteComment({ id: comment.id, votes: comment.votes + voteChange, voteType: newVote, postId }));
  };
  
  const handleDelete = (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      dispatch(deleteComment({ id: commentId, postId }));
    }
  };
  
  const handleEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
  };
  
  const handleUpdateComment = (commentId: string) => {
    if (!editText.trim()) return;
    dispatch(updateComment({ id: commentId, content: editText, postId }));
    setEditingComment(null);
    setEditText("");
  };
  
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText("");
  };
  
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="border-t border-reddit-border mt-4 pt-4">
      {/* Comment Form */}
      {user && (
        <div className="mb-4">
          {!showCommentForm ? (
            <button
              onClick={() => setShowCommentForm(true)}
              className="w-full text-left p-3 bg-input rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              What are your thoughts?
            </button>
          ) : (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What are your thoughts?"
                className="min-h-[100px] resize-none"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCommentForm(false);
                    setCommentText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-reddit-orange hover:bg-orange-600"
                  disabled={!commentText.trim()}
                >
                  Comment
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            {/* Vote Section */}
            <div className="flex flex-col items-center space-y-1">
              <button 
                onClick={() => handleVote(comment, 1)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <ChevronUp size={16} className={`transition-colors ${
                  comment.userVote === 1 
                    ? 'text-red-500' 
                    : 'text-muted-foreground hover:text-red-500'
                }`} />
              </button>
              <span className={`text-xs font-medium ${
                comment.votes > 0 ? 'text-red-500' : 
                comment.votes < 0 ? 'text-blue-500' : 'text-muted-foreground'
              }`}>
                {comment.votes}
              </span>
              <button 
                onClick={() => handleVote(comment, -1)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <ChevronDown size={16} className={`transition-colors ${
                  comment.userVote === -1 
                    ? 'text-blue-500' 
                    : 'text-muted-foreground hover:text-blue-500'
                }`} />
              </button>
            </div>

            {/* Comment Content */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-foreground">u/{comment.author.username}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                {comment.createdAt !== comment.updatedAt && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">Edited</span>
                  </>
                )}
              </div>
              
              {editingComment === comment.id ? (
                <div className="mb-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[80px] resize-none mb-2"
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateComment(comment.id)}
                      className="bg-reddit-orange hover:bg-orange-600"
                      disabled={!editText.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground mb-2">{comment.content}</p>
              )}
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle size={12} />
                  <span>Reply</span>
                </button>
                {user && user.id === comment.authorId && editingComment !== comment.id && (
                  <>
                    <button 
                      onClick={() => handleEdit(comment)}
                      className="text-muted-foreground hover:text-reddit-blue transition-colors"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-4 text-muted-foreground">
          <p>Loading comments...</p>
        </div>
      )}
      
      {!isLoading && comments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
          <p>No comments yet</p>
          <p className="text-sm">Be the first to share what you think!</p>
        </div>
      )}
    </div>
  );
}