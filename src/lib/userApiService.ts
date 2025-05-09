import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"; // Ensure your Flask backend serves under /api

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("user_token"); // Use a different token key for user portal
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication Service (User Portal)
export const authService = {
  register: async (userData: any) => {
    const response = await apiClient.post("/auth/register", { ...userData, role: "user" }); // Add role for user
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.data.access_token) {
      localStorage.setItem("user_token", response.data.access_token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("user_token");
  },
  getCurrentUser: () => {
    return localStorage.getItem("user_token"); 
  }
};

// Public Flight Service (User Portal)
export const publicFlightService = {
  searchFlights: async (params: any) => {
    const response = await apiClient.get("/flights/search", { params });
    return response.data;
  },
  getFlightDetails: async (flightId: string) => {
    const response = await apiClient.get(`/flights/${flightId}`);
    return response.data;
  },
};

// Booking Service (User Portal)
export const bookingService = {
  createBooking: async (bookingData: any) => {
    const response = await apiClient.post("/bookings", bookingData);
    return response.data;
  },
  getBookingDetails: async (bookingId: string) => {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
  },
  cancelBooking: async (bookingId: string) => {
    const response = await apiClient.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  }
};

// User Account Service (Profile, Favourites, Alerts)
export const userAccountService = {
  getProfile: async () => {
    // Assuming a /users/profile or /me endpoint
    // const response = await apiClient.get("/users/me"); 
    // return response.data;
    return Promise.resolve({ first_name: "John", last_name: "User", email: "user@example.com" }); // Mock
  },
  updateProfile: async (profileData: any) => {
    // const response = await apiClient.put("/users/me", profileData);
    // return response.data;
    return Promise.resolve({ message: "Profile updated (mock)" });
  },
  getBookingHistory: async () => {
    const response = await apiClient.get("/bookings"); // User's bookings
    return response.data;
  },
  getFavourites: async () => {
    const response = await apiClient.get("/users/favourites");
    return response.data;
  },
  addFavourite: async (flightId: string) => {
    const response = await apiClient.post("/users/favourites", { flight_id: flightId });
    return response.data;
  },
  removeFavourite: async (favouriteId: string) => {
    const response = await apiClient.delete(`/users/favourites/${favouriteId}`);
    return response.data;
  },
  getAlertSubscriptions: async () => {
    const response = await apiClient.get("/users/alerts");
    return response.data;
  },
  createAlertSubscription: async (alertData: any) => {
    const response = await apiClient.post("/users/alerts", alertData);
    return response.data;
  },
  deleteAlertSubscription: async (alertId: string) => {
    const response = await apiClient.delete(`/users/alerts/${alertId}`);
    return response.data;
  },
};


export const userApi = {
    auth: authService,
    flights: publicFlightService,
    bookings: bookingService,
    account: userAccountService,
};

export default apiClient;

