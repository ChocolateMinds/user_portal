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
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { userApi } from "@/lib/userApiService"; // Updated import

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await userApi.auth.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        // role: "user" is handled by userApiService
      });
      console.log("User Registration successful:", response);
      setIsSuccess(true);
      // setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      console.error("User Registration failed:", err);
      setError(err.message || "An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900 dark:to-blue-900">
        <Card className="w-full max-w-md shadow-2xl text-center bg-white dark:bg-gray-800 p-8">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Registration Successful!</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 mt-2 mb-6">
            Your account has been created. Welcome aboard!
          </CardDescription>
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">Proceed to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900 dark:to-blue-900 py-12">
      <Card className="w-full max-w-lg shadow-2xl bg-white dark:bg-gray-800">
        <CardHeader className="space-y-1 text-center pt-8">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">Create Your Account</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Join us to discover exclusive empty leg flights.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-6 px-8 py-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Registration Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-200">First Name</Label>
                <Input id="firstName" placeholder="Alex" required value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isLoading} className="bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-200">Last Name</Label>
                <Input id="lastName" placeholder="Skywalker" required value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isLoading} className="bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
              <Input id="email" type="email" placeholder="alex.skywalker@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
              <Input id="password" type="password" required placeholder="Choose a strong password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col px-8 pb-8">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

