import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/Layouts/AppLayout';

const DepartmentEdit = ({ department, schools }) => {
  const [values, setValues] = useState({
    school_id: department.school_id,
    name: department.name,
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route('departments.update', department.id), values);
  };

  return (
    <AppLayout>
      <div>
        <h1>Edit Department</h1>
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
          <button type="submit">Update Department</button>
        </form>
      </div>
    </AppLayout>
  );
};

export default DepartmentEdit;
