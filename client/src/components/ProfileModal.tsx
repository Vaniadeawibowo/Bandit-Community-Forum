import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { logout } from "../store/authSlice";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  username: string;
  email: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="p-6 border-b border-reddit-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-reddit-orange rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {getUserInitials(user.username)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{user.username}</h3>
              <p className="text-sm text-reddit-gray">u/{user.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">0</div>
              <div className="text-xs text-reddit-gray">Posts</div>
            </div>
            <div>
              <div className="text-lg font-semibold">0</div>
              <div className="text-xs text-reddit-gray">Karma</div>
            </div>
            <div>
              <div className="text-lg font-semibold">0d</div>
              <div className="text-xs text-reddit-gray">Cake Day</div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <button className="w-full flex items-center space-x-3 p-3 hover:bg-reddit-light-gray rounded-lg transition-colors">
            <i className="fas fa-user text-reddit-gray"></i>
            <span>My Profile</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 hover:bg-reddit-light-gray rounded-lg transition-colors">
            <i className="fas fa-cog text-reddit-gray"></i>
            <span>User Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 hover:bg-reddit-light-gray rounded-lg transition-colors">
            <i className="fas fa-moon text-reddit-gray"></i>
            <span>Dark Mode</span>
          </button>
          <hr className="border-reddit-border" />
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 text-red-600 justify-start"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Log Out</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
