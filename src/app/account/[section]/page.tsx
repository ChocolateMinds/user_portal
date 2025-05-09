"use client";

import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, Briefcase, Heart, Bell, Edit3, LogOut, Loader2, AlertTriangle, Ticket, Settings, Trash2, Eye } from "lucide-react";
import { userApi } from "@/lib/userApiService";
import { format } from 'date-fns';

// Interfaces (can be moved to a types file)
interface UserProfile {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture_url?: string;
  created_at: string;
}

interface Booking {
  id: string;
  flight_id: string;
  flight_number: string; // Added for display
  departure_airport: string; // Added for display
  arrival_airport: string; // Added for display
  departure_datetime: string; // Added for display
  seats_booked: number;
  total_price: number;
  booking_status: string;
  booked_at: string;
}

interface FavouriteFlight {
  id: string;
  flight_id: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_datetime: string;
  reduced_price: number;
  added_at: string;
}

interface AlertSubscription {
  id: string;
  criteria: any; // e.g., { departure_city: "NYC", arrival_city: "LON", max_price: 500 }
  email_notifications: boolean;
  created_at: string;
}

function AccountSectionContent() {
  const params = useParams();
  const router = useRouter();
  const section = params.section as string || "profile"; // Default to profile

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favourites, setFavourites] = useState<FavouriteFlight[]>([]);
  const [alerts, setAlerts] = useState<AlertSubscription[]>([]);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingFavourites, setIsLoadingFavourites] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorBookings, setErrorBookings] = useState<string | null>(null);
  const [errorFavourites, setErrorFavourites] = useState<string | null>(null);
  const [errorAlerts, setErrorAlerts] = useState<string | null>(null);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true); setErrorProfile(null);
      try {
        const data = await userApi.users.getProfile();
        setProfile(data.user || data);
        setEditFormData(data.user || data); // Initialize edit form
      } catch (err: any) { setErrorProfile(err.message || "Failed to load profile."); }
      finally { setIsLoadingProfile(false); }
    };

    const fetchBookings = async () => {
      setIsLoadingBookings(true); setErrorBookings(null);
      try {
        const data = await userApi.bookings.listBookings();
        setBookings(data.bookings || []);
      } catch (err: any) { setErrorBookings(err.message || "Failed to load bookings."); }
      finally { setIsLoadingBookings(false); }
    };

    const fetchFavourites = async () => {
      setIsLoadingFavourites(true); setErrorFavourites(null);
      try {
        const data = await userApi.favourites.listFavourites();
        setFavourites(data.favourites || []);
      } catch (err: any) { setErrorFavourites(err.message || "Failed to load favourites."); }
      finally { setIsLoadingFavourites(false); }
    };

    const fetchAlerts = async () => {
      setIsLoadingAlerts(true); setErrorAlerts(null);
      try {
        const data = await userApi.alerts.listAlerts();
        setAlerts(data.alerts || []);
      } catch (err: any) { setErrorAlerts(err.message || "Failed to load alerts."); }
      finally { setIsLoadingAlerts(false); }
    };
    
    // Fetch data based on active tab or all if needed on initial load
    fetchProfile();
    if (section === "bookings") fetchBookings();
    if (section === "favourites") fetchFavourites();
    if (section === "alerts") fetchAlerts();

  }, [section]); // Re-fetch if section changes

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsLoadingProfile(true); setErrorProfile(null);
    try {
      const updatedProfile = await userApi.users.updateProfile(editFormData);
      setProfile(updatedProfile.user || updatedProfile);
      setIsEditingProfile(false);
      // Optionally show a success message
    } catch (err: any) {
      setErrorProfile(err.message || "Failed to update profile.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    try {
        await userApi.auth.logout(); // Assuming an API endpoint for logout
        localStorage.removeItem("authToken"); // Clear token
        router.push("/login");
    } catch (error) {
        console.error("Logout failed:", error);
        // Still redirect even if API call fails, or handle error appropriately
        localStorage.removeItem("authToken");
        router.push("/login");
    }
  };

  const renderLoading = (text: string) => (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="ml-3 text-gray-600 dark:text-gray-300">{text}</p>
    </div>
  );

  const renderError = (message: string | null) => message && (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );

  const renderProfileSection = () => {
    if (isLoadingProfile && !profile) return renderLoading("Loading profile...");
    if (errorProfile && !profile) return renderError(errorProfile);
    if (!profile) return <p className="text-center py-10 text-gray-500 dark:text-gray-400">Profile information not available.</p>;

    return (
      <Card className="shadow-lg bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">My Profile</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Manage your personal information.</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)} className="bg-white dark:bg-gray-700 dark:hover:bg-gray-600">
            <Edit3 className="mr-2 h-4 w-4" /> {isEditingProfile ? "Cancel" : "Edit Profile"}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {isEditingProfile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" value={editFormData.username || ""} onChange={handleEditFormChange} className="bg-gray-50 dark:bg-gray-700" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={editFormData.email || ""} onChange={handleEditFormChange} disabled className="bg-gray-200 dark:bg-gray-700 cursor-not-allowed" />
                </div>
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" name="first_name" value={editFormData.first_name || ""} onChange={handleEditFormChange} className="bg-gray-50 dark:bg-gray-700" />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" value={editFormData.last_name || ""} onChange={handleEditFormChange} className="bg-gray-50 dark:bg-gray-700" />
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input id="phone_number" name="phone_number" value={editFormData.phone_number || ""} onChange={handleEditFormChange} className="bg-gray-50 dark:bg-gray-700" />
                </div>
                <div>
                  <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
                  <Input id="profile_picture_url" name="profile_picture_url" value={editFormData.profile_picture_url || ""} onChange={handleEditFormChange} className="bg-gray-50 dark:bg-gray-700" />
                </div>
              </div>
              {errorProfile && renderError(errorProfile)}
              <Button type="submit" disabled={isLoadingProfile} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                {isLoadingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.username} />
                  <AvatarFallback className="text-2xl">{profile.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{profile.first_name || profile.last_name ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : profile.username}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
                </div>
              </div>
              <Separator className="my-4 dark:bg-gray-700" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <p><strong className="text-gray-600 dark:text-gray-300">Username:</strong> {profile.username}</p>
                <p><strong className="text-gray-600 dark:text-gray-300">Phone:</strong> {profile.phone_number || "Not provided"}</p>
                <p><strong className="text-gray-600 dark:text-gray-300">Member Since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderBookingsSection = () => {
    if (isLoadingBookings) return renderLoading("Loading bookings...");
    if (errorBookings) return renderError(errorBookings);
    if (bookings.length === 0) return <p className="text-center py-10 text-gray-500 dark:text-gray-400">You have no bookings yet.</p>;

    return (
      <div className="space-y-4">
        {bookings.map(booking => (
          <Card key={booking.id} className="shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">Booking ID: {booking.id.substring(0,8)}...</CardTitle>
                <Badge variant={booking.booking_status === "CONFIRMED" ? "success" : "secondary"} className="capitalize">{booking.booking_status}</Badge>
              </div>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Booked on: {new Date(booking.booked_at).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <p><strong>Flight:</strong> {booking.flight_number || "N/A"} ({booking.departure_airport || "N/A"} to {booking.arrival_airport || "N/A"})</p>
              <p><strong>Departure:</strong> {booking.departure_datetime ? new Date(booking.departure_datetime).toLocaleString() : "N/A"}</p>
              <p><strong>Passengers:</strong> {booking.seats_booked}</p>
              <p><strong>Total Price:</strong> ${booking.total_price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Link href={`/flights/${booking.flight_id}`}> 
                    <Button variant="outline" size="sm" className="bg-white dark:bg-gray-700 dark:hover:bg-gray-600">View Flight</Button>
                </Link>
                {/* Add cancel booking button if applicable */}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderFavouritesSection = () => {
    if (isLoadingFavourites) return renderLoading("Loading favourites...");
    if (errorFavourites) return renderError(errorFavourites);
    if (favourites.length === 0) return <p className="text-center py-10 text-gray-500 dark:text-gray-400">You have no favourite flights yet.</p>;

    return (
      <div className="space-y-4">
        {favourites.map(fav => (
          <Card key={fav.id} className="shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">{fav.flight_number}</CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Added on: {new Date(fav.added_at).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <p>{fav.departure_airport} &rarr; {fav.arrival_airport}</p>
              <p>Departs: {new Date(fav.departure_datetime).toLocaleString()}</p>
              <p className="font-semibold text-green-600 dark:text-green-400">Price: ${fav.reduced_price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <Link href={`/flights/${fav.flight_id}`}> 
                    <Button variant="outline" size="sm" className="bg-white dark:bg-gray-700 dark:hover:bg-gray-600"><Eye className="mr-2 h-4 w-4"/>View Flight</Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 dark:hover:text-red-400" onClick={async () => {
                    try { await userApi.favourites.removeFavourite(fav.flight_id); setFavourites(f => f.filter(item => item.id !== fav.id)); } catch (e) { console.error(e); /* show error */ }
                }}><Trash2 className="mr-2 h-4 w-4"/>Remove</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderAlertsSection = () => {
    if (isLoadingAlerts) return renderLoading("Loading alerts...");
    if (errorAlerts) return renderError(errorAlerts);
    if (alerts.length === 0) return <p className="text-center py-10 text-gray-500 dark:text-gray-400">You have no active alerts.</p>;

    return (
      <div className="space-y-4">
        {alerts.map(alert => (
          <Card key={alert.id} className="shadow-md bg-white dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">Alert ID: {alert.id.substring(0,8)}...</CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Created on: {new Date(alert.created_at).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <p><strong>Criteria:</strong> {JSON.stringify(alert.criteria)}</p>
              <p><strong>Email Notifications:</strong> {alert.email_notifications ? "Enabled" : "Disabled"}</p>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 dark:hover:text-red-400" onClick={async () => {
                    try { await userApi.alerts.deleteAlert(alert.id); setAlerts(a => a.filter(item => item.id !== alert.id)); } catch (e) { console.error(e); /* show error */ }
                }}><Trash2 className="mr-2 h-4 w-4"/>Delete Alert</Button>
            </CardFooter>
          </Card>
        ))}
        <div className="text-center mt-6">
            <Button onClick={() => router.push("/search")} className="bg-blue-600 hover:bg-blue-700 text-white"> {/* Or a dedicated page to create alerts */}
                <Bell className="mr-2 h-4 w-4" /> Create New Alert (via Search)
            </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-950 min-h-screen">
      {/* Header Placeholder */}
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 md:px-8 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">EmptyLegs Account</h1>
        </Link>
        <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400">
          <LogOut className="mr-2 h-5 w-5" /> Logout
        </Button>
      </header>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <Tabs value={section} onValueChange={(value) => router.push(`/account/${value}`)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-300 py-2.5">
              <User className="mr-2 h-5 w-5" /> Profile
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-300 py-2.5">
              <Ticket className="mr-2 h-5 w-5" /> My Bookings
            </TabsTrigger>
            <TabsTrigger value="favourites" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-300 py-2.5">
              <Heart className="mr-2 h-5 w-5" /> Favourites
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-300 py-2.5">
              <Bell className="mr-2 h-5 w-5" /> Flight Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">{renderProfileSection()}</TabsContent>
          <TabsContent value="bookings">{renderBookingsSection()}</TabsContent>
          <TabsContent value="favourites">{renderFavouritesSection()}</TabsContent>
          <TabsContent value="alerts">{renderAlertsSection()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AccountPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /><p className="ml-3 text-lg">Loading account...</p></div>}>
            <AccountSectionContent />
        </Suspense>
    );
}

