// Schema Builder - Robust Validation Library

/**
 * Utility functions for type checking and security
 */
const ValidationUtils = {
  /**
   * Safely checks if a value is a plain object (not array, null, or other types)
   * @param {any} value - Value to check
   * @returns {boolean} True if value is a plain object
   */
  isPlainObject(value) {
    return value !== null && 
           typeof value === 'object' && 
           !Array.isArray(value) && 
           Object.prototype.toString.call(value) === '[object Object]';
  },

  /**
   * Safely checks if a value is a valid array
   * @param {any} value - Value to check  
   * @returns {boolean} True if value is an array
   */
  isValidArray(value) {
    return Array.isArray(value);
  },

  /**
   * Safely checks if a value is a string
   * @param {any} value - Value to check
   * @returns {boolean} True if value is a string
   */
  isString(value) {
    return typeof value === 'string';
  },

  /**
   * Safely checks if a value is a number (excluding NaN)
   * @param {any} value - Value to check
   * @returns {boolean} True if value is a valid number
   */
  isNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  },

  /**
   * Safely checks if a value is a boolean
   * @param {any} value - Value to check
   * @returns {boolean} True if value is a boolean
   */
  isBoolean(value) {
    return typeof value === 'boolean';
  },

  /**
   * Safely checks if a value is a Date object
   * @param {any} value - Value to check
   * @returns {boolean} True if value is a valid Date
   */
  isDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
  },

  /**
   * Creates a deep clone of simple objects/arrays to prevent mutation
   * @param {any} value - Value to clone
   * @returns {any} Cloned value
   */
  safeClone(value) {
    if (value === null || typeof value !== 'object') {
      return value;
    }
    
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this.safeClone(item));
    }
    
    if (this.isPlainObject(value)) {
      const cloned = {};
      for (const key in value) {
        // Protect against prototype pollution
        if (Object.prototype.hasOwnProperty.call(value, key) && key !== '__proto__') {
          cloned[key] = this.safeClone(value[key]);
        }
      }
      return cloned;
    }
    
    return value;
  },

  /**
   * Validates that a message is a safe string
   * @param {any} message - Message to validate
   * @returns {string|null} Safe message or null
   */
  sanitizeMessage(message) {
    if (typeof message === 'string' && message.length > 0 && message.length <= 1000) {
      return message;
    }
    return null;
  }
};

/**
 * Base Validator class - provides common validation functionality
 * @abstract
 */
class Validator {
  /**
   * Creates a new Validator instance
   */
  constructor() {
    /** @type {boolean} Whether this validator allows undefined/null values */
    this.isOptional = false;
    /** @type {string|null} Custom error message */
    this.customMessage = null;
    /** @type {boolean} Whether the validator has been frozen */
    this._frozen = false;
  }
  
  /**
   * Marks this validator as optional (allows undefined/null values)
   * @returns {Validator} This validator instance for chaining
   * @throws {Error} If validator is frozen
   */
  optional() {
    this._ensureNotFrozen();
    this.isOptional = true;
    return this;
  }
  
  /**
   * Sets a custom error message for this validator
   * @param {string} message - Custom error message
   * @returns {Validator} This validator instance for chaining
   * @throws {Error} If validator is frozen or message is invalid
   */
  withMessage(message) {
    this._ensureNotFrozen();
    const sanitized = ValidationUtils.sanitizeMessage(message);
    if (sanitized === null) {
      throw new Error('Message must be a non-empty string with max length 1000');
    }
    this.customMessage = sanitized;
    return this;
  }
  
  /**
   * Validates a value against this validator's rules
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: any, error?: string, fieldErrors?: Object, itemErrors?: Object}} Validation result
   */
  validate(value) {
    try {
      // Handle optional values first
      if (this.isOptional && (value === undefined || value === null)) {
        return { isValid: true, value: value };
      }
      
      // Handle required but missing values
      if (!this.isOptional && (value === undefined || value === null)) {
        return { 
          isValid: false, 
          error: this.customMessage || 'Value is required' 
        };
      }
      
      // Perform actual validation
      const result = this.validateValue(value);
      
      // Ensure result is properly formatted
      if (!result || typeof result !== 'object') {
        return {
          isValid: false,
          error: 'Internal validation error'
        };
      }
      
      return result;
    } catch (error) {
      // Handle unexpected errors gracefully
      return {
        isValid: false,
        error: this.customMessage || 'Validation error occurred'
      };
    }
  }
  
