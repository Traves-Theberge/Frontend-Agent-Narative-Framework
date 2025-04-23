'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { UseChatHelpers } from 'ai/react';
import { PlaneTakeoff, TicketCheck, DollarSign, Clock, Loader2, SearchX } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from 'framer-motion';

interface Flight {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

interface FlightOptionsProps {
  availableFlights: Flight[];
  departureCity: string;
  arrivalCity: string;
  confirmedDate: string;
  toolCallId: string;
  append: UseChatHelpers['append'];
}

// Animation variants for the container and items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger delay between children
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 }, // Start slightly down and invisible
  visible: { opacity: 1, y: 0 },   // Animate to full opacity and original position
};

export function FlightOptionsComponent({
  availableFlights,
  departureCity,
  arrivalCity,
  confirmedDate,
  toolCallId,
  append,
}: FlightOptionsProps) {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectFlight = (flight: Flight) => {
    if (isPending) return;
    setSelectedFlightId(flight.id);
    startTransition(() => {
      append({
        role: 'user',
        content: `Selected flight ${flight.id} for booking.`,
        data: {
          action: 'callTool',
          toolName: 'bookFlight',
          args: {
            selectedFlightId: flight.id,
            departureCity,
            arrivalCity,
            confirmedDate,
            price: flight.price,
            airline: flight.airline,
          },
          linkedToolCallId: toolCallId,
        },
      });
    });
  };

  return (
    <Card className="w-full max-w-2xl my-2 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
            <PlaneTakeoff className="h-5 w-5 text-muted-foreground" />
            Select Your Flight
        </CardTitle>
        <CardDescription className="pt-1">
          Showing available flights from <span className="font-medium text-foreground">{departureCity}</span> to <span className="font-medium text-foreground">{arrivalCity}</span> on <span className="font-medium text-foreground">{confirmedDate}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent 
        className="space-y-4"
      >
        {availableFlights.length > 0 ? (
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {availableFlights.map((flight) => (
              <motion.div key={flight.id} variants={itemVariants}>
                <Card className="overflow-hidden transition-colors hover:bg-muted/50">
                  <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-grow space-y-1.5">
                       <p className="font-semibold text-base flex items-center gap-2">
                          <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
                          {flight.airline}
                      </p>
                       <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {flight.departureTime} - {flight.arrivalTime}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      <Separator orientation="vertical" className="hidden sm:block h-10" />
                      <div className="flex items-center justify-between sm:justify-start gap-3 flex-grow">
                          <p className="text-lg font-semibold flex items-center gap-1.5 whitespace-nowrap">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              {flight.price}
                          </p>
                          <Button
                            onClick={() => handleSelectFlight(flight)}
                            size="sm"
                            variant="secondary"
                            className="w-full sm:w-auto"
                            disabled={isPending}
                          >
                            {isPending && selectedFlightId === flight.id ? (
                               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                               <TicketCheck className="mr-2 h-4 w-4" />
                            )}
                            {isPending && selectedFlightId === flight.id ? 'Selecting...' : 'Select'}
                          </Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Alert variant="default" className="border-dashed">
            <SearchX className="h-4 w-4" />
            <AlertTitle>No Flights Found</AlertTitle>
            <AlertDescription>
              There were no flights matching your criteria for the selected date.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
