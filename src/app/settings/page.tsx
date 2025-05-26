
"use client";

import { useSettings } from '@/providers/SettingsProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SessionType, Settings as ISettings } from '@/lib/constants';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const settingsSchema = z.object({
  focusDuration: z.number().min(1).max(120),
  shortBreakDuration: z.number().min(1).max(60),
  longBreakDuration: z.number().min(1).max(90),
  isMuted: z.boolean(),
  theme: z.enum(['light', 'dark', 'system']),
  autoStartBreaks: z.boolean(),
  autoStartFocus: z.boolean(),
  longBreakInterval: z.number().min(1).max(10),
});

type FormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings: resetGlobalSettings } = useSettings();
  const { toast } = useToast();

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...settings,
      focusDuration: settings.focusDuration / 60,
      shortBreakDuration: settings.shortBreakDuration / 60,
      longBreakDuration: settings.longBreakDuration / 60,
    },
  });

  useEffect(() => {
    reset({ // Ensure form syncs if global settings change (e.g. reset button)
      ...settings,
      focusDuration: settings.focusDuration / 60,
      shortBreakDuration: settings.shortBreakDuration / 60,
      longBreakDuration: settings.longBreakDuration / 60,
    });
  }, [settings, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const newSettings: Partial<ISettings> = {
      ...data,
      focusDuration: data.focusDuration * 60,
      shortBreakDuration: data.shortBreakDuration * 60,
      longBreakDuration: data.longBreakDuration * 60,
    };
    updateSettings(newSettings);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  const handleResetSettings = () => {
    resetGlobalSettings(); // This will trigger the useEffect above to reset form
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to default values.",
    });
  };

  const getError = (fieldName: keyof FormValues) => errors[fieldName]?.message as string | undefined;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Settings</CardTitle>
          <CardDescription>Customize your FocusFlow experience.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Timer Durations (minutes)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="focusDuration">Focus</Label>
                  <Controller
                    name="focusDuration"
                    control={control}
                    render={({ field }) => <Input id="focusDuration" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />}
                  />
                  {getError('focusDuration') && <p className="text-sm text-destructive mt-1">{getError('focusDuration')}</p>}
                </div>
                <div>
                  <Label htmlFor="shortBreakDuration">Short Break</Label>
                  <Controller
                    name="shortBreakDuration"
                    control={control}
                    render={({ field }) => <Input id="shortBreakDuration" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />}
                  />
                   {getError('shortBreakDuration') && <p className="text-sm text-destructive mt-1">{getError('shortBreakDuration')}</p>}
                </div>
                <div>
                  <Label htmlFor="longBreakDuration">Long Break</Label>
                  <Controller
                    name="longBreakDuration"
                    control={control}
                    render={({ field }) => <Input id="longBreakDuration" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />}
                  />
                  {getError('longBreakDuration') && <p className="text-sm text-destructive mt-1">{getError('longBreakDuration')}</p>}
                </div>
              </div>
                 <div>
                  <Label htmlFor="longBreakInterval">Long Break Interval</Label>
                  <Controller
                    name="longBreakInterval"
                    control={control}
                    render={({ field }) => <Input id="longBreakInterval" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} placeholder="Focus sessions before long break" />}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Number of Focus sessions before a Long Break.</p>
                  {getError('longBreakInterval') && <p className="text-sm text-destructive mt-1">{getError('longBreakInterval')}</p>}
                </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preferences</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
                <Controller name="autoStartBreaks" control={control} render={({ field }) => <Switch id="autoStartBreaks" checked={field.value} onCheckedChange={field.onChange} />} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoStartFocus">Auto-start Focus after Break</Label>
                <Controller name="autoStartFocus" control={control} render={({ field }) => <Switch id="autoStartFocus" checked={field.value} onCheckedChange={field.onChange} />} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isMuted">Mute Notifications</Label>
                 <Controller name="isMuted" control={control} render={({ field }) => <Switch id="isMuted" checked={field.value} onCheckedChange={field.onChange} />} />
              </div>
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Controller
                  name="theme"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-6">
            <Button type="button" variant="outline" onClick={handleResetSettings}>
              Reset to Defaults
            </Button>
            <Button type="submit" disabled={!isDirty}>Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
