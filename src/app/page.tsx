"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search, PlaneTakeoff, PlaneLanding, Users, DollarSign, MapPin } from "lucide-react";
import { format } from "date-fns";
import { userApi } from "@/lib/userApiService"; // Assuming userApi is set up for public flight search

export default function HomePage() {
  const router = useRouter();
  const [departureLocation, setDepartureLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [passengers, setPassengers] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const searchParams = new URLSearchParams();
    if (departureLocation) searchParams.append("departure_airport", departureLocation);
    if (arrivalLocation) searchParams.append("arrival_airport", arrivalLocation);
    if (departureDate) searchParams.append("departure_date", format(departureDate, "yyyy-MM-dd"));
    if (passengers) searchParams.append("seats_available_gte", passengers); // Assuming backend supports gte for seats
    
    // For now, we'll navigate to the search results page with query params
    // The actual API call will happen on the search results page
    router.push(`/search?${searchParams.toString()}`);
    
    // If direct search on homepage is needed:
    // try {
    //   const results = await userApi.flights.searchFlights(Object.fromEntries(searchParams.entries()));
    //   console.log("Search results:", results);
    //   // Redirect to search results page with results or handle display here
    //   router.push(`/search?${searchParams.toString()}`); 
    // } catch (error) {
    //   console.error("Search failed:", error);
    //   // Handle error display
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-indigo-700 text-white">
      {/* Header/Nav - Placeholder for now */}
      <header className="py-6 px-4 md:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">EmptyLegs</h1>
        <div>
          <Link href="/login"><Button variant="outline" className="mr-2 text-white border-white hover:bg-white hover:text-blue-600">Login</Button></Link>
          <Link href="/register"><Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">Sign Up</Button></Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Fly Private, Smarter.
        </h2>
        <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-indigo-100">
          Discover exclusive deals on empty leg flights and experience luxury travel at a fraction of the cost.
        </p>

        {/* Search Form Card */}
        <Card className="max-w-3xl mx-auto shadow-2xl bg-white/90 backdrop-blur-md text-gray-800 dark:bg-gray-800/90 dark:text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center text-gray-700 dark:text-gray-100">Find Your Next Empty Leg Flight</CardTitle>
          </CardHeader>
          <form onSubmit={handleSearch}>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="space-y-2">
                <Label htmlFor="departureLocation" className="flex items-center"><PlaneTakeoff className="mr-2 h-5 w-5 text-blue-500" /> Departure</Label>
                <Input 
                  id="departureLocation" 
                  placeholder="e.g., New York (JFK)" 
                  value={departureLocation}
                  onChange={(e) => setDepartureLocation(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalLocation" className="flex items-center"><PlaneLanding className="mr-2 h-5 w-5 text-blue-500" /> Arrival</Label>
                <Input 
                  id="arrivalLocation" 
                  placeholder="e.g., London (LHR)" 
                  value={arrivalLocation}
                  onChange={(e) => setArrivalLocation(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureDate" className="flex items-center"><CalendarIcon className="mr-2 h-5 w-5 text-blue-500" /> Departure Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!departureDate && "text-muted-foreground"} bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {departureDate ? format(departureDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800" align="start">
                    <Calendar
                      mode="single"
                      selected={departureDate}
                      onSelect={setDepartureDate}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passengers" className="flex items-center"><Users className="mr-2 h-5 w-5 text-blue-500" /> Passengers</Label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select passengers" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1} Passenger{i > 0 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button type="submit" className="w-full text-lg py-3 bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>
                <Search className="mr-2 h-5 w-5" />
                {isLoading ? "Searching..." : "Search Flights"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Placeholder for featured deals or other content */}
        <div className="mt-16 md:mt-24">
          <h3 className="text-2xl font-semibold mb-8 text-indigo-100">Why Choose Empty Legs?</h3>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white/10 p-6 rounded-lg shadow-lg">
              <DollarSign className="h-10 w-10 text-orange-400 mb-3" />
              <h4 className="font-bold text-xl mb-2">Unbeatable Prices</h4>
              <p className="text-indigo-200">Access private jet travel at significantly reduced costs by booking empty leg flights.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg shadow-lg">
              <PlaneTakeoff className="h-10 w-10 text-orange-400 mb-3" />
              <h4 className="font-bold text-xl mb-2">Luxury & Comfort</h4>
              <p className="text-indigo-200">Enjoy the full private jet experience with premium amenities and personalized service.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg shadow-lg">
              <MapPin className="h-10 w-10 text-orange-400 mb-3" />
              <h4 className="font-bold text-xl mb-2">Flexible Options</h4>
              <p className="text-indigo-200">Find flights to a variety of destinations, often with flexible scheduling.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Placeholder */}
      <footer className="py-8 text-center text-indigo-200 border-t border-white/20 mt-16">
        <p>&copy; {new Date().getFullYear()} EmptyLegs Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
}

