'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Ticket, Plane, Calendar, DollarSign, Building } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

interface ConfirmedFlightDetails {
  id: string;
  departureCity: string;
  arrivalCity: string;
  confirmedDate: string;
  price: number;
  airline: string;
}

interface BookingConfirmationProps {
  bookingRef: string;
  flightDetails: ConfirmedFlightDetails;
}

// Simple fade-in variant (can be shared or defined locally)
const fadeInVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function BookingConfirmationComponent({ bookingRef, flightDetails }: BookingConfirmationProps) {
  return (
    <motion.div
      variants={fadeInVariant}
      initial="hidden"
      animate="visible"
    >
      <Card className="w-full max-w-md my-2 border-green-600/50 overflow-hidden">
        <CardHeader className="text-center items-center bg-green-50 dark:bg-green-950/30 pt-6 pb-4">
          <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
          <CardTitle className="text-lg text-green-600">
              Booking Confirmed!
          </CardTitle>
          <CardDescription className="pt-1">
            Your simulated flight booking is complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4 text-sm">
          <div className="flex flex-col items-center justify-center p-3 bg-muted dark:bg-muted/50 rounded-md border">
              <Label htmlFor="booking-ref" className="text-xs font-normal text-muted-foreground">Booking Reference</Label>
              <p id="booking-ref" className="font-mono text-xl font-semibold tracking-wider text-foreground mt-0.5">{bookingRef}</p>
          </div>

          <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Building className="w-4 h-4" /> Airline</span>
                  <span className="font-medium text-right">{flightDetails.airline}</span>
              </div>
               <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Ticket className="w-4 h-4" /> Flight ID</span>
                  <span className="font-medium font-mono text-xs text-right">{flightDetails.id}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Plane className="w-4 h-4" /> Route</span>
                  <span className="font-medium text-right">{flightDetails.departureCity} → {flightDetails.arrivalCity}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date</span>
                  <span className="font-medium text-right">{flightDetails.confirmedDate}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Price</span>
                  <span className="font-medium text-right">${flightDetails.price}</span>
              </div>
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground text-center pt-2">
            This is a simulated booking. No actual flight was booked.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
