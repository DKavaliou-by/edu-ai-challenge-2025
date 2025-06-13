# Schema Validator

A robust, lightweight JavaScript validation library for validating complex data structures with a fluent API.

## Features

- 🎯 **Type-safe validation** for primitive types (string, number, boolean, date)
- 🏗️ **Complex type validation** for objects and arrays with nested schemas
- 🔗 **Fluent API** with method chaining for readable validation rules
- 📝 **Custom error messages** with built-in descriptive defaults
- ⚡ **Optional field support** with easy-to-use `.optional()` method
- 🎛️ **Extensive validation options** (min/max, patterns, length constraints)
- 📊 **Consistent result format** for easy error handling
- 🛡️ **Security features** - prototype pollution protection, input sanitization
- 🔒 **Immutable validation** - prevents mutation of input data
- ⚡ **Performance optimized** - early returns, efficient type checking
- 🚀 **Zero dependencies** and lightweight
- 📚 **Comprehensive JSDoc** documentation for IDE support
- 🔄 **Extensible architecture** for custom validators

## Installation

```bash
# Copy schema.js to your project
# No external dependencies required
```

```javascript
const { Schema } = require('./schema.js');
// or
import { Schema } from './schema.js';
```

## Testing

### Running Tests

Run the comprehensive test suite to verify functionality:

```bash
# Run all tests
node test.js

# Run tests with verbose output (shows individual test results)
node test.js | grep -E "(✅|❌|📋)"

# Run only specific test categories (examples)
node test.js | grep -A 20 "StringValidator Tests"
node test.js | grep -A 20 "Security Tests"
```

### Test Coverage Report

The library includes a comprehensive test coverage report (`test_report.txt`) that documents all tested features and coverage metrics.

#### Viewing the Coverage Report

```bash
# View the detailed test coverage report
cat test_report.txt

# View just the summary
head -30 test_report.txt

# Check coverage for specific features
grep -A 10 "StringValidator Coverage" test_report.txt
grep -A 10 "Security Features" test_report.txt

# View coverage metrics
grep -A 20 "COVERAGE SUMMARY" test_report.txt
```

#### Generating/Updating the Coverage Report

Update the coverage report with current test results:

```bash
# Generate updated coverage report
node generate_coverage.js

# Make the script executable (Unix/Mac)
chmod +x generate_coverage.js
./generate_coverage.js
```

The coverage generator will:
- ✅ Run the complete test suite
- ✅ Parse test results and metrics  
- ✅ Update timestamps and statistics
- ✅ Validate 100% test coverage
- ✅ Generate detailed coverage breakdown

### Test Suite Overview

The test suite includes **71+ comprehensive tests** covering:

**Core Functionality:**
- All validator types and methods (String, Number, Boolean, Date, Object, Array)
- Method chaining and fluent API
- Optional field behavior
- Custom error messages

**Security & Best Practices:**
- JavaScript best practices and security features
- Input validation and parameter sanitization
- Prototype pollution protection
- Immutable validation patterns

**Advanced Scenarios:**
- Complex nested validation scenarios
- Edge cases and error scenarios
- Real-world integration examples
- Performance and memory safety

**Coverage Metrics:**
- ✅ **100% feature coverage** - All implemented features tested
- ✅ **100% method coverage** - All public methods tested
- ✅ **100% error path coverage** - All error scenarios tested
- ✅ **100% security coverage** - All security features tested

### Test Results Format

The test runner provides clear, color-coded output:

```
📋 Test Category Name
  ✅ should pass this test
  ❌ should fail this test (if any)
     Error: Detailed error information

📊 Test Summary:
  Total: 71
  ✅ Passed: 71
  ❌ Failed: 0
  📈 Success Rate: 100.0%
```

### Test Files Structure

The testing system consists of several components:

```
test.js              # Main test suite (71+ tests)
test_report.txt      # Detailed coverage report
generate_coverage.js # Coverage report generator
README.md           # Testing documentation (this section)
```

### Continuous Integration

For CI/CD pipelines, the test command returns appropriate exit codes:

