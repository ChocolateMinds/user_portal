"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { userApi } from "@/lib/userApiService"; // Updated import

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.auth.login({ email, password });
      console.log("User Login successful:", response);
      // Assuming token is stored in localStorage by auth.login
      router.push("/"); // Redirect to homepage or user dashboard
    } catch (err: any) {
      console.error("User Login failed:", err);
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900 dark:to-blue-900">
      <Card className="w-full max-w-sm shadow-2xl bg-white dark:bg-gray-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">Welcome Back!</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Sign in to find your next private jet experience.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 px-8 py-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your.email@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
                {/* <Link
                  href="#" // Add forgot password link if needed
                  className="ml-auto inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Forgot your password?
                </Link> */}
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col px-8 pb-8">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              New to Empty Legs?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

