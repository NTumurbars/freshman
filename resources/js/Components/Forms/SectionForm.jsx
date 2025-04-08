import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function SectionForm({
    data,
    setData,
    errors,
    courses,
    terms,
    professors,
    roomFeatures,
    isSubmitting,
    onSubmit
}) {
    const [selectedFeatures, setSelectedFeatures] = useState(data.required_features || []);
    
    // Log the professor data for debugging
    useEffect(() => {
        console.log("Professor data in SectionForm:", professors);
        console.log("Form data:", data);
    }, [professors, data]);

    // Group features by category
    const featuresByCategory = roomFeatures?.reduce((acc, feature) => {
        const category = feature.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(feature);
        return acc;
    }, {}) || {};

    // Add or remove features
    const toggleFeature = (featureId) => {
        setSelectedFeatures(prev => {
            if (prev.includes(featureId)) {
                return prev.filter(id => id !== featureId);
            } else {
                return [...prev, featureId];
            }
        });
    };

    // Update parent form data when selected features change
    useEffect(() => {
        setData('required_features', selectedFeatures);
    }, [selectedFeatures]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Course Selection */}
            <div>
                <label htmlFor="course_id" className="block text-sm font-medium text-gray-700">
                    Course <span className="text-red-500">*</span>
                </label>
                <select
                    id="course_id"
                    name="course_id"
                    className={`mt-1 block w-full rounded-md border ${errors.course_id ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                    value={data.course_id || ''}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select a course</option>
                    {courses?.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.course_code} - {course.title}
                        </option>
                    ))}
                </select>
                {errors.course_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>
                )}
            </div>

            {/* Term Selection */}
            <div>
                <label htmlFor="term_id" className="block text-sm font-medium text-gray-700">
                    Term <span className="text-red-500">*</span>
                </label>
                <select
                    id="term_id"
                    name="term_id"
                    className={`mt-1 block w-full rounded-md border ${errors.term_id ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                    value={data.term_id || ''}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select a term</option>
                    {terms?.map((term) => (
                        <option key={term.id} value={term.id}>
                            {term.name}
                        </option>
                    ))}
                </select>
                {errors.term_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.term_id}</p>
                )}
            </div>

            {/* Professor Selection */}
            <div>
                <label htmlFor="professor_id" className="block text-sm font-medium text-gray-700">
                    Professor
                </label>
                <select
                    id="professor_id"
                    name="professor_id"
                    className={`mt-1 block w-full rounded-md border ${errors.professor_id ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                    value={data.professor_id || ''}
                    onChange={handleChange}
                >
                    <option value="">Select a professor</option>
                    {professors && Array.isArray(professors) && professors.map((professor) => (
                        <option key={professor.id} value={professor.id}>
                            {professor.name}
                        </option>
                    ))}
                </select>
                {errors.professor_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.professor_id}</p>
                )}
            </div>

            {/* Section Code */}
            <div>
                <label htmlFor="section_code" className="block text-sm font-medium text-gray-700">
                    Section Code <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="section_code"
                    name="section_code"
                    className={`mt-1 block w-full rounded-md border ${errors.section_code ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                    value={data.section_code || ''}
                    onChange={handleChange}
                    required
                    placeholder="e.g. SEC-01A"
                />
                {errors.section_code && (
                    <p className="mt-1 text-sm text-red-600">{errors.section_code}</p>
                )}
            </div>

            {/* Number of Students */}
            <div>
                <label htmlFor="number_of_students" className="block text-sm font-medium text-gray-700">
                    Current Enrollment <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    id="number_of_students"
                    name="number_of_students"
                    min="0"
                    className={`mt-1 block w-full rounded-md border ${errors.number_of_students ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                    value={data.number_of_students || 0}
                    onChange={handleChange}
                    required
                />
                {errors.number_of_students && (
                    <p className="mt-1 text-sm text-red-600">{errors.number_of_students}</p>
                )}
            </div>

            {/* Status */}
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                </label>
                <select
                    id="status"
                    name="status"
                    className={`mt-1 block w-full rounded-md border ${errors.status ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                    value={data.status || 'active'}
                    onChange={handleChange}
                    required
                >
                    <option value="active">Active</option>
                    <option value="canceled">Canceled</option>
                    <option value="full">Full</option>
                    <option value="pending">Pending</option>
                </select>
                {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
            </div>

            {/* Delivery Method */}
            <div>
                <label htmlFor="delivery_method" className="block text-sm font-medium text-gray-700">
                    Delivery Method <span className="text-red-500">*</span>
                </label>
                <select
                    id="delivery_method"
                    name="delivery_method"
                    className={`mt-1 block w-full rounded-md border ${errors.delivery_method ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                    value={data.delivery_method || 'in-person'}
                    onChange={handleChange}
                    required
                >
                    <option value="in-person">In-person</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                </select>
                {errors.delivery_method && (
                    <p className="mt-1 text-sm text-red-600">{errors.delivery_method}</p>
                )}
            </div>

            {/* Notes */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    className={`mt-1 block w-full rounded-md border ${errors.notes ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                    value={data.notes || ''}
                    onChange={handleChange}
                    placeholder="Additional notes about this section"
                ></textarea>
                {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                )}
            </div>

            {/* Room Features */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Required Room Features
                </label>
                <p className="mt-1 text-xs text-gray-500">
                    Select features needed for this section (optional)
                </p>

                {Object.keys(featuresByCategory).length > 0 ? (
                    <div className="mt-2 space-y-4">
                        {Object.entries(featuresByCategory).map(([category, features]) => (
                            <div key={category}>
                                <h4 className="mb-2 text-sm font-medium text-gray-700">{category}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {features.map(feature => (
                                        <button
                                            key={feature.id}
                                            type="button"
                                            onClick={() => toggleFeature(feature.id)}
                                            className={`inline-flex items-center rounded-md px-3 py-1 text-sm ${
                                                selectedFeatures.includes(feature.id)
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {feature.name}
                                            {selectedFeatures.includes(feature.id) && (
                                                <X className="ml-1 h-3 w-3" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-2 text-sm text-gray-500">
                        No room features available
                    </p>
                )}
                {errors.required_features && (
                    <p className="mt-1 text-sm text-red-600">{errors.required_features}</p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-5">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : 'Save Section'}
                </button>
            </div>
        </form>
    );
}
