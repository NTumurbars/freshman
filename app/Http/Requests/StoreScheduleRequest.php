<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->can('create', \App\Models\Schedule::class); }

    public function rules(): array
    {
        return [
            'section_id'  => ['required','exists:sections,id'],
            'day_of_week' => ['required', Rule::in(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'])],
            'start_time'  => ['required','date_format:H:i'],
            'end_time'    => ['required','date_format:H:i','after:start_time'],
            'meeting_pattern' => ['required', Rule::in(['single','weekly','monday-wednesday-friday','tuesday-thursday','monday-wednesday','tuesday-friday'])],
            'location_type'   => ['required', Rule::in(['in-person','virtual','hybrid'])],
            'room_id'         => ['nullable','required_if:location_type,in-person,hybrid','exists:rooms,id'],
            'virtual_meeting_url' => ['nullable','required_if:location_type,virtual,hybrid','url'],
            'update_section_capacity' => ['sometimes','boolean'],
            'new_capacity'            => ['sometimes','integer','min:1'],
        ];
    }

    public function prepareForValidation(): void
    {
        // normalise in_person → in-person
        if ($this->location_type === 'in_person') {
            $this->merge(['location_type' => 'in-person']);
        }
    }
}
