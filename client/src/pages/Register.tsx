import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link } from "wouter";
import { RootState, AppDispatch } from "../store/store";
import { register, clearError } from "../store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Spinner from "../components/Spinner";

export default function Register() {
  const [, setLocation] = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    if (username && email && password) {
      dispatch(register({ username, email, password }));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-reddit-light-gray flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <i className="fab fa-reddit-alien text-reddit-orange text-4xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
          <p className="text-reddit-gray mt-2">
            By continuing, you agree to our User Agreement and Privacy Policy
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            {password !== confirmPassword && confirmPassword && (
              <div className="text-red-600 text-sm">Passwords do not match</div>
            )}
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-reddit-orange hover:bg-orange-600"
              disabled={isLoading || password !== confirmPassword}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-reddit-gray">
              Already a bandditor?{" "}
              <Link href="/login" className="text-reddit-blue hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
