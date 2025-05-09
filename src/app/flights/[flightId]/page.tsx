"use client";

import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlaneTakeoff, PlaneLanding, CalendarDays, Users, DollarSign, ArrowLeft, Info, MapPin, Clock, Briefcase, Wifi, Utensils, Tv, ShoppingCart, AlertTriangle, Loader2 } from "lucide-react";
import { userApi } from "@/lib/userApiService";
import { format } from 'date-fns';

interface FlightDetail {
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
  tenant_id?: string;
  tenant_name?: string;
  // Potentially more details
  amenities?: string[]; // e.g., ["WiFi", "In-flight Meal", "Entertainment"]
  luggage_allowance?: string; // e.g., "2 bags, 20kg each"
  flight_duration?: string; // e.g., "3h 45m"
  description?: string;
  aircraft_images?: string[];
}

function FlightDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.flightId as string;

  const [flight, setFlight] = useState<FlightDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flightId) {
      const fetchFlightDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await userApi.flights.getFlightDetails(flightId);
          setFlight(data.flight || data); // Backend might return { flight: ... } or just the flight object
        } catch (err: any) {
          console.error("Failed to fetch flight details:", err);
          setError(err.message || "Could not load flight details. The flight may no longer be available or the link is incorrect.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchFlightDetails();
    }
  }, [flightId]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled": return "secondary";
      case "available":
      case "on time": 
        return "success";
      case "boarding": return "info";
      case "departed": return "default";
      case "arrived": return "success";
      case "cancelled": return "destructive";
      case "delayed": return "warning";
      default: return "outline";
    }
  };

  const AmenityIcon = ({ amenity }: { amenity: string }) => {
    if (amenity.toLowerCase().includes("wifi")) return <Wifi className="h-5 w-5 mr-1 text-blue-500" />;
    if (amenity.toLowerCase().includes("meal") || amenity.toLowerCase().includes("food")) return <Utensils className="h-5 w-5 mr-1 text-orange-500" />;
    if (amenity.toLowerCase().includes("entertainment") || amenity.toLowerCase().includes("tv")) return <Tv className="h-5 w-5 mr-1 text-purple-500" />;
    return <Info className="h-5 w-5 mr-1 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading flight details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Flight</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Flight Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The flight you are looking for does not exist or is no longer available.</p>
        <Link href="/">
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            Search Other Flights
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="bg-white dark:bg-gray-800 dark:hover:bg-gray-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search Results
          </Button>
        </div>

        <Card className="shadow-xl overflow-hidden bg-white dark:bg-gray-800">
          {/* Optional: Aircraft Image Carousel */}
          {flight.aircraft_images && flight.aircraft_images.length > 0 && (
            <div className="h-64 md:h-80 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {/* Placeholder for image carousel - for now, show first image */}
              <img src={flight.aircraft_images[0]} alt={flight.aircraft_type} className="object-cover w-full h-full" />
            </div>
          )}
          {!flight.aircraft_images && (
             <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <PlaneTakeoff className="h-24 w-24 text-white opacity-50" />
            </div>
          )}

          <CardHeader className="p-6 border-b dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{flight.flight_number}</h1>
              <Badge variant={getStatusBadgeVariant(flight.status)} className="text-base px-3 py-1 capitalize self-start md:self-center">{flight.status || "Unknown"}</Badge>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Operated by: {flight.tenant_name || "Private Charter"}</p>
          </CardHeader>

          <CardContent className="p-6 grid md:grid-cols-3 gap-8">
            {/* Flight Route & Times */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Route & Schedule</h3>
                <div className="flex items-center text-lg mb-3">
                  <MapPin className="h-6 w-6 mr-3 text-blue-500" />
                  <span className="font-medium text-gray-800 dark:text-gray-100">{flight.departure_airport}</span>
                  <span className="mx-3 text-gray-400 dark:text-gray-500">&rarr;</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">{flight.arrival_airport}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <p className="flex items-center"><PlaneTakeoff className="h-5 w-5 mr-2 text-green-500" /> Departs: <strong className="ml-1">{new Date(flight.departure_datetime).toLocaleString()}</strong></p>
                  <p className="flex items-center"><PlaneLanding className="h-5 w-5 mr-2 text-red-500" /> Arrives: <strong className="ml-1">{new Date(flight.arrival_datetime).toLocaleString()}</strong></p>
                  {flight.flight_duration && <p className="flex items-center"><Clock className="h-5 w-5 mr-2 text-gray-500" /> Duration: <strong className="ml-1">{flight.flight_duration}</strong></p>}
                </div>
              </div>

              {/* Aircraft & Amenities */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Aircraft & Cabin</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-1"><Briefcase className="h-5 w-5 mr-2 text-gray-500" /> Aircraft: <strong className="ml-1">{flight.aircraft_type}</strong></p>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-3"><Users className="h-5 w-5 mr-2 text-gray-500" /> Seats Available: <strong className="ml-1">{flight.seats_available}</strong></p>
                {flight.amenities && flight.amenities.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-1">Amenities:</h4>
                    <ul className="flex flex-wrap gap-2">
                      {flight.amenities.map(amenity => (
                        <li key={amenity} className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-200">
                          <AmenityIcon amenity={amenity} /> {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {flight.luggage_allowance && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Luggage: {flight.luggage_allowance}</p>}
              </div>
              {flight.description && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Flight Description</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{flight.description}</p>
                </div>
              )}
            </div>

            {/* Pricing & Booking CTA */}
            <div className="md:col-span-1 space-y-6">
              <Card className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-300">Pricing</h3>
                <div className="text-center mb-4">
                  {flight.original_price > flight.reduced_price && (
                    <p className="text-lg text-gray-500 dark:text-gray-400 line-through">${flight.original_price.toFixed(2)}</p>
                  )}
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">${flight.reduced_price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Price (per seat if applicable)</p>
                </div>
                <Link href={`/book/${flight.id}`} className="w-full">
                  <Button className="w-full text-lg py-3 bg-orange-500 hover:bg-orange-600 text-white">
                    <ShoppingCart className="mr-2 h-5 w-5" /> Book This Flight
                  </Button>
                </Link>
                <p className="text-xs text-center mt-3 text-gray-500 dark:text-gray-400">Secure your seat now - limited availability!</p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FlightDetailsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /><p className="ml-3 text-lg">Loading flight details...</p></div>}>
            <FlightDetailsContent />
        </Suspense>
    );
}

