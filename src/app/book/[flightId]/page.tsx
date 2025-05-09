"use client";

import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2, CreditCard, DollarSign, Loader2, Plane, AlertTriangle, Users, ShoppingCart } from "lucide-react";
import { userApi } from "@/lib/userApiService";
import { format } from 'date-fns';

interface FlightSummary {
  id: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_datetime: string;
  arrival_datetime: string;
  reduced_price: number;
  aircraft_type: string;
}

interface BookingForm {
  num_passengers: string;
  card_number: string;
  card_expiry: string;
  card_cvc: string;
  card_name: string;
}

function BookingPageContent() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.flightId as string;

  const [flight, setFlight] = useState<FlightSummary | null>(null);
  const [isLoadingFlight, setIsLoadingFlight] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null); // To store successful booking details

  const [formState, setFormState] = useState<BookingForm>({
    num_passengers: "1",
    card_number: "",
    card_expiry: "",
    card_cvc: "",
    card_name: "",
  });

  useEffect(() => {
    if (flightId) {
      const fetchFlightSummary = async () => {
        setIsLoadingFlight(true);
        setError(null);
        try {
          const data = await userApi.flights.getFlightDetails(flightId);
          // Assuming the flight details endpoint returns enough for a summary
          const flightData = data.flight || data;
          setFlight({
            id: flightData.id,
            flight_number: flightData.flight_number,
            departure_airport: flightData.departure_airport,
            arrival_airport: flightData.arrival_airport,
            departure_datetime: flightData.departure_datetime,
            arrival_datetime: flightData.arrival_datetime,
            reduced_price: flightData.reduced_price,
            aircraft_type: flightData.aircraft_type,
          });
        } catch (err: any) {
          console.error("Failed to fetch flight summary for booking:", err);
          setError(err.message || "Could not load flight information for booking.");
        } finally {
          setIsLoadingFlight(false);
        }
      };
      fetchFlightSummary();
    }
  }, [flightId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!flight) return;

    setIsBooking(true);
    setError(null);
    setBookingSuccess(false);

    const bookingData = {
      flight_id: flight.id,
      seats_booked: parseInt(formState.num_passengers, 10),
      // Payment details are for UI demo, actual payment processing would be more complex
      payment_details: {
        card_number: formState.card_number,
        card_expiry: formState.card_expiry,
        card_cvc: formState.card_cvc,
        card_name: formState.card_name,
      },
      total_price: flight.reduced_price * parseInt(formState.num_passengers, 10),
    };

    try {
      const response = await userApi.bookings.createBooking(bookingData);
      console.log("Booking successful:", response);
      setBookingDetails(response.booking || response); // Store booking details from response
      setBookingSuccess(true);
    } catch (err: any) {
      console.error("Booking failed:", err);
      setError(err.response?.data?.message || err.message || "An error occurred while processing your booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoadingFlight) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading flight information...</p>
      </div>
    );
  }

  if (error && !flight) { // Error loading flight itself
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
        <p className="text-gray-500 dark:text-gray-400 mt-2">The flight you are trying to book does not exist or is no longer available.</p>
        <Link href="/">
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            Search Other Flights
          </Button>
        </Link>
      </div>
    );
  }

  if (bookingSuccess && bookingDetails) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 flex flex-col items-center">
        <Card className="w-full max-w-lg shadow-xl text-center bg-white dark:bg-gray-800 p-8">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-6" />
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">Booking Confirmed!</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 mt-3 mb-6 text-lg">
            Your flight has been successfully booked.
          </CardDescription>
          <CardContent className="text-left space-y-3 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-md">
            <p><strong>Booking ID:</strong> {bookingDetails.id}</p>
            <p><strong>Flight:</strong> {flight.flight_number} ({flight.departure_airport} to {flight.arrival_airport})</p>
            <p><strong>Passengers:</strong> {bookingDetails.seats_booked}</p>
            <p><strong>Total Price:</strong> ${bookingDetails.total_price?.toFixed(2)}</p>
            <p>A confirmation email has been sent to your registered address.</p>
          </CardContent>
          <CardFooter className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/account/bookings">
              <Button variant="outline" className="w-full sm:w-auto">View My Bookings</Button>
            </Link>
            <Link href="/">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">Find Another Flight</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push(`/flights/${flightId}`)} className="bg-white dark:bg-gray-800 dark:hover:bg-gray-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Flight Details
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Flight Summary Card */}
          <Card className="lg:col-span-1 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="bg-blue-600 text-white dark:bg-blue-700 p-5 rounded-t-lg">
              <CardTitle className="text-2xl flex items-center"><Plane className="mr-3 h-7 w-7" /> Flight Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{flight.flight_number}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{flight.departure_airport} &rarr; {flight.arrival_airport}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Departs: {new Date(flight.departure_datetime).toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Aircraft: {flight.aircraft_type}</p>
              <div className="pt-2 border-t dark:border-gray-700">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">${(flight.reduced_price * parseInt(formState.num_passengers, 10) || flight.reduced_price).toFixed(2)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total for {formState.num_passengers} passenger(s)</p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form Card */}
          <Card className="lg:col-span-2 shadow-xl bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Complete Your Booking</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">Enter passenger and payment details to secure your flight.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitBooking}>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Booking Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label htmlFor="num_passengers" className="text-base font-medium text-gray-700 dark:text-gray-200 flex items-center"><Users className="mr-2 h-5 w-5 text-blue-500"/>Number of Passengers</Label>
                  <Input 
                    id="num_passengers" 
                    name="num_passengers"
                    type="number" 
                    min="1" 
                    max="10" // Or max seats available on flight if known
                    value={formState.num_passengers}
                    onChange={handleInputChange}
                    required 
                    className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
                
                {/* Payment Details Section - Conceptual */}
                <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center"><CreditCard className="mr-2 h-5 w-5 text-blue-500"/>Payment Information</h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">This is a conceptual payment form. No real transaction will occur.</p>
                    <div className="space-y-2">
                        <Label htmlFor="card_name">Name on Card</Label>
                        <Input id="card_name" name="card_name" placeholder="John M. Doe" value={formState.card_name} onChange={handleInputChange} required className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="card_number">Card Number</Label>
                        <Input id="card_number" name="card_number" placeholder="•••• •••• •••• ••••" value={formState.card_number} onChange={handleInputChange} required className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="card_expiry">Expiry Date (MM/YY)</Label>
                            <Input id="card_expiry" name="card_expiry" placeholder="MM/YY" value={formState.card_expiry} onChange={handleInputChange} required className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="card_cvc">CVC</Label>
                            <Input id="card_cvc" name="card_cvc" placeholder="•••" value={formState.card_cvc} onChange={handleInputChange} required className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                        </div>
                    </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 border-t dark:border-gray-700">
                <Button type="submit" className="w-full text-lg py-3 bg-orange-500 hover:bg-orange-600 text-white" disabled={isBooking}>
                  {isBooking ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Booking...</>
                  ) : (
                    <><ShoppingCart className="mr-2 h-5 w-5" /> Confirm & Book Flight</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookFlightPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /><p className="ml-3 text-lg">Loading booking page...</p></div>}>
            <BookingPageContent />
        </Suspense>
    );
}