```bash
# Run tests and capture exit code
node test.js
echo $?  # 0 = success, 1 = failure

# Use in CI scripts
if node test.js; then
  echo "✅ All tests passed"
else
  echo "❌ Tests failed"
  exit 1
fi

# Generate coverage report in CI
node generate_coverage.js
```

### Testing Best Practices

When contributing to the library:

1. **Run tests before commits**: `node test.js`
2. **Add tests for new features**: Follow existing test patterns
3. **Update coverage report**: `node generate_coverage.js`
4. **Maintain 100% coverage**: All new code must be tested
5. **Test edge cases**: Include boundary conditions and error scenarios

```bash
# Complete testing workflow
node test.js                 # Run tests
node generate_coverage.js    # Update coverage
cat test_report.txt | head -30  # Review coverage
```

## Quick Start

```javascript
const { Schema } = require('./schema.js');

// Create a simple validator
const emailValidator = Schema.string()
  .minLength(5)
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Please provide a valid email address');

// Validate data
const result = emailValidator.validate('user@example.com');
console.log(result); // { isValid: true, value: 'user@example.com' }

const invalidResult = emailValidator.validate('invalid-email');
console.log(invalidResult); // { isValid: false, error: 'Please provide a valid email address' }
```

## Validation Types

### String Validation

```javascript
const stringValidator = Schema.string()
  .minLength(2)              // Minimum length
  .maxLength(50)             // Maximum length  
  .pattern(/^[A-Za-z]+$/)    // Regex pattern
  .withMessage('Custom error message');

// Examples
stringValidator.validate('John');        // ✅ { isValid: true, value: 'John' }
stringValidator.validate('J');           // ❌ { isValid: false, error: 'String must be at least 2 characters long' }
stringValidator.validate('John123');     // ❌ { isValid: false, error: 'Custom error message' }
```

### Number Validation

```javascript
const numberValidator = Schema.number()
  .min(0)                    // Minimum value
  .max(100)                  // Maximum value
  .integer()                 // Must be integer
  .withMessage('Must be a whole number between 0-100');

// Examples
numberValidator.validate(42);            // ✅ { isValid: true, value: 42 }
numberValidator.validate(-5);            // ❌ { isValid: false, error: 'Must be a whole number between 0-100' }
numberValidator.validate(3.14);          // ❌ { isValid: false, error: 'Must be a whole number between 0-100' }
numberValidator.validate('42');          // ❌ { isValid: false, error: 'Must be a whole number between 0-100' }
```

### Boolean Validation

```javascript
const booleanValidator = Schema.boolean();

// Examples
booleanValidator.validate(true);         // ✅ { isValid: true, value: true }
booleanValidator.validate(false);        // ✅ { isValid: true, value: false }
booleanValidator.validate('true');       // ❌ { isValid: false, error: 'Value must be a boolean' }
booleanValidator.validate(1);            // ❌ { isValid: false, error: 'Value must be a boolean' }
```

### Date Validation

```javascript
const dateValidator = Schema.date()
  .min(new Date('2020-01-01'))           // Minimum date
  .max(new Date('2030-12-31'))           // Maximum date
  .withMessage('Date must be between 2020-2030');

// Examples
dateValidator.validate(new Date());                    // ✅ { isValid: true, value: Date object }
dateValidator.validate('2025-06-15');                  // ✅ { isValid: true, value: Date object }
dateValidator.validate('2019-01-01');                  // ❌ { isValid: false, error: 'Date must be between 2020-2030' }
dateValidator.validate('invalid-date');                // ❌ { isValid: false, error: 'Date must be between 2020-2030' }
```

### Object Validation

```javascript
const userSchema = Schema.object({
  name: Schema.string().minLength(2),
  age: Schema.number().min(0).integer(),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  isActive: Schema.boolean(),
  metadata: Schema.object({
    createdAt: Schema.date(),
    tags: Schema.array(Schema.string())
  }).optional()
});

// Examples
const validUser = {
  name: 'John Doe',
  age: 25,
  email: 'john@example.com',
  isActive: true,
  metadata: {
    createdAt: new Date(),
    tags: ['developer', 'javascript']
  }
};

userSchema.validate(validUser);                     // ✅ { isValid: true, value: {...} }

const invalidUser = {
  name: 'J',                                        // Too short
  age: -5,                                          // Negative
  email: 'invalid-email',                           // Bad format
  isActive: 'yes'                                   // Wrong type
};

userSchema.validate(invalidUser);                   // ❌ { isValid: false, error: 'Object validation failed', fieldErrors: {...} }
```

