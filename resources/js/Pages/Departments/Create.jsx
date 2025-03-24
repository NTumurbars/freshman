import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/Layouts/AppLayout';

const DepartmentCreate = ({ schools }) => {
  const [values, setValues] = useState({
    school_id: '',
    name: '',
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route('departments.store'), values);
  };

  return (
    <AppLayout>
      <div>
        <h1>Create Department</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>School</label>
            <select name="school_id" value={values.school_id} onChange={handleChange}>
              <option value="">Select a School</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Department Name</label>
            <input type="text" name="name" value={values.name} onChange={handleChange} />
          </div>
          <button type="submit">Create Department</button>
        </form>
      </div>
    </AppLayout>
  );
};

export default DepartmentCreate;
