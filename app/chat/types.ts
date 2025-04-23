// Shared types for chat utilities

// Workflow invocation data types
export interface Flight {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

export interface ConfirmedFlightDetails {
  id: string;
  departureCity: string;
  arrivalCity: string;
  confirmedDate: string;
  price: number;
  airline: string;
}

export interface ConfirmDateResult {
  workflowStep: 'confirmDate';
  departureCity: string;
  arrivalCity: string;
  targetDateString: string;
  [key: string]: unknown;
}

export interface SelectFlightResult {
  workflowStep: 'selectFlight';
  departureCity: string;
  arrivalCity: string;
  confirmedDate: string;
  availableFlights: Flight[];
  [key: string]: unknown;
}

export interface ConfirmationResult {
  workflowStep: 'confirmation';
  departureCity: string;
  arrivalCity: string;
  confirmedDate: string;
  bookingRef: string;
  flightDetails: ConfirmedFlightDetails;
  [key: string]: unknown;
}

export type WorkflowToolInvocationResult =
  | ConfirmDateResult
  | SelectFlightResult
  | ConfirmationResult;

export interface UserActionData {
  action: 'callTool';
  [key: string]: unknown;
}

export function isUserActionData(data: unknown): data is UserActionData {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as UserActionData).action === 'callTool'
  );
}