### Array Validation

```javascript
const numbersValidator = Schema.array(Schema.number().min(0))
  .minLength(1)                                     // At least 1 item
  .maxLength(10);                                   // At most 10 items

const usersValidator = Schema.array(Schema.object({
  name: Schema.string(),
  age: Schema.number().min(0)
}));

// Examples
numbersValidator.validate([1, 2, 3, 4, 5]);        // ✅ { isValid: true, value: [1, 2, 3, 4, 5] }
numbersValidator.validate([]);                      // ❌ { isValid: false, error: 'Array must have at least 1 items' }
numbersValidator.validate([1, -2, 3]);              // ❌ { isValid: false, error: 'Array item validation failed', itemErrors: {...} }

usersValidator.validate([
  { name: 'John', age: 25 },
  { name: 'Jane', age: 30 }
]);                                                 // ✅ { isValid: true, value: [...] }
```

### Nested Validation

```javascript
// Complex nested structure
const blogPostSchema = Schema.object({
  title: Schema.string().minLength(1),
  content: Schema.string(),
  author: Schema.object({
    name: Schema.string(),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  }),
  tags: Schema.array(Schema.string().minLength(1)),
  comments: Schema.array(Schema.object({
    id: Schema.string(),
    text: Schema.string().minLength(1),
    author: Schema.string(),
    createdAt: Schema.date()
  })).optional(),
  metadata: Schema.object({
    views: Schema.number().min(0),
    featured: Schema.boolean(),
    categories: Schema.array(Schema.string())
  }).optional()
});

const blogPost = {
  title: 'My First Post',
  content: 'This is the content of my blog post...',
  author: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  tags: ['javascript', 'tutorial'],
  comments: [
    {
      id: 'comment-1',
      text: 'Great post!',
      author: 'Reader',
      createdAt: new Date()
    }
  ],
  metadata: {
    views: 42,
    featured: false,
    categories: ['tech', 'programming']
  }
};

blogPostSchema.validate(blogPost);                  // ✅ Validates entire nested structure
```

## JavaScript Best Practices & Security

The validation library follows JavaScript best practices and includes security features:

### Security Features

```javascript
// Prototype pollution protection
try {
  Schema.object({ 'constructor': Schema.string() });
} catch (error) {
  console.log(error.message); // "Schema field name 'constructor' is not allowed"
}

// Input sanitization for custom messages
try {
  Schema.string().withMessage('x'.repeat(1001));
} catch (error) {
  console.log(error.message); // "Message must be a non-empty string with max length 1000"
}

// Safe parameter validation
try {
  Schema.string().minLength(-1);
} catch (error) {
  console.log(error.message); // "minLength must be a non-negative integer"
}
```

### Immutable Validation

```javascript
const originalData = {
  name: 'John',
  details: { age: 30 }
};

const validator = Schema.object({
  name: Schema.string(),
  details: Schema.object({
    age: Schema.number()
  })
});

const result = validator.validate(originalData);

// Original data is never modified
console.log(originalData === result.value); // false
console.log(originalData.details === result.value.details); // false
```

### Performance Optimizations

```javascript
// Early returns for better performance
const validator = Schema.string().minLength(5).maxLength(100).pattern(/^[A-Z]/);

// Validation stops at first failure:
validator.validate('hi');     // Returns immediately with minLength error
validator.validate('hello');  // Continues to pattern check only if length is valid
```

### Type Safety

```javascript
// Strict type checking excludes edge cases
const numberValidator = Schema.number();

numberValidator.validate(42);         // ✅ Valid number
numberValidator.validate(3.14);       // ✅ Valid number  
numberValidator.validate(NaN);        // ❌ Rejected for safety
numberValidator.validate(Infinity);   // ❌ Rejected for safety
numberValidator.validate('42');       // ❌ String not accepted
```

