import { ProfileSetupForm } from './ProfileSetupForm';
import { Suspense } from 'react';

// Loading component for the Suspense boundary
function ProfileSetupLoading() {
  return (
    <div className="flex h-minus-135 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<ProfileSetupLoading />}>
      <ProfileSetupForm />
    </Suspense>
  );
}