  /**
   * Performs the actual validation logic - must be implemented by subclasses
   * @abstract
   * @param {any} value - Value to validate (guaranteed to not be null/undefined if required)
   * @returns {{isValid: boolean, value?: any, error?: string, fieldErrors?: Object, itemErrors?: Object}} Validation result
   * @throws {Error} If not implemented by subclass
   */
  validateValue(value) {
    throw new Error('validateValue must be implemented by subclass');
  }

  /**
   * Freezes this validator to prevent further modifications
   * @returns {Validator} This validator instance
   */
  freeze() {
    this._frozen = true;
    return this;
  }

  /**
   * Ensures the validator is not frozen before making changes
   * @private
   * @throws {Error} If validator is frozen
   */
  _ensureNotFrozen() {
    if (this._frozen) {
      throw new Error('Cannot modify frozen validator');
    }
  }
}

/**
 * String Validator - validates string values with length and pattern constraints
 * @extends Validator
 */
class StringValidator extends Validator {
  /**
   * Creates a new StringValidator instance
   */
  constructor() {
    super();
    /** @type {number|null} Minimum string length */
    this.minLen = null;
    /** @type {number|null} Maximum string length */
    this.maxLen = null;
    /** @type {RegExp|null} Regex pattern to match */
    this.regexPattern = null;
  }
  
  /**
   * Sets minimum length constraint
   * @param {number} min - Minimum length (must be >= 0)
   * @returns {StringValidator} This validator instance for chaining
   * @throws {Error} If min is not a valid number or validator is frozen
   */
  minLength(min) {
    this._ensureNotFrozen();
    if (!ValidationUtils.isNumber(min) || min < 0 || !Number.isInteger(min)) {
      throw new Error('minLength must be a non-negative integer');
    }
    this.minLen = min;
    return this;
  }
  
  /**
   * Sets maximum length constraint
   * @param {number} max - Maximum length (must be >= 0)
   * @returns {StringValidator} This validator instance for chaining
   * @throws {Error} If max is not a valid number or validator is frozen
   */
  maxLength(max) {
    this._ensureNotFrozen();
    if (!ValidationUtils.isNumber(max) || max < 0 || !Number.isInteger(max)) {
      throw new Error('maxLength must be a non-negative integer');
    }
    if (this.minLen !== null && max < this.minLen) {
      throw new Error('maxLength must be greater than or equal to minLength');
    }
    this.maxLen = max;
    return this;
  }
  
  /**
   * Sets regex pattern constraint
   * @param {RegExp} regex - Regular expression pattern
   * @returns {StringValidator} This validator instance for chaining
   * @throws {Error} If regex is not a RegExp or validator is frozen
   */
  pattern(regex) {
    this._ensureNotFrozen();
    if (!(regex instanceof RegExp)) {
      throw new Error('pattern must be a RegExp object');
    }
    this.regexPattern = regex;
    return this;
  }
  
  /**
   * Validates email format
   * @returns {StringValidator} This validator instance for chaining
   * @throws {Error} If validator is frozen
   */
  email() {
    this._ensureNotFrozen();
    this.regexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this;
  }
  
  /**
   * Validates URL format (HTTP/HTTPS)
   * @returns {StringValidator} This validator instance for chaining
   * @throws {Error} If validator is frozen
   */
  url() {
    this._ensureNotFrozen();
    this.regexPattern = /^https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w/_.])*)?(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?$/;
    return this;
  }
  
  /**
   * Validates UUID format (v4)
   * @returns {StringValidator} This validator instance for chaining
   * @throws {Error} If validator is frozen
   */
  uuid() {
    this._ensureNotFrozen();
    this.regexPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return this;
  }
  
  /**
   * Validates hexadecimal string
   * @returns {StringValidator} This validator instance for chaining
   * @throws {Error} If validator is frozen
   */
  hex() {
    this._ensureNotFrozen();
    this.regexPattern = /^[0-9a-fA-F]+$/;
    return this;
  }
  
  /**
   * Validates base64 string
   * @returns {StringValidator} This validator instance for chaining
   * @throws {Error} If validator is frozen
   */
  base64() {
    this._ensureNotFrozen();
    this.regexPattern = /^[A-Za-z0-9+/]*={0,2}$/;
    return this;
  }
  
  /**
   * Validates a string value
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: string, error?: string}} Validation result
   */
  validateValue(value) {
    // Type check
    if (!ValidationUtils.isString(value)) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Value must be a string' 
      };
    }
    
    // Length validation (early return for performance)
    if (this.minLen !== null && value.length < this.minLen) {
      return { 
        isValid: false, 
        error: this.customMessage || `String must be at least ${this.minLen} characters long` 
      };
    }
    
    if (this.maxLen !== null && value.length > this.maxLen) {
      return { 
        isValid: false, 
        error: this.customMessage || `String must be no more than ${this.maxLen} characters long` 
      };
    }
    
    // Pattern validation
    if (this.regexPattern && !this.regexPattern.test(value)) {
      return { 
        isValid: false, 
        error: this.customMessage || 'String does not match required pattern' 
      };
    }
    
    return { isValid: true, value: value };
  }
}

