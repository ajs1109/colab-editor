'use client';

import { useState } from 'react';
import { ProfilePhotoUploader } from '@/components/ProfilePhotoUploader';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash, Loader2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { primaryBtnStyles } from '../commonStyles';
import { users, type IUser } from '@/utils/users';
import Link from 'next/link';
import { Eye } from 'lucide-react';

const profileFormSchema = z.object({
  name: z
    .string({
      required_error: 'Name must be provided.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  email: z
    .string({
      required_error: 'Email address must be provided.',
    })
    .email(),
  description: z.string().max(160).optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url({ message: 'Please enter a valid URL.' }),
      })
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialData: IUser;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<IUser>(initialData);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: initialData.email,
      name: initialData.name,
      description: initialData.description || '',
      links: initialData.links?.map(({ label, url }) => ({ label, url })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'links',
    control: form.control,
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!userData) return;

    try {
      setIsSaving(true);
      await users.updateProfile(userData.id, {
        name: data.name,
        description: data.description,
        links: data.links?.map(({ label, url }) => ({
          label,
          url,
          id: crypto.randomUUID(),
        })),
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-[24rem] md:w-[36rem] mx-auto px-6 pb-4">
      <div className="flex justify-between items-center py-6">
        <h1 className="text-2xl">Profile</h1>
        {userData && (
          <Button variant="outline" asChild>
            <Link
              href={`/profile/${userData.id}`}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View public profile
            </Link>
          </Button>
        )}
      </div>
      <ProfilePhotoUploader
        currentPhotoUrl={userData?.avatar}
        userProvider={userData?.provider}
        onPhotoUploaded={async (url: string) => {
          if (!userData) return;
          await users.updateProfile(userData.id, { avatar: url });
          setUserData({ ...userData, avatar: url });
        }}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`links.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>
                      URLs
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && 'sr-only')}>
                      Add links to your website, blog, or social media profiles.
                    </FormDescription>
                    <div className="flex gap-1">
                      <FormControl className="w-[100px]">
                        <Input
                          placeholder="Platform"
                          value={field.value.label}
                          onChange={(e) =>
                            field.onChange({
                              ...field.value,
                              label: e.target.value,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/username"
                          value={field.value.url}
                          onChange={(e) =>
                            field.onChange({
                              ...field.value,
                              url: e.target.value,
                            })
                          }
                        />
                      </FormControl>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="p-2 text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-800 dark:hover:bg-red-900 dark:hover:text-red-300"
                          onClick={() => remove(index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ label: '', url: '' })}
            >
              Add URL
            </Button>
          </div>
          <Button
            type="submit"
            className={cn(primaryBtnStyles)}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Update profile'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
