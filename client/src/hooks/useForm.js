import { useState, useCallback } from 'react';

export function useForm(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(v => ({ ...v, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: null }));
  }, [errors]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValue(name, type === 'checkbox' ? checked : value);
  }, [setValue]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    
    if (validationRules[name] && validationRules[name].length > 0) {
      const rules = validationRules[name];
      for (const rule of rules) {
        const err = rule(values[name]);
        if (err) {
          setErrors(er => ({ ...er, [name]: err }));
          break;
        } else {
          setErrors(er => ({ ...er, [name]: null }));
        }
      }
    }
  }, [values, validationRules]);

  const validate = useCallback(() => {
    const newErrors = {};
    let valid = true;
    
    for (const [field, rules] of Object.entries(validationRules)) {
      if (rules && rules.length > 0) {
        for (const rule of rules) {
          const err = rule(values[field]);
          if (err) {
            newErrors[field] = err;
            valid = false;
            break;
          }
        }
      }
    }
    
    setErrors(newErrors);
    setTouched(Object.fromEntries(Object.keys(validationRules).map(k => [k, true])));
    return valid;
  }, [values, validationRules]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    if (validate()) {
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  }, [validate, values]);

  return { 
    values, 
    errors, 
    touched, 
    isSubmitting,
    handleChange, 
    handleBlur, 
    setValue, 
    validate, 
    reset, 
    setValues,
    handleSubmit
  };
}