/**
 * Number Validator - validates numeric values with range and integer constraints
 * @extends Validator
 */
class NumberValidator extends Validator {
  /**
   * Creates a new NumberValidator instance
   */
  constructor() {
    super();
    /** @type {number|null} Minimum value */
    this.minVal = null;
    /** @type {number|null} Maximum value */
    this.maxVal = null;
    /** @type {boolean} Whether value must be an integer */
    this.isIntegerRequired = false;
    /** @type {number|null} Value must be a multiple of this number */
    this.multipleOfValue = null;
  }
  
  /**
   * Sets minimum value constraint
   * @param {number} minValue - Minimum value
   * @returns {NumberValidator} This validator instance for chaining
   * @throws {Error} If minValue is not a valid number or validator is frozen
   */
  min(minValue) {
    this._ensureNotFrozen();
    if (!ValidationUtils.isNumber(minValue)) {
      throw new Error('min must be a valid number');
    }
    this.minVal = minValue;
    return this;
  }
  
  /**
   * Sets maximum value constraint
   * @param {number} maxValue - Maximum value
   * @returns {NumberValidator} This validator instance for chaining
   * @throws {Error} If maxValue is not a valid number or validator is frozen
   */
  max(maxValue) {
    this._ensureNotFrozen();
    if (!ValidationUtils.isNumber(maxValue)) {
      throw new Error('max must be a valid number');
    }
    if (this.minVal !== null && maxValue < this.minVal) {
      throw new Error('max must be greater than or equal to min');
    }
    this.maxVal = maxValue;
    return this;
  }
  
  /**
   * Requires the value to be an integer
   * @returns {NumberValidator} This validator instance for chaining
   * @throws {Error} If validator is frozen
   */
  integer() {
    this._ensureNotFrozen();
    this.isIntegerRequired = true;
    return this;
  }
  
  /**
   * Requires the value to be positive (> 0)
   * @returns {NumberValidator} This validator instance for chaining
   * @throws {Error} If validator is frozen
   */
  positive() {
    this._ensureNotFrozen();
    this.minVal = 0.000001; // Slightly above 0 to exclude 0
    return this;
  }
  
  /**
   * Requires the value to be negative (< 0)
   * @returns {NumberValidator} This validator instance for chaining
   * @throws {Error} If validator is frozen
   */
  negative() {
    this._ensureNotFrozen();
    this.maxVal = -0.000001; // Slightly below 0 to exclude 0
    return this;
  }
  
  /**
   * Requires the value to be non-negative (>= 0)
   * @returns {NumberValidator} This validator instance for chaining
   * @throws {Error} If validator is frozen
   */
  nonNegative() {
    this._ensureNotFrozen();
    this.minVal = 0;
    return this;
  }
  
  /**
   * Requires the value to be a multiple of the given number
   * @param {number} multipleOf - The number to be a multiple of
   * @returns {NumberValidator} This validator instance for chaining
   * @throws {Error} If validator is frozen or multipleOf is invalid
   */
  multipleOf(multipleOf) {
    this._ensureNotFrozen();
    if (!ValidationUtils.isNumber(multipleOf) || multipleOf <= 0) {
      throw new Error('multipleOf must be a positive number');
    }
    this.multipleOfValue = multipleOf;
    return this;
  }
  
