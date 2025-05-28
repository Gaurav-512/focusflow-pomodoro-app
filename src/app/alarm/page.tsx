
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DigitalClock } from "@/components/alarm/DigitalClock";
import { useAlarm } from "@/hooks/useAlarm";
import { useToast } from "@/hooks/use-toast";
import { BellRing, BellOff, XCircle } from 'lucide-react';

export default function AlarmPage() {
  const { alarm, isAlarmSet, isRinging, setAlarm, clearAlarm, dismissAlarm, formattedAlarmTime } = useAlarm();
  const { toast } = useToast();
  const [selectedHour, setSelectedHour] = useState<string>("07"); // 12-hour format
  const [selectedMinute, setSelectedMinute] = useState<string>("30");
  const [selectedAmPm, setSelectedAmPm] = useState<string>("AM");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (alarm) {
      let hour12 = alarm.hour % 12;
      if (hour12 === 0) hour12 = 12; // 0 and 12 should be 12 for display
      setSelectedHour(hour12.toString().padStart(2, '0'));
      setSelectedMinute(alarm.minute.toString().padStart(2, '0'));
      setSelectedAmPm(alarm.hour >= 12 && alarm.hour < 24 ? 'PM' : 'AM');
    }
  }, [alarm]);


  const handleSetAlarm = () => {
    let hour24 = parseInt(selectedHour, 10);
    if (selectedAmPm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (selectedAmPm === 'AM' && hour24 === 12) { // 12 AM is 00 hours
      hour24 = 0;
    }

    const minute = parseInt(selectedMinute, 10);
    
    const now = new Date();
    const alarmTimeToday = new Date();
    alarmTimeToday.setHours(hour24, minute, 0, 0);

    const displayHour = selectedHour;
    const displayMinute = selectedMinute;
    const displayAmPm = selectedAmPm;

    let toastMessage = `Alarm set for ${displayHour}:${displayMinute} ${displayAmPm}.`;

    if (alarmTimeToday < now && !(now.getHours() === hour24 && now.getMinutes() === minute)) {
      toastMessage = `Alarm set for ${displayHour}:${displayMinute} ${displayAmPm}. This time has passed for today; it will ring on the next occurrence.`;
    }
    
    setAlarm(hour24, minute);
    toast({
      title: "Alarm Status",
      description: toastMessage,
      duration: 5000,
    });
  };
  
  if (!isMounted) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4">
        <p className="text-2xl font-[--font-poppins] text-foreground">Loading Alarm...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-[--font-poppins] font-bold flex items-center justify-center text-foreground">
            <BellRing className="mr-3 h-10 w-10 text-primary" /> FocusFlow Alarm
          </CardTitle>
          <CardDescription className="text-muted-foreground pt-2">Set your alarm to stay on track.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-8">
          <DigitalClock size={200} />

          {!isRinging && (
            <div className="w-full space-y-4">
              <div className="flex justify-around items-end space-x-2">
                <div className="flex-1">
                  <Label htmlFor="hour-select" className="text-sm font-medium text-muted-foreground">Hour</Label>
                  <Select value={selectedHour} onValueChange={setSelectedHour}>
                    <SelectTrigger id="hour-select" className="w-full">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-3xl font-mono pb-1 text-muted-foreground">:</span>
                <div className="flex-1">
                  <Label htmlFor="minute-select" className="text-sm font-medium text-muted-foreground">Minute</Label>
                  <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                    <SelectTrigger id="minute-select" className="w-full">
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="ampm-select" className="text-sm font-medium text-muted-foreground">AM/PM</Label>
                  <Select value={selectedAmPm} onValueChange={setSelectedAmPm}>
                    <SelectTrigger id="ampm-select" className="w-full">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleSetAlarm}
                size="lg"
                className="w-full text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <BellRing className="mr-2 h-5 w-5" /> Set Alarm
              </Button>
            </div>
          )}

          {isRinging && (
            <Button
              onClick={dismissAlarm}
              size="lg"
              variant="destructive"
              className="w-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 animate-pulse"
            >
              <XCircle className="mr-2 h-6 w-6" /> Dismiss Alarm
            </Button>
          )}

        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center pt-6 space-y-3">
          {isAlarmSet && formattedAlarmTime ? (
            <div className="text-center">
              <p className="text-lg text-accent-foreground font-medium" style={{color: 'hsl(var(--accent))'}}>
                Next Alarm: {formattedAlarmTime}
              </p>
              <Button onClick={clearAlarm} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground/80 mt-2">
                <BellOff className="mr-2 h-4 w-4" /> Cancel Alarm
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">No alarm set.</p>
          )}
          {/* AdMob Placeholder */}
          {/* 
            <div id="admob-banner-alarm" style={{ width: '100%', textAlign: 'center', padding: '10px 0', marginTop: '20px', border: '1px dashed hsl(var(--border))' }}>
              [ AdMob Banner Ad Unit for Alarm Page ]
            </div>
          */}
        </CardFooter>
      </Card>
    </div>
  );
}