### Validator Freezing

```javascript
// Prevent accidental modification after setup
const validator = Schema.string().minLength(5).freeze();

try {
  validator.minLength(10); // Throws error
} catch (error) {
  console.log(error.message); // "Cannot modify frozen validator"
}
```

## Advanced Features

### Optional Fields

```javascript
const optionalValidator = Schema.string()
  .minLength(3)
  .optional();

// Examples
optionalValidator.validate(undefined);   // ✅ { isValid: true, value: undefined }
optionalValidator.validate(null);        // ✅ { isValid: true, value: null }
optionalValidator.validate('hello');     // ✅ { isValid: true, value: 'hello' }
optionalValidator.validate('hi');        // ❌ { isValid: false, error: 'String must be at least 3 characters long' }
```

### Method Chaining

```javascript
const chainedValidator = Schema.string()
  .minLength(8)
  .maxLength(20)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must be 8-20 chars with uppercase, lowercase, and number')
  .optional();

const result = chainedValidator.validate('MyPass123');
```

### Custom Error Messages

```javascript
// Global custom message
const validator1 = Schema.string()
  .minLength(5)
  .withMessage('This field is required and must be at least 5 characters');

// Specific validation messages (default behavior)
const validator2 = Schema.number()
  .min(18)
  .max(65);
// Will show: "Number must be at least 18" or "Number must be no more than 65"
```

## Real-World Examples

### User Registration Form

```javascript
const { Schema } = require('./schema.js');

// Define validators
const usernameValidator = Schema.string()
  .minLength(3)
  .maxLength(20)
  .pattern(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores');

const emailValidator = Schema.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Please provide a valid email address');

const passwordValidator = Schema.string()
  .minLength(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number');

const ageValidator = Schema.number()
  .min(13)
  .max(120)
  .integer()
  .withMessage('Age must be between 13 and 120');

// Validate form data
function validateUser(userData) {
  const results = {
    username: usernameValidator.validate(userData.username),
    email: emailValidator.validate(userData.email),
    password: passwordValidator.validate(userData.password),
    age: ageValidator.validate(userData.age)
  };
  
  const errors = {};
  let isValid = true;
  
  for (const [field, result] of Object.entries(results)) {
    if (!result.isValid) {
      errors[field] = result.error;
      isValid = false;
    }
  }
  
  return { isValid, errors, validatedData: isValid ? userData : null };
}

// Usage
const formData = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'MySecure123',
  age: 25
};

const validation = validateUser(formData);
console.log(validation);
```

### API Input Validation

```javascript
const { Schema } = require('./schema.js');

// Product validation using ObjectValidator
const productValidator = Schema.object({
  name: Schema.string().minLength(1).maxLength(100),
  price: Schema.number().min(0.01),
  category: Schema.string().minLength(1),
  inStock: Schema.boolean(),
  description: Schema.string().maxLength(500).optional(),
  releaseDate: Schema.date().min(new Date('2000-01-01')).optional(),
  tags: Schema.array(Schema.string().minLength(1)).optional(),
  variants: Schema.array(Schema.object({
    sku: Schema.string(),
    price: Schema.number().min(0),
    attributes: Schema.object({
      color: Schema.string().optional(),
      size: Schema.string().optional(),
      material: Schema.string().optional()
    }).optional()
  })).optional()
});

// Express.js middleware example with ObjectValidator
function validateProductMiddleware(req, res, next) {
  const result = productValidator.validate(req.body);
  
  if (!result.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      message: result.error,
      fieldErrors: result.fieldErrors || null,
      itemErrors: result.itemErrors || null
    });
  }
  
  req.validatedData = result.value;
  next();
}

// Usage example
const productData = {
  name: 'Wireless Headphones',
  price: 99.99,
  category: 'Electronics',
  inStock: true,
  description: 'High-quality wireless headphones with noise cancellation.',
  tags: ['audio', 'wireless', 'electronics'],
  variants: [
    {
      sku: 'WH-001-BLACK',
      price: 99.99,
      attributes: {
        color: 'black',
        material: 'plastic'
      }
    },
    {
      sku: 'WH-001-WHITE',
      price: 109.99,
      attributes: {
        color: 'white',
        material: 'plastic'
      }
    }
  ]
};

const validation = productValidator.validate(productData);
console.log(validation); // { isValid: true, value: {...} }
```

