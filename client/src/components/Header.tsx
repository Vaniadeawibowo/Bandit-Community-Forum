import { Button } from "@/components/ui/button";

interface User {
  id: number;
  username: string;
  email: string;
}

interface HeaderProps {
  user: User;
  onCreatePost: () => void;
  onProfileClick: () => void;
}

export default function Header({ user, onCreatePost, onProfileClick }: HeaderProps) {
  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-reddit-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className="fab fa-reddit-alien text-reddit-orange text-2xl"></i>
              <span className="text-xl font-bold text-gray-900">reddit</span>
            </div>
            <div className="hidden md:flex bg-reddit-light-gray rounded-lg px-4 py-2 w-96">
              <i className="fas fa-search text-reddit-gray mr-2 mt-1"></i>
              <input
                type="text"
                placeholder="Search Reddit"
                className="bg-transparent outline-none flex-1"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={onCreatePost}
              className="bg-reddit-orange text-white hover:bg-orange-600 rounded-full"
            >
              <i className="fas fa-plus mr-2"></i>Create Post
            </Button>
            <div className="relative">
              <button
                onClick={onProfileClick}
                className="flex items-center space-x-2 bg-reddit-light-gray px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <div className="w-8 h-8 bg-reddit-orange rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getUserInitials(user.username)}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user.username}
                </span>
                <i className="fas fa-chevron-down text-xs text-reddit-gray"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
