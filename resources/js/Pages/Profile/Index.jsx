import React from 'react';
import { InertiaLink, usePage } from '@inertiajs/inertia-react';
import AppLayout from '@/Layouts/AppLayout';

const Profile = () => {
  const { auth } = usePage().props;
  return (
    <AppLayout>
      <div className="profile-container">
        <h1>Your Profile</h1>
        <p><strong>Name:</strong> {auth.user.name}</p>
        <p><strong>Email:</strong> {auth.user.email}</p>
        <InertiaLink href={route('profile.edit')}>Edit Profile</InertiaLink>
      </div>
    </AppLayout>
  );
};

export default Profile;
