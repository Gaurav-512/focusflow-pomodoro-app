
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DigitalClock } from "@/components/alarm/DigitalClock";
import { useAlarm } from "@/hooks/useAlarm";
import { useToast } from "@/hooks/use-toast"; // Added import
import { BellRing, BellOff, XCircle } from 'lucide-react';

export default function AlarmPage() {
  const { alarm, isAlarmSet, isRinging, setAlarm, clearAlarm, dismissAlarm, formattedAlarmTime } = useAlarm();
  const { toast } = useToast(); // Added hook usage
  const [selectedHour, setSelectedHour] = useState<string>("07");
  const [selectedMinute, setSelectedMinute] = useState<string>("30");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (alarm) {
      setSelectedHour(alarm.hour.toString().padStart(2, '0'));
      setSelectedMinute(alarm.minute.toString().padStart(2, '0'));
    }
  }, [alarm]);


  const handleSetAlarm = () => {
    const hour = parseInt(selectedHour, 10);
    const minute = parseInt(selectedMinute, 10);
    
    const now = new Date();
    const alarmTimeToday = new Date();
    alarmTimeToday.setHours(hour, minute, 0, 0);

    let toastMessage = "Alarm set for " + `${selectedHour}:${selectedMinute}` + ".";

    if (alarmTimeToday < now && !(now.getHours() === hour && now.getMinutes() === minute)) {
      // If the alarm time for today has already passed
      toastMessage = `Alarm set for ${selectedHour}:${selectedMinute}. This time has passed for today; it will ring on the next occurrence.`;
    }
    
    setAlarm(hour, minute);
    toast({
      title: "Alarm Status",
      description: toastMessage,
      duration: 5000,
    });
  };
  
  if (!isMounted) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-950 text-white">
        <p className="text-2xl font-[--font-poppins]">Loading Alarm...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-950 text-white">
      <Card className="w-full max-w-md bg-slate-800/70 backdrop-blur-sm border-slate-700 text-slate-100 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-[--font-poppins] font-bold flex items-center justify-center">
            <BellRing className="mr-3 h-10 w-10" /> FocusFlow Alarm
          </CardTitle>
          <CardDescription className="text-slate-300 pt-2">Set your alarm to stay on track.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-8">
          <DigitalClock size={220} />

          {!isRinging && (
            <div className="w-full space-y-4">
              <div className="flex justify-around items-end space-x-3">
                <div className="flex-1">
                  <Label htmlFor="hour-select" className="text-sm font-medium text-slate-300">Hour</Label>
                  <Select value={selectedHour} onValueChange={setSelectedHour}>
                    <SelectTrigger id="hour-select" className="w-full bg-slate-700 border-slate-600 text-slate-100 focus:ring-purple-500">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                      {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
                        <SelectItem key={h} value={h} className="focus:bg-purple-700">{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-3xl font-mono pb-1">:</span>
                <div className="flex-1">
                  <Label htmlFor="minute-select" className="text-sm font-medium text-slate-300">Minute</Label>
                  <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                    <SelectTrigger id="minute-select" className="w-full bg-slate-700 border-slate-600 text-slate-100 focus:ring-purple-500">
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                        <SelectItem key={m} value={m} className="focus:bg-purple-700">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleSetAlarm}
                size="lg"
                className="w-full text-lg bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all duration-300 ease-in-out transform hover:scale-105"
                style={{ boxShadow: '0 0 15px 2px hsl(var(--primary)/0.5), 0 0 25px 5px hsl(var(--primary)/0.3) inset' }}
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
              className="w-full text-lg bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/50 transition-all duration-300 ease-in-out transform hover:scale-105 animate-pulse"
               style={{ boxShadow: '0 0 15px 5px hsla(0,0%,100%,.3), 0 0 25px 8px hsla(0,0%,100%,.2) inset' }}
            >
              <XCircle className="mr-2 h-6 w-6" /> Dismiss Alarm
            </Button>
          )}

        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center pt-6 space-y-3">
          {isAlarmSet ? (
            <div className="text-center">
              <p className="text-lg text-green-400 font-medium">
                Next Alarm: {formattedAlarmTime}
              </p>
              <Button onClick={clearAlarm} variant="ghost" size="sm" className="text-amber-400 hover:text-amber-500 mt-2">
                <BellOff className="mr-2 h-4 w-4" /> Cancel Alarm
              </Button>
            </div>
          ) : (
            <p className="text-slate-400">No alarm set.</p>
          )}
          {/* AdMob Placeholder */}
          {/* 
            <div id="admob-banner-alarm" style={{ width: '100%', textAlign: 'center', padding: '10px 0', marginTop: '20px', border: '1px dashed #555' }}>
              [ AdMob Banner Ad Unit for Alarm Page ]
            </div>
          */}
        </CardFooter>
      </Card>
    </div>
  );
}