### E-commerce Order Validation

```javascript
const { Schema } = require('./schema.js');

// Complex nested validation for order processing
const orderValidator = Schema.object({
  orderId: Schema.string().pattern(/^ORD-\d{6}$/),
  customer: Schema.object({
    id: Schema.string(),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    name: Schema.string().minLength(1),
    phone: Schema.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional()
  }),
  items: Schema.array(Schema.object({
    productId: Schema.string(),
    quantity: Schema.number().min(1).integer(),
    price: Schema.number().min(0),
    name: Schema.string(),
    options: Schema.object({
      size: Schema.string().optional(),
      color: Schema.string().optional(),
      customization: Schema.string().maxLength(200).optional()
    }).optional()
  })).minLength(1),
  shipping: Schema.object({
    address: Schema.object({
      street: Schema.string(),
      city: Schema.string(),
      state: Schema.string(),
      zipCode: Schema.string(),
      country: Schema.string()
    }),
    method: Schema.string().pattern(/^(standard|express|overnight)$/),
    cost: Schema.number().min(0)
  }),
  payment: Schema.object({
    method: Schema.string().pattern(/^(credit|debit|paypal|stripe)$/),
    amount: Schema.number().min(0),
    currency: Schema.string().pattern(/^[A-Z]{3}$/),
    status: Schema.string().pattern(/^(pending|completed|failed)$/)
  }),
  metadata: Schema.object({
    source: Schema.string(),
    campaign: Schema.string().optional(),
    notes: Schema.string().maxLength(1000).optional()
  }).optional()
});

function processOrder(orderData) {
  const validation = orderValidator.validate(orderData);
  
  if (!validation.isValid) {
    return {
      success: false,
      error: 'Order validation failed',
      details: {
        message: validation.error,
        fieldErrors: validation.fieldErrors,
        itemErrors: validation.itemErrors
      }
    };
  }
  
  // Process the validated order
  const validatedOrder = validation.value;
  
  // Calculate totals, save to database, etc.
  const itemTotal = validatedOrder.items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  
  const orderTotal = itemTotal + validatedOrder.shipping.cost;
  
  return {
    success: true,
    orderId: validatedOrder.orderId,
    total: orderTotal,
    estimatedDelivery: calculateDelivery(validatedOrder.shipping.method)
  };
}
```

## API Reference

### Schema Factory Methods

- `Schema.string()` → `StringValidator`
- `Schema.number()` → `NumberValidator`  
- `Schema.boolean()` → `BooleanValidator`
- `Schema.date()` → `DateValidator`
- `Schema.object(schema)` → `ObjectValidator`
- `Schema.array(itemValidator)` → `ArrayValidator`

### StringValidator Methods

- `.minLength(min)` - Minimum string length (non-negative integer)
- `.maxLength(max)` - Maximum string length (non-negative integer)
- `.pattern(regex)` - Regular expression pattern (RegExp object)
- `.optional()` - Allow undefined/null values
- `.withMessage(message)` - Custom error message (1-1000 chars)
- `.freeze()` - Prevent further modifications
- `.validate(value)` - Perform validation

### NumberValidator Methods

- `.min(minimum)` - Minimum numeric value (finite number, no NaN/Infinity)
- `.max(maximum)` - Maximum numeric value (finite number, no NaN/Infinity)
- `.integer()` - Must be an integer (no decimals)
- `.optional()` - Allow undefined/null values
- `.withMessage(message)` - Custom error message (1-1000 chars)
- `.freeze()` - Prevent further modifications
- `.validate(value)` - Perform validation

### BooleanValidator Methods

- `.optional()` - Allow undefined/null values
- `.withMessage(message)` - Custom error message (1-1000 chars)
- `.freeze()` - Prevent further modifications
- `.validate(value)` - Perform validation

### DateValidator Methods

