import AppLayout from '@/Layouts/AppLayout';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { useState } from 'react';

const DepartmentEdit = ({ department, schools }) => {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
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
        <AppLayout userRole={userRole} school={school}>
            <div>
                <h1>Edit Department</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>School</label>
                        <select
                            name="school_id"
                            value={values.school_id}
                            onChange={handleChange}
                        >
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
                        <input
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit">Update Department</button>
                </form>
            </div>
        </AppLayout>
    );
};

export default DepartmentEdit;