  /**
   * Validates a numeric value
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: number, error?: string}} Validation result
   */
  validateValue(value) {
    // Type check (excludes NaN and Infinity based on our isNumber utility)
    if (!ValidationUtils.isNumber(value)) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Value must be a number' 
      };
    }
    
    // Integer validation (early return for performance)
    if (this.isIntegerRequired && !Number.isInteger(value)) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Value must be an integer' 
      };
    }
    
    // Range validation
    if (this.minVal !== null && value < this.minVal) {
      return { 
        isValid: false, 
        error: this.customMessage || `Number must be at least ${this.minVal}` 
      };
    }
    
    if (this.maxVal !== null && value > this.maxVal) {
      return { 
        isValid: false, 
        error: this.customMessage || `Number must be no more than ${this.maxVal}` 
      };
    }
    
    // Multiple validation
    if (this.multipleOfValue !== null && value % this.multipleOfValue !== 0) {
      return { 
        isValid: false, 
        error: this.customMessage || `Number must be a multiple of ${this.multipleOfValue}` 
      };
    }
    
    return { isValid: true, value: value };
  }
}

/**
 * Boolean Validator - validates boolean values
 * @extends Validator
 */
class BooleanValidator extends Validator {
  /**
   * Creates a new BooleanValidator instance
   */
  constructor() {
    super();
  }
  
  /**
   * Validates a boolean value
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: boolean, error?: string}} Validation result
   */
  validateValue(value) {
    if (!ValidationUtils.isBoolean(value)) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Value must be a boolean' 
      };
    }
    
    return { isValid: true, value: value };
  }
}

/**
 * Date Validator - validates Date objects and date strings with range constraints
 * @extends Validator
 */
class DateValidator extends Validator {
  /**
   * Creates a new DateValidator instance
   */
  constructor() {
    super();
    /** @type {Date|null} Minimum date */
    this.minDate = null;
    /** @type {Date|null} Maximum date */
    this.maxDate = null;
  }
  
  /**
   * Sets minimum date constraint
   * @param {Date} minDate - Minimum date
   * @returns {DateValidator} This validator instance for chaining
   * @throws {Error} If minDate is not a valid Date or validator is frozen
   */
  min(minDate) {
    this._ensureNotFrozen();
    if (!ValidationUtils.isDate(minDate)) {
      throw new Error('min must be a valid Date object');
    }
    this.minDate = minDate;
    return this;
  }
  
  /**
   * Sets maximum date constraint
   * @param {Date} maxDate - Maximum date
   * @returns {DateValidator} This validator instance for chaining
   * @throws {Error} If maxDate is not a valid Date or validator is frozen
   */
  max(maxDate) {
    this._ensureNotFrozen();
    if (!ValidationUtils.isDate(maxDate)) {
      throw new Error('max must be a valid Date object');
    }
    if (this.minDate && maxDate < this.minDate) {
      throw new Error('max date must be after min date');
    }
    this.maxDate = maxDate;
    return this;
  }
  
  /**
   * Validates a date value
   * @param {any} value - Value to validate (Date object or date string)
   * @returns {{isValid: boolean, value?: Date, error?: string}} Validation result
   */
  validateValue(value) {
    let date;
    
    // Handle Date objects
    if (value instanceof Date) {
      if (!ValidationUtils.isDate(value)) {
        return { 
          isValid: false, 
          error: this.customMessage || 'Invalid date' 
        };
      }
      date = value;
    } 
    // Handle date strings
    else if (ValidationUtils.isString(value)) {
      // Prevent unsafe date parsing
      if (value.length === 0 || value.length > 100) {
        return { 
          isValid: false, 
          error: this.customMessage || 'Date string length must be between 1 and 100 characters' 
        };
      }
      
      try {
        date = new Date(value);
        if (!ValidationUtils.isDate(date)) {
          return { 
            isValid: false, 
            error: this.customMessage || 'Invalid date string' 
          };
        }
      } catch (error) {
        return { 
          isValid: false, 
          error: this.customMessage || 'Invalid date string' 
        };
      }
    } 
    // Reject other types
    else {
      return { 
        isValid: false, 
        error: this.customMessage || 'Value must be a Date object or valid date string' 
      };
    }
    
    // Range validation
    if (this.minDate && date < this.minDate) {
      return { 
        isValid: false, 
        error: this.customMessage || `Date must be after ${this.minDate.toISOString()}` 
      };
    }
    
    if (this.maxDate && date > this.maxDate) {
      return { 
        isValid: false, 
        error: this.customMessage || `Date must be before ${this.maxDate.toISOString()}` 
      };
    }
    
    return { isValid: true, value: date };
  }
}

