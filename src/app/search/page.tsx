"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlaneTakeoff, PlaneLanding, CalendarDays, Users, DollarSign, ArrowLeft, Search, Filter, Loader2, AlertTriangle, Info } from "lucide-react";
import { userApi } from "@/lib/userApiService";
import { format } from 'date-fns';

interface Flight {
  id: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_datetime: string;
  arrival_datetime: string;
  aircraft_type: string;
  seats_available: number;
  original_price: number;
  reduced_price: number;
  status: string;
  tenant_id?: string; // Optional, if needed for deep links or info
  tenant_name?: string; // Optional, for display
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQueryDisplay, setSearchQueryDisplay] = useState<string>("");

  useEffect(() => {
    const query = Object.fromEntries(searchParams.entries());
    let displayQuery = [];
    if(query.departure_airport) displayQuery.push(`From: ${query.departure_airport}`);
    if(query.arrival_airport) displayQuery.push(`To: ${query.arrival_airport}`);
    if(query.departure_date) displayQuery.push(`Date: ${format(new Date(query.departure_date), "PPP")}`);
    if(query.seats_available_gte) displayQuery.push(`Passengers: ${query.seats_available_gte}`);
    setSearchQueryDisplay(displayQuery.join(", ") || "All available flights");

    const fetchFlights = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await userApi.flights.searchFlights(query);
        setFlights(data.flights || []);
      } catch (err: any) {
        console.error("Failed to fetch search results:", err);
        setError(err.message || "Could not load flight results. Please try adjusting your search or try again later.");
        setFlights([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlights();
  }, [searchParams]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled": return "secondary";
      case "available": return "success"; // Assuming "available" is a possible status
      case "on time": return "success";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
            <Link href="/" className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Search
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Search Results</h1>
            <p className="text-muted-foreground dark:text-gray-300">Showing flights for: {searchQueryDisplay}</p>
        </div>
        {/* Placeholder for sort/filter button if needed */}
        {/* <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters</Button> */}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Finding flights...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && flights.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50">
          <Search className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No Flights Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">We couldn&apos;t find any flights matching your criteria. Try broadening your search.</p>
          <Button onClick={() => router.push("/")} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            Modify Search
          </Button>
        </div>
      )}

      {!isLoading && flights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flights.map((flight) => (
            <Card key={flight.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 flex flex-col">
              <CardHeader className="pb-3 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-semibold text-blue-700 dark:text-blue-400">{flight.flight_number}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(flight.status)} className="capitalize">{flight.status || "Unknown"}</Badge>
                </div>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Operated by: {flight.tenant_name || "Private Operator"}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3 flex-grow">
                <div className="flex items-center justify-between text-lg font-medium">
                  <div className="flex items-center">
                    <PlaneTakeoff className="h-5 w-5 mr-2 text-green-500" /> {flight.departure_airport}
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 mx-2">
                    &rarr;
                  </span>
                  <div className="flex items-center">
                    <PlaneLanding className="h-5 w-5 mr-2 text-red-500" /> {flight.arrival_airport}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" /> Departs: {new Date(flight.departure_datetime).toLocaleString()}</p>
                  <p className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" /> Arrives: {new Date(flight.arrival_datetime).toLocaleString()}</p>
                  <p className="flex items-center"><Users className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" /> Seats Available: {flight.seats_available}</p>
                  <p className="flex items-center"><Info className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" /> Aircraft: {flight.aircraft_type}</p>
                </div>
                <div className="pt-2 text-right">
                  {flight.original_price > flight.reduced_price && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through mr-2">${flight.original_price.toFixed(2)}</span>
                  )}
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">${flight.reduced_price.toFixed(2)}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Price</p>
                </div>
              </CardContent>
              <CardFooter className="p-4 bg-gray-50 dark:bg-gray-700/50">
                <Link href={`/flights/${flight.id}`} className="w-full">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    View Details & Book
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /><p className="ml-3 text-lg">Loading search...</p></div>}>
            <SearchResultsContent />
        </Suspense>
    );
}

