import { useState, useCallback, useMemo } from 'react';

/**
 * A flexible, invisible form hook that handles state, validation, and event wiring
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Object} options - Configuration options
 * @param {Object} options.validation - Validation rules object
 * @param {Function} options.onSubmit - Submit handler function
 * @param {boolean} options.validateOnChange - Whether to validate on every change
 * @param {boolean} options.validateOnBlur - Whether to validate on blur
 * @returns {Object} Form utilities and state
 */
export const useForm = (initialValues = {}, options = {}) => {
  const {
    validation = {},
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true,
    transformers = {}
  } = options;

  // Core state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get nested value
  const getNestedValue = useCallback((obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((value, key) => value?.[key], obj);
  }, []);

  // Helper function to set nested value
  const setNestedValue = useCallback((obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((acc, key) => {
      if (!acc[key]) acc[key] = {};
      return acc[key];
    }, obj);
    target[lastKey] = value;
    return { ...obj };
  }, []);

  // Validation function
  const validateField = useCallback((name, value, allValues) => {
    const rule = validation[name];
    if (!rule) return '';

    if (typeof rule === 'function') {
      return rule(value, allValues) || '';
    }

    if (typeof rule === 'object') {
      // Handle validation object with multiple rules
      if (rule.required && (!value || value.toString().trim() === '')) {
        return rule.required === true ? `${name} is required` : rule.required;
      }

      if (rule.min && value && value.length < rule.min) {
        return `${name} must be at least ${rule.min} characters`;
      }

      if (rule.max && value && value.length > rule.max) {
        return `${name} must be no more than ${rule.max} characters`;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        return rule.message || `${name} format is invalid`;
      }

      if (rule.custom && typeof rule.custom === 'function') {
        return rule.custom(value, allValues) || '';
      }
    }

    return '';
  }, [validation]);

  // Validate all fields
  const validateAll = useCallback((valuesToValidate) => {
    const newErrors = {};
    Object.keys(validation).forEach(name => {
      const value = getNestedValue(valuesToValidate, name);
      const error = validateField(name, value, valuesToValidate);
      if (error) {
        newErrors[name] = error;
      }
    });
    return newErrors;
  }, [validation, validateField, getNestedValue]);

  // Generic change handler
  const handleChange = useCallback((nameOrEvent, valueOrTransform) => {
    let name, value;

    // Handle both event objects and direct name/value calls
    if (typeof nameOrEvent === 'string') {
      name = nameOrEvent;
      value = valueOrTransform;
    } else if (nameOrEvent?.target) {
      const target = nameOrEvent.target;
      name = target.name;
      value = target.type === 'checkbox' ? target.checked : target.value;
    } else {
      return;
    }

    // Apply transformer if exists
    const transformer = transformers[name];
    if (transformer && typeof transformer === 'function') {
      value = transformer(value);
    }

    setValues(prev => setNestedValue({ ...prev }, name, value));

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on change if enabled
    if (validateOnChange) {
      const newValues = setNestedValue({ ...values }, name, value);
      const error = validateField(name, value, newValues);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateOnChange, validateField, values, transformers, setNestedValue]);

  // Handle blur events
  const handleBlur = useCallback((nameOrEvent) => {
    let name;
    
    if (typeof nameOrEvent === 'string') {
      name = nameOrEvent;
    } else if (nameOrEvent?.target) {
      name = nameOrEvent.target.name;
    } else {
      return;
    }

    setTouched(prev => ({ ...prev, [name]: true }));

    if (validateOnBlur) {
      const value = getNestedValue(values, name);
      const error = validateField(name, value, values);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateOnBlur, validateField, values, getNestedValue]);

  // Submit handler
  const handleSubmit = useCallback((submitHandler) => {
    return async (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      setIsSubmitting(true);

      // Validate all fields
      const validationErrors = validateAll(values);
      setErrors(validationErrors);

      // Mark all fields as touched
      const allTouched = Object.keys(validation).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(prev => ({ ...prev, ...allTouched }));

      // If there are errors, don't submit
      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }

      try {
        // Use provided handler or the one from options
        const handler = submitHandler || onSubmit;
        if (handler) {
          // Create utility functions inline to avoid circular dependencies
          const formUtils = {
            clear: () => {
              setValues(initialValues);
              setErrors({});
              setTouched({});
              setIsSubmitting(false);
            },
            populate: (data) => {
              setValues(prev => ({ ...prev, ...data }));
            },
            get: (fieldName) => {
              if (fieldName) {
                return getNestedValue(values, fieldName);
              }
              return values;
            }
          };
          await handler(values, formUtils);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        // You might want to set form-level errors here
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validateAll, validation, onSubmit, initialValues, getNestedValue]);

  // Populate multiple fields
  const populate = useCallback((data) => {
    setValues(prev => {
      const newValues = { ...prev, ...data };
      
      // Clear errors for populated fields if validateOnChange is enabled
      if (validateOnChange) {
        const newErrors = validateAll(newValues);
        setErrors(newErrors);
      }
      
      return newValues;
    });
  }, [validateOnChange, validateAll]);

  // Clear form
  const clear = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Get field value(s)
  const get = useCallback((fieldName) => {
    if (fieldName) {
      return getNestedValue(values, fieldName);
    }
    return values;
  }, [values, getNestedValue]);

  // Generate field objects for easy spreading
  const fields = useMemo(() => {
    const fieldObjects = {};
    
    // Create field objects for all current values and validation rules
    const allFieldNames = new Set([
      ...Object.keys(values),
      ...Object.keys(validation)
    ]);

    allFieldNames.forEach(name => {
      const value = getNestedValue(values, name) || '';
      const error = errors[name];
      const isTouched = touched[name];

      fieldObjects[name] = {
        value,
        onChange: (e) => handleChange(name, e?.target ? e.target.value : e),
        onBlur: () => handleBlur(name),
        error: isTouched ? error : '',
        name,
        // Additional utilities
        // hasError: Boolean(isTouched && error),
        // isTouched
      };
    });

    return fieldObjects;
  }, [values, errors, touched, handleChange, handleBlur, validation, getNestedValue]);

  // Return API
  return {
    // Core API
    fields,
    handleChange,
    handleSubmit,
    populate,
    clear,
    get,
    errors,
    
    // Additional utilities
    values,
    touched,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    isDirty: Object.keys(touched).length > 0,
    
    // Advanced utilities
    setFieldValue: handleChange,
    setFieldError: (name, error) => setErrors(prev => ({ ...prev, [name]: error })),
    setFieldTouched: (name, isTouched = true) => setTouched(prev => ({ ...prev, [name]: isTouched })),
    validateField: (name) => {
      const value = getNestedValue(values, name);
      const error = validateField(name, value, values);
      setErrors(prev => ({ ...prev, [name]: error }));
      return error;
    },
    validateForm: () => {
      const validationErrors = validateAll(values);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    },
    resetField: (name) => {
      const initialValue = getNestedValue(initialValues, name);
      setValues(prev => setNestedValue({ ...prev }, name, initialValue));
      setErrors(prev => ({ ...prev, [name]: '' }));
      setTouched(prev => ({ ...prev, [name]: false }));
    }
  };
};

export default useForm;