/**
 * Object Validator - validates objects against a schema of field validators
 * @extends Validator
 */
class ObjectValidator extends Validator {
  /**
   * Creates a new ObjectValidator instance
   * @param {Object} schema - Schema object mapping field names to validators
   * @throws {Error} If schema is invalid
   */
  constructor(schema) {
    super();
    
    // Validate schema
    if (!ValidationUtils.isPlainObject(schema)) {
      throw new Error('Schema must be a plain object');
    }
    
    if (Object.keys(schema).length === 0) {
      throw new Error('Schema cannot be empty');
    }
    
    // Validate all schema values are validators
    for (const [fieldName, validator] of Object.entries(schema)) {
      if (typeof fieldName !== 'string' || fieldName.length === 0) {
        throw new Error('Schema field names must be non-empty strings');
      }
      
      // Protect against prototype pollution - check this first
      if (fieldName === '__proto__' || fieldName === 'constructor' || fieldName === 'prototype') {
        throw new Error(`Schema field name '${fieldName}' is not allowed`);
      }
      
      if (!(validator instanceof Validator)) {
        throw new Error(`Schema field '${fieldName}' must be a Validator instance`);
      }
    }
    
    /** @type {Object} Schema mapping field names to validators */
    this.schema = Object.freeze({ ...schema }); // Create immutable copy
  }
  
  /**
   * Validates an object value against the schema
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: Object, error?: string, fieldErrors?: Object}} Validation result
   */
  validateValue(value) {
    // Type check
    if (!ValidationUtils.isPlainObject(value)) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Value must be an object' 
      };
    }
    
    const validatedObject = {};
    const errors = {};
    let hasErrors = false;
    
    // Validate each field in the schema
    for (const [fieldName, validator] of Object.entries(this.schema)) {
      const fieldValue = value[fieldName];
      
      try {
        const result = validator.validate(fieldValue);
        
        if (result.isValid) {
          // Use safe cloning to prevent mutation
          validatedObject[fieldName] = ValidationUtils.safeClone(result.value);
        } else {
          errors[fieldName] = result.error;
          hasErrors = true;
        }
      } catch (error) {
        // Handle unexpected validator errors
        errors[fieldName] = 'Validation error occurred';
        hasErrors = true;
      }
    }
    
    // Return errors if any
    if (hasErrors) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Object validation failed',
        fieldErrors: errors
      };
    }
    
    return { isValid: true, value: validatedObject };
  }
}

/**
 * Array Validator - validates arrays with item validation and length constraints
 * @extends Validator
 */
class ArrayValidator extends Validator {
  /**
   * Creates a new ArrayValidator instance
   * @param {Validator} itemValidator - Validator for array items
   * @throws {Error} If itemValidator is invalid
   */
  constructor(itemValidator) {
    super();
    
    // Validate item validator
    if (!(itemValidator instanceof Validator)) {
      throw new Error('itemValidator must be a Validator instance');
    }
    
    /** @type {Validator} Validator for array items */
    this.itemValidator = itemValidator;
    /** @type {number|null} Minimum array length */
    this.minLen = null;
    /** @type {number|null} Maximum array length */
    this.maxLen = null;
  }
  
  /**
   * Sets minimum length constraint
   * @param {number} min - Minimum length (must be >= 0)
   * @returns {ArrayValidator} This validator instance for chaining
   * @throws {Error} If min is not a valid number or validator is frozen
   */
  minLength(min) {
    this._ensureNotFrozen();
    if (!ValidationUtils.isNumber(min) || min < 0 || !Number.isInteger(min)) {
      throw new Error('minLength must be a non-negative integer');
    }
    this.minLen = min;
    return this;
  }
  
  /**
   * Sets maximum length constraint
   * @param {number} max - Maximum length (must be >= 0)
   * @returns {ArrayValidator} This validator instance for chaining
   * @throws {Error} If max is not a valid number or validator is frozen
   */
  maxLength(max) {
    this._ensureNotFrozen();
    if (!ValidationUtils.isNumber(max) || max < 0 || !Number.isInteger(max)) {
      throw new Error('maxLength must be a non-negative integer');
    }
    if (this.minLen !== null && max < this.minLen) {
      throw new Error('maxLength must be greater than or equal to minLength');
    }
    this.maxLen = max;
    return this;
  }
  
