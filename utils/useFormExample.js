import React from 'react';
import { useForm } from './useForm';

// Example usage of the useForm hook
const ExampleForm = () => {
  const { fields, handleSubmit, populate, clear, get, errors, isValid, isDirty } = useForm(
    {
      // Initial values
      name: '',
      email: '',
      age: '',
      address: {
        street: '',
        city: '',
        country: ''
      },
      preferences: {
        newsletter: false,
        notifications: true
      }
    },
    {
      // Validation rules
      validation: {
        name: {
          required: 'Name is required',
          min: 2,
          max: 50
        },
        email: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Please enter a valid email address'
        },
        age: (value) => {
          const num = parseInt(value);
          if (!value) return 'Age is required';
          if (num < 18) return 'Must be 18 or older';
          if (num > 120) return 'Please enter a valid age';
          return '';
        },
        'address.street': {
          required: 'Street address is required'
        },
        'address.city': {
          required: 'City is required'
        }
      },
      
      // Transform values on change
      transformers: {
        name: (value) => value.replace(/[^a-zA-Z\s]/g, ''), // Only letters and spaces
        age: (value) => value.replace(/[^0-9]/g, ''), // Only numbers
      },
      
      // Validate on change
      validateOnChange: true,
      
      // Submit handler
      onSubmit: async (values, { clear }) => {
        console.log('Submitting:', values);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Form submitted successfully!');
        clear(); // Clear form after successful submission
      }
    }
  );

  const handleAutoFill = () => {
    populate({
      name: 'John Doe',
      email: 'john@example.com',
      age: '25',
      address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA'
      }
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Example Form</h2>
      
      <form onSubmit={handleSubmit()}>
        {/* Basic text input - invisible API */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            {...fields.name}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fields.name.hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {fields.name.error && (
            <p className="mt-1 text-sm text-red-600">{fields.name.error}</p>
          )}
        </div>

        {/* Email input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...fields.email}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fields.email.hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {fields.email.error && (
            <p className="mt-1 text-sm text-red-600">{fields.email.error}</p>
          )}
        </div>

        {/* Age input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="text"
            {...fields.age}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fields.age.hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {fields.age.error && (
            <p className="mt-1 text-sm text-red-600">{fields.age.error}</p>
          )}
        </div>

        {/* Nested fields - address */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <input
            type="text"
            {...fields['address.street']}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fields['address.street'].hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {fields['address.street'].error && (
            <p className="mt-1 text-sm text-red-600">{fields['address.street'].error}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            {...fields['address.city']}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fields['address.city'].hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {fields['address.city'].error && (
            <p className="mt-1 text-sm text-red-600">{fields['address.city'].error}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            {...fields['address.country']}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Checkbox example */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...fields['preferences.newsletter']}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Subscribe to newsletter</span>
          </label>
        </div>

        {/* Form actions */}
        <div className="flex space-x-3 mb-4">
          <button
            type="submit"
            disabled={!isValid}
            className={`flex-1 py-2 px-4 rounded-md font-medium ${
              isValid
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
          
          <button
            type="button"
            onClick={clear}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear
          </button>
          
          <button
            type="button"
            onClick={handleAutoFill}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Auto Fill
          </button>
        </div>

        {/* Form state display */}
        <div className="text-sm text-gray-600">
          <p>Valid: {isValid ? 'Yes' : 'No'}</p>
          <p>Dirty: {isDirty ? 'Yes' : 'No'}</p>
          <p>Current values: {JSON.stringify(get(), null, 2)}</p>
        </div>
      </form>
    </div>
  );
};

// Example with custom validation and manual usage
const ManualForm = () => {
  const { handleChange, handleSubmit, get, clear, errors } = useForm(
    { username: '', password: '' },
    {
      validation: {
        username: (value, allValues) => {
          if (!value) return 'Username is required';
          if (value.length < 3) return 'Username must be at least 3 characters';
          return '';
        },
        password: (value) => {
          if (!value) return 'Password is required';
          if (value.length < 6) return 'Password must be at least 6 characters';
          return '';
        }
      }
    }
  );

  return (
    <form onSubmit={handleSubmit((values) => console.log('Manual form:', values))}>
      <div>
        <input
          name="username"
          value={get('username') || ''}
          onChange={handleChange}
          placeholder="Username"
        />
        {errors.username && <span>{errors.username}</span>}
      </div>
      
      <div>
        <input
          name="password"
          type="password"
          value={get('password') || ''}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && <span>{errors.password}</span>}
      </div>
      
      <button type="submit">Login</button>
      <button type="button" onClick={clear}>Clear</button>
    </form>
  );
};

export { ExampleForm, ManualForm };