- `.min(minDate)` - Minimum date value (valid Date object)
- `.max(maxDate)` - Maximum date value (valid Date object)
- `.optional()` - Allow undefined/null values
- `.withMessage(message)` - Custom error message (1-1000 chars)
- `.freeze()` - Prevent further modifications
- `.validate(value)` - Perform validation

### ObjectValidator Methods

- `.optional()` - Allow undefined/null values
- `.withMessage(message)` - Custom error message (1-1000 chars)
- `.freeze()` - Prevent further modifications
- `.validate(value)` - Perform validation

**Schema Object Format:**
```javascript
Schema.object({
  fieldName: validator,                    // Required field
  anotherField: anotherValidator.optional(), // Optional field
  nestedObject: Schema.object({...}).optional() // Nested optional object
})
// Note: Field names 'constructor', 'prototype', '__proto__' are forbidden for security
```

### ArrayValidator Methods

- `.minLength(min)` - Minimum array length (non-negative integer)
- `.maxLength(max)` - Maximum array length (non-negative integer)
- `.optional()` - Allow undefined/null values
- `.withMessage(message)` - Custom error message (1-1000 chars)
- `.freeze()` - Prevent further modifications
- `.validate(value)` - Perform validation

**Item Validator:**
```javascript
Schema.array(itemValidator)  // Any validator instance can be used for items
```

### Validation Result Format

All validators return a consistent result object:

```javascript
// Success case
{
  isValid: true,
  value: /* the validated value */
}

// Error case - Primitive validators
{
  isValid: false,
  error: "Error message describing what went wrong"
}

// Error case - Object validator with field errors
{
  isValid: false,
  error: "Object validation failed",
  fieldErrors: {
    fieldName: "Field-specific error message",
    anotherField: "Another field error"
  }
}

// Error case - Array validator with item errors  
{
  isValid: false,
  error: "Array item validation failed",
  itemErrors: {
    "0": "Error for first item",
    "2": "Error for third item"
  }
}
```

## Common Patterns

### Email Validation
```javascript
const emailValidator = Schema.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Invalid email format');
```

### Password Validation
```javascript
const passwordValidator = Schema.string()
  .minLength(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .withMessage('Password must contain uppercase, lowercase, number, and special character');
```

### Phone Number Validation
```javascript
const phoneValidator = Schema.string()
  .pattern(/^\+?[\d\s\-\(\)]+$/)
  .minLength(10)
  .maxLength(20)
  .withMessage('Invalid phone number format');
```

### URL Validation
```javascript
const urlValidator = Schema.string()
  .pattern(/^https?:\/\/.+/)
  .withMessage('Must be a valid HTTP/HTTPS URL');
```

## Error Handling Best Practices

```javascript
function handleValidation(validator, value) {
  const result = validator.validate(value);
  
  if (!result.isValid) {
    console.error('Validation failed:', result.error);
    // Handle error appropriately
    return null;
  }
  
  return result.value;
}

// For multiple validations
function validateMultiple(validations) {
  const errors = {};
  const values = {};
  
  Object.entries(validations).forEach(([key, { validator, value }]) => {
    const result = validator.validate(value);
    
    if (result.isValid) {
      values[key] = result.value;
    } else {
      errors[key] = result.error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values
  };
}
```

## Contributing

Contributions are welcome! The library is designed to be extensible. To add new validator types:

1. Extend the `Validator` base class
2. Implement the `validateValue(value)` method
3. Add factory method to `Schema` class
4. Add tests and documentation

## License

MIT License - feel free to use in your projects!

## Roadmap

- ✅ Primitive type validation (string, number, boolean, date)
- ✅ Object validation with nested schemas
- ✅ Array validation with item validation
- ✅ Complex nested validation scenarios
- ✅ JavaScript best practices and security features
- ✅ Performance optimizations and immutable validation
- ✅ Comprehensive JSDoc documentation
- 🔄 Advanced string validators (email, URL, UUID)
- 🔄 Conditional validation
- 🔄 Async validation support
- 🔄 Schema composition and inheritance
- 🔄 Custom validator creation
- 🔄 Internationalization support 