  /**
   * Validates an array value
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: Array, error?: string, itemErrors?: Object}} Validation result
   */
  validateValue(value) {
    // Type check
    if (!ValidationUtils.isValidArray(value)) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Value must be an array' 
      };
    }
    
    // Length constraints (early return for performance)
    if (this.minLen !== null && value.length < this.minLen) {
      return { 
        isValid: false, 
        error: this.customMessage || `Array must have at least ${this.minLen} items` 
      };
    }
    
    if (this.maxLen !== null && value.length > this.maxLen) {
      return { 
        isValid: false, 
        error: this.customMessage || `Array must have no more than ${this.maxLen} items` 
      };
    }
    
    // Validate each item in the array
    const validatedArray = [];
    const itemErrors = {};
    let hasErrors = false;
    
    for (let i = 0; i < value.length; i++) {
      try {
        const result = this.itemValidator.validate(value[i]);
        
        if (result.isValid) {
          // Use safe cloning to prevent mutation
          validatedArray.push(ValidationUtils.safeClone(result.value));
        } else {
          itemErrors[i.toString()] = result.error;
          hasErrors = true;
        }
      } catch (error) {
        // Handle unexpected validator errors
        itemErrors[i.toString()] = 'Validation error occurred';
        hasErrors = true;
      }
    }
    
    // Return errors if any
    if (hasErrors) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Array item validation failed',
        itemErrors: itemErrors
      };
    }
    
    return { isValid: true, value: validatedArray };
  }
}

/**
 * Enum Validator - validates against a set of allowed values
 * @extends Validator
 */
class EnumValidator extends Validator {
  /**
   * Creates a new EnumValidator instance
   * @param {Array} allowedValues - Array of allowed values
   * @throws {Error} If allowedValues is invalid
   */
  constructor(allowedValues) {
    super();
    
    if (!ValidationUtils.isValidArray(allowedValues) || allowedValues.length === 0) {
      throw new Error('allowedValues must be a non-empty array');
    }
    
    /** @type {Array} Allowed values */
    this.allowedValues = [...allowedValues]; // Create copy
  }
  
  /**
   * Validates a value against the enum
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: any, error?: string}} Validation result
   */
  validateValue(value) {
    for (const allowedValue of this.allowedValues) {
      if (value === allowedValue) {
        return { isValid: true, value: value };
      }
    }
    
    return { 
      isValid: false, 
      error: this.customMessage || `Value must be one of: ${this.allowedValues.join(', ')}` 
    };
  }
}

/**
 * Union Validator - validates against multiple possible validators
 * @extends Validator
 */
class UnionValidator extends Validator {
  /**
   * Creates a new UnionValidator instance
   * @param {Array<Validator>} validators - Array of possible validators
   * @throws {Error} If validators array is invalid
   */
  constructor(validators) {
    super();
    
    if (!ValidationUtils.isValidArray(validators) || validators.length === 0) {
      throw new Error('validators must be a non-empty array');
    }
    
    // Validate all items are validators
    for (let i = 0; i < validators.length; i++) {
      if (!(validators[i] instanceof Validator)) {
        throw new Error(`Item at index ${i} must be a Validator instance`);
      }
    }
    
    /** @type {Array<Validator>} Possible validators */
    this.validators = validators;
  }
  
  /**
   * Validates a value against any of the union validators
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: any, error?: string}} Validation result
   */
  validateValue(value) {
    const errors = [];
    
    for (const validator of this.validators) {
      try {
        const result = validator.validate(value);
        if (result.isValid) {
          return { isValid: true, value: result.value };
        }
        errors.push(result.error);
      } catch (error) {
        errors.push('Validation error occurred');
      }
    }
    
    return { 
      isValid: false, 
      error: this.customMessage || `Value failed all union validations: ${errors.join('; ')}` 
    };
  }
}

/**
 * Tuple Validator - validates fixed-length arrays with specific types per position
 * @extends Validator
 */
class TupleValidator extends Validator {
  /**
   * Creates a new TupleValidator instance
   * @param {Array<Validator>} itemValidators - Array of validators for each position
   * @throws {Error} If itemValidators is invalid
   */
  constructor(itemValidators) {
    super();
    
    if (!ValidationUtils.isValidArray(itemValidators) || itemValidators.length === 0) {
      throw new Error('itemValidators must be a non-empty array');
    }
    
    // Validate all items are validators
    for (let i = 0; i < itemValidators.length; i++) {
      if (!(itemValidators[i] instanceof Validator)) {
        throw new Error(`Item validator at index ${i} must be a Validator instance`);
      }
    }
    
    /** @type {Array<Validator>} Validators for each tuple position */
    this.itemValidators = itemValidators;
  }
  
