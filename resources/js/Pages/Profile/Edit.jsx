import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/Layouts/AppLayout';
import { usePage } from '@inertiajs/inertia-react';

const EditProfile = () => {
  const { auth, errors } = usePage().props;
  const [values, setValues] = useState({
    name: auth.user.name,
    email: auth.user.email,
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route('profile.update'), values);
  };

  return (
    <AppLayout>
      <div className="profile-edit-container">
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input type="text" name="name" value={values.name} onChange={handleChange} />
            {errors.name && <div className="text-red-600">{errors.name}</div>}
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email" value={values.email} onChange={handleChange} />
            {errors.email && <div className="text-red-600">{errors.email}</div>}
          </div>
          <button type="submit">Update Profile</button>
        </form>
      </div>
    </AppLayout>
  );
};

export default EditProfile;
