import { tool as createTool } from 'ai';
import { z } from 'zod';

// Tool to initiate the flight search process
export const initiateFlightSearchTool = createTool({
  description: 'Starts the process of searching for flights. Asks the user to confirm details first.',
  parameters: z.object({
    departureCity: z.string().describe('The departure city'),
    arrivalCity: z.string().describe('The arrival city'),
    targetDate: z.string().describe('Initial proposed date, e.g., YYYY-MM-DD or a natural language date'),
  }),
  execute: async ({ departureCity, arrivalCity, targetDate }) => {
    console.log(`Tool: initiateFlightSearchTool called with: ${departureCity}, ${arrivalCity}, ${targetDate}`);
    return {
      workflowStep: 'confirmDate',
      departureCity,
      arrivalCity,
      targetDateString: targetDate,
    };
  },
});

// Tool to search for flights based on confirmed details
export const searchFlightsTool = createTool({
  description: 'Searches for available flights based on confirmed details.',
  parameters: z.object({
    departureCity: z.string(),
    arrivalCity: z.string(),
    confirmedDate: z.string().describe('The confirmed date in YYYY-MM-DD format'),
  }),
  execute: async ({ departureCity, arrivalCity, confirmedDate }) => {
    console.log(`Tool: searchFlightsTool called with: ${departureCity}, ${arrivalCity}, ${confirmedDate}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockFlights = [
      { id: 'fl123', airline: 'AI Airways', departureTime: '09:00', arrivalTime: '21:00', price: 750 },
      { id: 'fl456', airline: 'Virtual Voyages', departureTime: '11:30', arrivalTime: '23:30', price: 820 },
      { id: 'fl789', airline: 'Generative Jets', departureTime: '14:00', arrivalTime: '02:00', price: 700 },
    ];
    return {
      workflowStep: 'selectFlight',
      departureCity,
      arrivalCity,
      confirmedDate,
      availableFlights: mockFlights,
    };
  },
});

// Tool to book the selected flight
export const bookFlightTool = createTool({
  description: 'Books the flight selected by the user.',
  parameters: z.object({
    selectedFlightId: z.string().describe('The ID of the flight selected by the user'),
    departureCity: z.string(),
    arrivalCity: z.string(),
    confirmedDate: z.string(),
    price: z.number(),
    airline: z.string(),
  }),
  execute: async ({ selectedFlightId, departureCity, arrivalCity, confirmedDate, price, airline }) => {
    console.log(`Tool: bookFlightTool called with flight ID: ${selectedFlightId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const bookingRef = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      workflowStep: 'confirmation',
      bookingRef,
      flightDetails: { id: selectedFlightId, departureCity, arrivalCity, confirmedDate, price, airline },
    };
  },
});

export const tools = {
  initiateFlightSearch: initiateFlightSearchTool,
  searchFlights: searchFlightsTool,
  bookFlight: bookFlightTool,
};
