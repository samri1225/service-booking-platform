import React, { useState } from 'react';
import { timeOptions } from '../utils/locale';

function TimePicker({ value, onChange, label, required = false }) {
  const [showCustom, setShowCustom] = useState(false);

  // Convert 24h "HH:MM" to 12h "HH:MM AM/PM"
  const to12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            {showCustom ? 'Use list' : 'Custom time'}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {/* Dropdown (30-min slots) */}
        {!showCustom && (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input flex-1"
            required={required}
          >
            <option value="">Select time</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        )}

        {/* Native time input for custom times */}
        {showCustom && (
          <>
            <input
              type="time"
              onChange={(e) => {
                if (!e.target.value) return;
                onChange(to12Hour(e.target.value));
              }}
              className="input flex-1"
              aria-label="Custom time"
            />
            {value && (
              <div className="flex items-center px-3 bg-brand-50 border border-brand-200 rounded-xl text-sm font-medium text-brand-700 whitespace-nowrap">
                {value}
              </div>
            )}
          </>
        )}
      </div>

      {!showCustom && value && (
        <p className="mt-1.5 text-xs text-brand-600 font-medium">
          Selected: {value}
        </p>
      )}
      {showCustom && !value && (
        <p className="mt-1.5 text-xs text-slate-400">
          Pick any time (down to the minute)
        </p>
      )}
    </div>
  );
}

export default TimePicker;