  /**
   * Validates a tuple value
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: Array, error?: string, itemErrors?: Object}} Validation result
   */
  validateValue(value) {
    if (!ValidationUtils.isValidArray(value)) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Value must be an array' 
      };
    }
    
    if (value.length !== this.itemValidators.length) {
      return { 
        isValid: false, 
        error: this.customMessage || `Tuple must have exactly ${this.itemValidators.length} items, got ${value.length}` 
      };
    }
    
    const validatedTuple = [];
    const itemErrors = {};
    let hasErrors = false;
    
    for (let i = 0; i < value.length; i++) {
      try {
        const result = this.itemValidators[i].validate(value[i]);
        
        if (result.isValid) {
          validatedTuple.push(ValidationUtils.safeClone(result.value));
        } else {
          itemErrors[i.toString()] = result.error;
          hasErrors = true;
        }
      } catch (error) {
        itemErrors[i.toString()] = 'Validation error occurred';
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Tuple item validation failed',
        itemErrors: itemErrors
      };
    }
    
    return { isValid: true, value: validatedTuple };
  }
}

/**
 * Null Validator - explicitly validates null values
 * @extends Validator
 */
class NullValidator extends Validator {
  /**
   * Creates a new NullValidator instance
   */
  constructor() {
    super();
  }
  
  /**
   * Validates a null value
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: null, error?: string}} Validation result
   */
  validateValue(value) {
    if (value !== null) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Value must be null' 
      };
    }
    
    return { isValid: true, value: null };
  }
}

/**
 * Undefined Validator - explicitly validates undefined values
 * @extends Validator
 */
class UndefinedValidator extends Validator {
  /**
   * Creates a new UndefinedValidator instance
   */
  constructor() {
    super();
  }
  
  /**
   * Validates an undefined value
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: undefined, error?: string}} Validation result
   */
  validateValue(value) {
    if (value !== undefined) {
      return { 
        isValid: false, 
        error: this.customMessage || 'Value must be undefined' 
      };
    }
    
    return { isValid: true, value: undefined };
  }
}

/**
 * Any Validator - accepts any value (permissive validation)
 * @extends Validator
 */
class AnyValidator extends Validator {
  /**
   * Creates a new AnyValidator instance
   */
  constructor() {
    super();
  }
  
  /**
   * Validates any value (always passes)
   * @param {any} value - Value to validate
   * @returns {{isValid: boolean, value?: any}} Validation result
   */
  validateValue(value) {
    return { isValid: true, value: ValidationUtils.safeClone(value) };
  }
}

/**
 * Schema Factory - creates validator instances with a fluent API
 * @final
 */
class Schema {
  /**
   * Creates a string validator
   * @returns {StringValidator} A new string validator instance
   * @example
   * const validator = Schema.string().minLength(2).maxLength(50);
   */
  static string() {
    return new StringValidator();
  }
  
  /**
   * Creates a number validator
   * @returns {NumberValidator} A new number validator instance
   * @example
   * const validator = Schema.number().min(0).max(100).integer();
   */
  static number() {
    return new NumberValidator();
  }
  
  /**
   * Creates a boolean validator
   * @returns {BooleanValidator} A new boolean validator instance
   * @example
   * const validator = Schema.boolean().optional();
   */
  static boolean() {
    return new BooleanValidator();
  }
  
  /**
   * Creates a date validator
   * @returns {DateValidator} A new date validator instance
   * @example
   * const validator = Schema.date().min(new Date('2020-01-01'));
   */
  static date() {
    return new DateValidator();
  }
  
  /**
   * Creates an object validator with a schema
   * @param {Object} schema - Schema object mapping field names to validators
   * @returns {ObjectValidator} A new object validator instance
   * @throws {Error} If schema is invalid
   * @example
   * const validator = Schema.object({
   *   name: Schema.string(),
   *   age: Schema.number().min(0)
   * });
   */
  static object(schema) {
    return new ObjectValidator(schema);
  }
  
