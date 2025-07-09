import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import { RootState, AppDispatch } from "../store/store";
import { checkAuth } from "../store/authSlice";
import { fetchPosts } from "../store/postsSlice";
import Header from "../components/Header";
import PostItem from "../components/PostItem";
import CreatePostModal from "../components/CreatePostModal";
import ProfileModal from "../components/ProfileModal";
import Spinner from "../components/Spinner";

export default function Home() {
  const [, setLocation] = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { posts, isLoading } = useSelector((state: RootState) => state.posts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(checkAuth());
    } else {
      setLocation("/login");
    }
  }, [token, dispatch, setLocation]);

  useEffect(() => {
    if (user) {
      dispatch(fetchPosts());
    }
  }, [user?.id, dispatch]);
  
  // Always fetch posts when component mounts with a user
  useEffect(() => {
    if (user && token) {
      dispatch(fetchPosts());
    }
  }, [token, dispatch]);

  if (!user) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onCreatePost={() => setIsCreateModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Feed */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="bg-card rounded-lg border border-reddit-border p-8 text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                    <p className="text-reddit-gray">Be the first to create a post!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostItem key={post.id} post={post} currentUser={user} />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Create Post Card */}
              <div className="bg-card rounded-lg border border-reddit-border p-4">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Create a post</h3>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full bg-reddit-orange text-white py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />Create Post
                </button>
              </div>

              {/* Popular Communities */}
              <div className="bg-card rounded-lg border border-reddit-border p-4">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Popular Communities</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                    <div className="w-8 h-8 bg-reddit-orange rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">b/programming</p>
                      <p className="text-xs text-muted-foreground">2.1M members</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                    <div className="w-8 h-8 bg-reddit-blue rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">J</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">b/javascript</p>
                      <p className="text-xs text-muted-foreground">1.8M members</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">W</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">b/webdev</p>
                      <p className="text-xs text-muted-foreground">1.3M members</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
      />
    </div>
  );
}
