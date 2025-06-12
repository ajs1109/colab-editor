'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { Icons as SvgIcons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/apiClient';

export function ProfileSetupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  // Get the redirect path from search params
  const nextPath = searchParams.get('next') || '/projects';

  // Debounce username checking
  useEffect(() => {
    if (!username.trim()) {
      setUsernameError('');
      setIsUsernameValid(false);
      return;
    }

    // Basic validation
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      setIsUsernameValid(false);
      return;
    }

    if (username.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      setIsUsernameValid(false);
      return;
    }

    // Check if username contains only valid characters (alphanumeric, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameError('Username can only contain letters, numbers, underscores, and hyphens');
      setIsUsernameValid(false);
      return;
    }

    // Debounce the uniqueness check
    const timeoutId = setTimeout(() => {
      checkUsernameUniqueness(username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const checkUsernameUniqueness = async (usernameToCheck: string) => {
    setIsCheckingUsername(true);
    setUsernameError('');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('name', usernameToCheck.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error checking username:', error);
        setUsernameError('Error checking username availability');
        setIsUsernameValid(false);
        return;
      }

      if (data) {
        setUsernameError('This username is already taken');
        setIsUsernameValid(false);
      } else {
        setUsernameError('');
        setIsUsernameValid(true);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setUsernameError('Error checking username availability');
      setIsUsernameValid(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isUsernameValid || isCheckingUsername) {
      return;
    }

    try {
      setIsLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Update user's name in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({ name: username.trim().toLowerCase() })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Success!',
        description: 'Your username has been set successfully.',
        duration: 3000,
      });

      // Redirect to the next path or projects page
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      console.error('Profile setup error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to set username. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInputState = () => {
    if (!username.trim()) return 'default';
    if (isCheckingUsername) return 'checking';
    if (usernameError) return 'error';
    if (isUsernameValid) return 'success';
    return 'default';
  };

  const inputState = getInputState();

  return (
    <div className="flex h-minus-135 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-96">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription className="text-sm">
              Choose a unique username to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  className={`pr-10 ${
                    inputState === 'error' 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : inputState === 'success'
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                      : ''
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isCheckingUsername && (
                    <SvgIcons.spinner className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                  {inputState === 'success' && (
                    <Icons.checkCircle className="h-4 w-4 text-green-500" />
                  )}
                  {inputState === 'error' && (
                    <Icons.x className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              {usernameError && (
                <p className="text-sm text-red-600">{usernameError}</p>
              )}
              {isUsernameValid && (
                <p className="text-sm text-green-600">Username is available!</p>
              )}
              <p className="text-xs text-gray-500">
                Username must be 3-20 characters long and can only contain letters, numbers, underscores, and hyphens.
              </p>
            </div>

            <Button 
              className="w-full" 
              type="submit" 
              disabled={isLoading || !isUsernameValid || isCheckingUsername}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Complete Setup
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}