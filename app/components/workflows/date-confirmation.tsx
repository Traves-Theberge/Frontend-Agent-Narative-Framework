'use client';

import React, { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type UseChatHelpers } from 'ai/react';
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

interface DateConfirmationProps {
  departureCity: string;
  arrivalCity: string;
  targetDateString: string;
  toolCallId: string;
  append: UseChatHelpers['append'];
}

// Simple fade-in variant
const fadeInVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function DateConfirmationComponent({
  departureCity,
  arrivalCity,
  targetDateString,
  toolCallId,
  append,
}: DateConfirmationProps) {
  const initialDate = new Date(targetDateString);
  const [date, setDate] = useState<Date | undefined>(
    !isNaN(initialDate.getTime()) ? initialDate : new Date()
  );
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (!date || isPending) return;
    const confirmedDate = format(date, 'yyyy-MM-dd');

    startTransition(() => {
      append({
        role: 'user',
        content: `Confirmed date for flight search: ${confirmedDate}`,
        data: {
          action: 'callTool',
          toolName: 'searchFlights',
          args: {
            departureCity,
            arrivalCity,
            confirmedDate,
          },
          linkedToolCallId: toolCallId,
        },
      });
    });
  };

  return (
    <motion.div
      variants={fadeInVariant}
      initial="hidden"
      animate="visible"
    >
      <Card className="w-full max-w-md my-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            Confirm Flight Date
          </CardTitle>
          <CardDescription className="pt-1">
            Please select or confirm the date for your flight from <span className="font-medium text-foreground">{departureCity}</span> to <span className="font-medium text-foreground">{arrivalCity}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="date-picker-button">Selected Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-picker-button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                  disabled={isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleConfirm} disabled={!date || isPending} className="w-full" variant="secondary">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {isPending ? 'Confirming...' : 'Confirm Date & Search Flights'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