  /**
   * Creates an array validator with item validation
   * @param {Validator} itemValidator - Validator for array items
   * @returns {ArrayValidator} A new array validator instance
   * @throws {Error} If itemValidator is invalid
   * @example
   * const validator = Schema.array(Schema.string()).minLength(1);
   */
  static array(itemValidator) {
    return new ArrayValidator(itemValidator);
  }
  
  /**
   * Creates an enum validator for literal values
   * @param {Array} allowedValues - Array of allowed values
   * @returns {EnumValidator} A new enum validator instance
   * @throws {Error} If allowedValues is invalid
   * @example
   * const validator = Schema.enum(['red', 'green', 'blue']);
   */
  static enum(allowedValues) {
    return new EnumValidator(allowedValues);
  }
  
  /**
   * Creates a union validator for multiple possible types
   * @param {Array<Validator>} validators - Array of possible validators
   * @returns {UnionValidator} A new union validator instance
   * @throws {Error} If validators array is invalid
   * @example
   * const validator = Schema.union([Schema.string(), Schema.number()]);
   */
  static union(validators) {
    return new UnionValidator(validators);
  }
  
  /**
   * Creates a tuple validator for fixed-length heterogeneous arrays
   * @param {Array<Validator>} itemValidators - Array of validators for each position
   * @returns {TupleValidator} A new tuple validator instance
   * @throws {Error} If itemValidators is invalid
   * @example
   * const validator = Schema.tuple([Schema.string(), Schema.number(), Schema.boolean()]);
   */
  static tuple(itemValidators) {
    return new TupleValidator(itemValidators);
  }
  
  /**
   * Creates a null validator
   * @returns {NullValidator} A new null validator instance
   * @example
   * const validator = Schema.null();
   */
  static null() {
    return new NullValidator();
  }
  
  /**
   * Creates an undefined validator
   * @returns {UndefinedValidator} A new undefined validator instance
   * @example
   * const validator = Schema.undefined();
   */
  static undefined() {
    return new UndefinedValidator();
  }
  
  /**
   * Creates an any validator (accepts any value)
   * @returns {AnyValidator} A new any validator instance
   * @example
   * const validator = Schema.any();
   */
  static any() {
    return new AnyValidator();
  }
  
  /**
   * Prevents instantiation of Schema class
   * @throws {Error} Always throws as Schema should not be instantiated
   */
  constructor() {
    throw new Error('Schema class should not be instantiated. Use static methods instead.');
  }
}

// Freeze Schema class to prevent modification
Object.freeze(Schema);
Object.freeze(Schema.prototype);

/**
 * @fileoverview Schema Validator Library - A robust validation library for JavaScript
 * @version 1.0.0
 * @author AI Assistant
 * 
 * This library provides a comprehensive validation system with:
 * - Type-safe validation for primitive types (string, number, boolean, date)
 * - Complex type validation (objects, arrays) with nested schemas
 * - Fluent API with method chaining
 * - Immutable validation (no input mutation)
 * - Security features (prototype pollution protection)
 * - Comprehensive error reporting
 * - Performance optimizations
 * 
 * @example
 * const { Schema } = require('./schema.js');
 * 
 * // Simple validation
 * const emailValidator = Schema.string()
 *   .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
 *   .withMessage('Invalid email format');
 * 
 * // Complex nested validation
 * const userValidator = Schema.object({
 *   name: Schema.string().minLength(2),
 *   age: Schema.number().min(0).integer(),
 *   addresses: Schema.array(Schema.object({
 *     street: Schema.string(),
 *     city: Schema.string()
 *   })).optional()
 * });
 */

/**
 * Exported classes and utilities
 * @namespace
 */
module.exports = {
  /** @type {typeof Schema} Main schema factory class */
  Schema,
  /** @type {typeof Validator} Base validator class */
  Validator,
  /** @type {typeof StringValidator} String validator class */
  StringValidator,
  /** @type {typeof NumberValidator} Number validator class */
  NumberValidator,
  /** @type {typeof BooleanValidator} Boolean validator class */
  BooleanValidator,
  /** @type {typeof DateValidator} Date validator class */
  DateValidator,
  /** @type {typeof ObjectValidator} Object validator class */
  ObjectValidator,
  /** @type {typeof ArrayValidator} Array validator class */
  ArrayValidator,
  /** @type {typeof ValidationUtils} Utility functions (internal use) */
  ValidationUtils
};
