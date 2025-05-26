
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useLocalStorage from '@/hooks/useLocalStorage';
import { TimetableEntry, LOCAL_STORAGE_KEYS, DAYS_OF_WEEK } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const timetableEntrySchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  day: z.string().min(1, "Day is required"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time (HH:MM)"),
  notes: z.string().optional(),
}).refine(data => {
  // Optional: Add validation for endTime > startTime if needed
  return true; // Placeholder for more complex time validation
}, { message: "End time must be after start time" }); // This message might not show if not specifically targeted

type TimetableFormValues = z.infer<typeof timetableEntrySchema>;

export default function TimetablePage() {
  const [timetableEntries, setTimetableEntries] = useLocalStorage<TimetableEntry[]>(LOCAL_STORAGE_KEYS.TIMETABLE, []);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TimetableFormValues>({
    resolver: zodResolver(timetableEntrySchema),
    defaultValues: {
      subject: '',
      day: DAYS_OF_WEEK[0],
      startTime: '09:00',
      endTime: '10:00',
      notes: '',
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addEntry: SubmitHandler<TimetableFormValues> = (data) => {
    const newEntry: TimetableEntry = {
      id: new Date().toISOString(), // Simple unique ID
      ...data,
    };
    setTimetableEntries(prevEntries => [...prevEntries, newEntry].sort((a,b) => {
      // Sort by day index, then by start time
      const dayComparison = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
      if (dayComparison !== 0) return dayComparison;
      return a.startTime.localeCompare(b.startTime);
    }));
    reset();
    toast({
      title: "Entry Added",
      description: `"${data.subject}" has been added to your timetable.`,
    });
  };

  const deleteEntry = (id: string) => {
    const entryToDelete = timetableEntries.find(entry => entry.id === id);
    setTimetableEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    if (entryToDelete) {
      toast({
        title: "Entry Deleted",
        description: `"${entryToDelete.subject}" has been removed from your timetable.`,
        variant: "destructive"
      });
    }
  };
  
  if (!isMounted) {
    // Avoid rendering UI that relies on localStorage until client-side hydration
    return <div className="flex justify-center items-center h-64"><p>Loading timetable...</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <PlusCircle className="mr-2 h-6 w-6" /> Add New Timetable Entry
          </CardTitle>
          <CardDescription>Organize your study schedule for the week.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(addEntry)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => <Input id="subject" placeholder="e.g., Mathematics" {...field} />}
                />
                {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <Label htmlFor="day">Day of the Week</Label>
                <Controller
                  name="day"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="day">
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.day && <p className="text-sm text-destructive mt-1">{errors.day.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startTime">Start Time (HH:MM)</Label>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => <Input id="startTime" type="time" {...field} />}
                />
                {errors.startTime && <p className="text-sm text-destructive mt-1">{errors.startTime.message}</p>}
              </div>
              <div>
                <Label htmlFor="endTime">End Time (HH:MM)</Label>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => <Input id="endTime" type="time" {...field} />}
                />
                {errors.endTime && <p className="text-sm text-destructive mt-1">{errors.endTime.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => <Textarea id="notes" placeholder="e.g., Chapter 3, specific topics" {...field} />}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Entry
            </Button>
          </CardFooter>
        </form>
      </Card>

      {timetableEntries.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center md:text-left">Your Timetable</h2>
          {DAYS_OF_WEEK.map(day => {
            const entriesForDay = timetableEntries.filter(entry => entry.day === day);
            if (entriesForDay.length === 0) return null;
            return (
              <div key={day} className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-primary">{day}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entriesForDay.map(entry => (
                    <Card key={entry.id} className="shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{entry.subject}</CardTitle>
                        <CardDescription>{entry.startTime} - {entry.endTime}</CardDescription>
                      </CardHeader>
                      {entry.notes && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        </CardContent>
                      )}
                      <CardFooter>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => deleteEntry(entry.id)}
                          aria-label={`Delete ${entry.subject}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
         isMounted && timetableEntries.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Your timetable is empty. Add some entries to get started!
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
