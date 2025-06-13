const { Schema, Validator, StringValidator, NumberValidator, BooleanValidator, DateValidator, ObjectValidator, ArrayValidator, ValidationUtils } = require('./schema.js');

// Simple test framework
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.currentSuite = '';
  }

  describe(suiteName, testFn) {
    this.currentSuite = suiteName;
    console.log(`\n📋 ${suiteName}`);
    testFn();
  }

  test(testName, testFn) {
    try {
      testFn();
      console.log(`  ✅ ${testName}`);
      this.passed++;
    } catch (error) {
      console.log(`  ❌ ${testName}`);
      console.log(`     Error: ${error.message}`);
      this.failed++;
    }
  }

  assertEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message}\n    Expected: ${JSON.stringify(expected)}\n    Actual: ${JSON.stringify(actual)}`);
    }
  }

  assertTrue(condition, message = 'Expected true but got false') {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertFalse(condition, message = 'Expected false but got true') {
    if (condition) {
      throw new Error(message);
    }
  }

  summary() {
    console.log(`\n📊 Test Summary:`);
    console.log(`  Total: ${this.passed + this.failed}`);
    console.log(`  ✅ Passed: ${this.passed}`);
    console.log(`  ❌ Failed: ${this.failed}`);
    console.log(`  📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    if (this.failed === 0) {
      console.log(`\n🎉 All tests passed!`);
      console.log(`\n📋 View detailed coverage report: cat test_report.txt`);
      process.exit(0); // Exit with success code
    } else {
      console.log(`\n⚠️  Some tests failed. Please review the errors above.`);
      process.exit(1); // Exit with failure code for CI/CD
    }
  }
}

const runner = new TestRunner();

// Helper function to test validation results
function expectValid(result, expectedValue = undefined) {
  runner.assertTrue(result.isValid, `Expected validation to pass, but got error: ${result.error}`);
  if (expectedValue !== undefined) {
    runner.assertEqual(result.value, expectedValue, 'Validated value mismatch');
  }
}

function expectInvalid(result, expectedError = undefined) {
  runner.assertFalse(result.isValid, `Expected validation to fail, but it passed with value: ${result.value}`);
  runner.assertTrue(typeof result.error === 'string', 'Expected error message to be a string');
  if (expectedError) {
    runner.assertEqual(result.error, expectedError, 'Error message mismatch');
  }
}

// STRING VALIDATOR TESTS
runner.describe('StringValidator Tests', () => {
  
  runner.test('should create string validator', () => {
    const validator = Schema.string();
    runner.assertTrue(validator instanceof StringValidator);
  });

  runner.test('should validate basic string', () => {
    const validator = Schema.string();
    expectValid(validator.validate('hello'), 'hello');
    expectValid(validator.validate(''), '');
    expectInvalid(validator.validate(123));
    expectInvalid(validator.validate(null));
    expectInvalid(validator.validate(undefined));
  });

  runner.test('should validate minLength', () => {
    const validator = Schema.string().minLength(3);
    expectValid(validator.validate('hello'));
    expectValid(validator.validate('abc'));
    expectInvalid(validator.validate('ab'), 'String must be at least 3 characters long');
    expectInvalid(validator.validate(''));
  });

  runner.test('should validate maxLength', () => {
    const validator = Schema.string().maxLength(5);
    expectValid(validator.validate('hello'));
    expectValid(validator.validate('hi'));
    expectValid(validator.validate(''));
    expectInvalid(validator.validate('too long'), 'String must be no more than 5 characters long');
  });

  runner.test('should validate pattern', () => {
    const validator = Schema.string().pattern(/^[A-Z][a-z]+$/);
    expectValid(validator.validate('John'));
    expectValid(validator.validate('Alice'));
    expectInvalid(validator.validate('john'), 'String does not match required pattern');
    expectInvalid(validator.validate('JOHN'));
    expectInvalid(validator.validate('123'));
  });

  runner.test('should chain validation methods', () => {
    const validator = Schema.string().minLength(2).maxLength(10).pattern(/^[A-Za-z]+$/);
    expectValid(validator.validate('John'));
    expectInvalid(validator.validate('J')); // too short
    expectInvalid(validator.validate('VeryLongName')); // too long
    expectInvalid(validator.validate('John123')); // pattern fail
  });

  runner.test('should handle optional strings', () => {
    const validator = Schema.string().minLength(3).optional();
    expectValid(validator.validate(undefined), undefined);
    expectValid(validator.validate(null), null);
    expectValid(validator.validate('hello'));
    expectInvalid(validator.validate('hi')); // still fails minLength if provided
  });

  runner.test('should use custom error messages', () => {
    const validator = Schema.string().minLength(3).withMessage('Custom error');
    expectInvalid(validator.validate('hi'), 'Custom error');
    expectInvalid(validator.validate(123), 'Custom error');
  });
});

// NUMBER VALIDATOR TESTS
runner.describe('NumberValidator Tests', () => {
  
  runner.test('should create number validator', () => {
    const validator = Schema.number();
    runner.assertTrue(validator instanceof NumberValidator);
  });

  runner.test('should validate basic number', () => {
    const validator = Schema.number();
    expectValid(validator.validate(42), 42);
    expectValid(validator.validate(0), 0);
    expectValid(validator.validate(-5), -5);
    expectValid(validator.validate(3.14), 3.14);
    expectInvalid(validator.validate('42'));
    expectInvalid(validator.validate('abc'));
    expectInvalid(validator.validate(null));
    expectInvalid(validator.validate(undefined));
    expectInvalid(validator.validate(NaN));
  });

  runner.test('should validate min value', () => {
    const validator = Schema.number().min(10);
    expectValid(validator.validate(15));
    expectValid(validator.validate(10));
    expectInvalid(validator.validate(5), 'Number must be at least 10');
    expectInvalid(validator.validate(-1));
  });

  runner.test('should validate max value', () => {
    const validator = Schema.number().max(100);
    expectValid(validator.validate(50));
    expectValid(validator.validate(100));
    expectInvalid(validator.validate(150), 'Number must be no more than 100');
  });

  runner.test('should validate integer', () => {
    const validator = Schema.number().integer();
    expectValid(validator.validate(42));
    expectValid(validator.validate(0));
    expectValid(validator.validate(-5));
    expectInvalid(validator.validate(3.14), 'Value must be an integer');
    expectInvalid(validator.validate(1.1));
  });

  runner.test('should chain number validations', () => {
    const validator = Schema.number().min(0).max(100).integer();
    expectValid(validator.validate(50));
    expectValid(validator.validate(0));
    expectValid(validator.validate(100));
    expectInvalid(validator.validate(-1)); // below min
    expectInvalid(validator.validate(101)); // above max
    expectInvalid(validator.validate(50.5)); // not integer
  });

  runner.test('should handle optional numbers', () => {
    const validator = Schema.number().min(10).optional();
    expectValid(validator.validate(undefined), undefined);
    expectValid(validator.validate(null), null);
    expectValid(validator.validate(15));
    expectInvalid(validator.validate(5)); // still fails min if provided
  });

  runner.test('should use custom error messages', () => {
    const validator = Schema.number().min(0).withMessage('Must be positive');
    expectInvalid(validator.validate(-1), 'Must be positive');
    expectInvalid(validator.validate('abc'), 'Must be positive');
  });
});

// BOOLEAN VALIDATOR TESTS
runner.describe('BooleanValidator Tests', () => {
  
  runner.test('should create boolean validator', () => {
    const validator = Schema.boolean();
    runner.assertTrue(validator instanceof BooleanValidator);
  });

  runner.test('should validate basic boolean', () => {
    const validator = Schema.boolean();
    expectValid(validator.validate(true), true);
    expectValid(validator.validate(false), false);
    expectInvalid(validator.validate('true'));
    expectInvalid(validator.validate('false'));
    expectInvalid(validator.validate(1));
    expectInvalid(validator.validate(0));
    expectInvalid(validator.validate(null));
    expectInvalid(validator.validate(undefined));
  });

  runner.test('should handle optional boolean', () => {
    const validator = Schema.boolean().optional();
    expectValid(validator.validate(undefined), undefined);
    expectValid(validator.validate(null), null);
    expectValid(validator.validate(true));
    expectValid(validator.validate(false));
    expectInvalid(validator.validate('true')); // still type-checked if provided
  });

  runner.test('should use custom error messages', () => {
    const validator = Schema.boolean().withMessage('Please select true or false');
    expectInvalid(validator.validate('yes'), 'Please select true or false');
    expectInvalid(validator.validate(1), 'Please select true or false');
  });
});

// DATE VALIDATOR TESTS
runner.describe('DateValidator Tests', () => {
  
  runner.test('should create date validator', () => {
    const validator = Schema.date();
    runner.assertTrue(validator instanceof DateValidator);
  });

  runner.test('should validate Date objects', () => {
    const validator = Schema.date();
    const now = new Date();
    const result = validator.validate(now);
    expectValid(result);
    runner.assertTrue(result.value instanceof Date);
  });

  runner.test('should validate date strings', () => {
    const validator = Schema.date();
    const result = validator.validate('2023-01-01');
    expectValid(result);
    runner.assertTrue(result.value instanceof Date);
    runner.assertEqual(result.value.getFullYear(), 2023);
  });

  runner.test('should reject invalid dates', () => {
    const validator = Schema.date();
    expectInvalid(validator.validate('invalid-date'));
    expectInvalid(validator.validate('2023-13-01')); // invalid month
    expectInvalid(validator.validate(123));
    expectInvalid(validator.validate(null));
    expectInvalid(validator.validate(undefined));
  });

  runner.test('should validate min date', () => {
    const minDate = new Date('2020-01-01');
    const validator = Schema.date().min(minDate);
    expectValid(validator.validate(new Date('2021-01-01')));
    expectValid(validator.validate('2020-01-01')); // equal to min
    expectInvalid(validator.validate(new Date('2019-01-01')));
  });

  runner.test('should validate max date', () => {
    const maxDate = new Date('2025-12-31');
    const validator = Schema.date().max(maxDate);
    expectValid(validator.validate(new Date('2024-01-01')));
    expectValid(validator.validate('2025-12-31')); // equal to max
    expectInvalid(validator.validate(new Date('2026-01-01')));
  });

  runner.test('should chain date validations', () => {
    const validator = Schema.date()
      .min(new Date('2020-01-01'))
      .max(new Date('2025-12-31'));
    expectValid(validator.validate('2022-06-15'));
    expectInvalid(validator.validate('2019-01-01')); // before min
    expectInvalid(validator.validate('2026-01-01')); // after max
  });

  runner.test('should handle optional dates', () => {
    const validator = Schema.date().min(new Date('2020-01-01')).optional();
    expectValid(validator.validate(undefined), undefined);
    expectValid(validator.validate(null), null);
    expectValid(validator.validate('2022-01-01'));
    expectInvalid(validator.validate('2019-01-01')); // still fails min if provided
  });

  runner.test('should use custom error messages', () => {
    const validator = Schema.date().min(new Date('2020-01-01')).withMessage('Date must be after 2020');
    expectInvalid(validator.validate('2019-01-01'), 'Date must be after 2020');
    expectInvalid(validator.validate('invalid'), 'Date must be after 2020');
  });
});

// BASE VALIDATOR TESTS
runner.describe('Base Validator Tests', () => {
  
  runner.test('should handle required vs optional behavior', () => {
    const required = Schema.string();
    const optional = Schema.string().optional();
    
    // Required should fail on null/undefined
    expectInvalid(required.validate(null), 'Value is required');
    expectInvalid(required.validate(undefined), 'Value is required');
    
    // Optional should pass on null/undefined
    expectValid(optional.validate(null), null);
    expectValid(optional.validate(undefined), undefined);
  });

  runner.test('should override error messages with withMessage', () => {
    const validator = Schema.string().minLength(5).withMessage('Too short!');
    expectInvalid(validator.validate('hi'), 'Too short!');
    expectInvalid(validator.validate(123), 'Too short!');
    expectInvalid(validator.validate(null), 'Too short!');
  });

  runner.test('should maintain method chaining with optional and withMessage', () => {
    const validator = Schema.number()
      .min(10)
      .max(100)
      .integer()
      .optional()
      .withMessage('Invalid number range');
    
    expectValid(validator.validate(undefined));
    expectValid(validator.validate(50));
    expectInvalid(validator.validate(5), 'Invalid number range');
    expectInvalid(validator.validate(150), 'Invalid number range');
    expectInvalid(validator.validate(50.5), 'Invalid number range');
  });
});

// EDGE CASES AND ERROR SCENARIOS
runner.describe('Edge Cases and Error Scenarios', () => {
  
  runner.test('should handle empty strings vs null/undefined', () => {
    const validator = Schema.string().minLength(1);
    expectInvalid(validator.validate(''), 'String must be at least 1 characters long');
    expectInvalid(validator.validate(null), 'Value is required');
    expectInvalid(validator.validate(undefined), 'Value is required');
  });

  runner.test('should handle zero and negative numbers', () => {
    const validator = Schema.number();
    expectValid(validator.validate(0), 0);
    expectValid(validator.validate(-0), -0);
    expectValid(validator.validate(-123), -123);
    expectValid(validator.validate(Number.MIN_VALUE));
    expectValid(validator.validate(Number.MAX_VALUE));
  });

  runner.test('should handle special number values', () => {
    const validator = Schema.number();
    expectInvalid(validator.validate(NaN));
    expectInvalid(validator.validate(Infinity)); // Our improved validator rejects Infinity for safety
    expectInvalid(validator.validate(-Infinity)); // Our improved validator rejects -Infinity for safety
  });

  runner.test('should handle complex regex patterns', () => {
    // Email pattern
    const emailValidator = Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expectValid(emailValidator.validate('test@example.com'));
    expectValid(emailValidator.validate('user.name+tag@example.co.uk'));
    expectInvalid(emailValidator.validate('invalid-email'));
    expectInvalid(emailValidator.validate('@example.com'));
    expectInvalid(emailValidator.validate('test@'));
    
    // Password pattern (uppercase, lowercase, digit)
    const passwordValidator = Schema.string()
      .minLength(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);
    expectValid(passwordValidator.validate('MyPass123'));
    expectInvalid(passwordValidator.validate('mypass123')); // no uppercase
    expectInvalid(passwordValidator.validate('MYPASS123')); // no lowercase  
    expectInvalid(passwordValidator.validate('MyPassword')); // no digit
    expectInvalid(passwordValidator.validate('MyPass1')); // too short
  });

  runner.test('should handle date edge cases', () => {
    const validator = Schema.date();
    
    // Valid date formats
    expectValid(validator.validate('2023-01-01T00:00:00Z'));
    expectValid(validator.validate('January 1, 2023'));
    expectValid(validator.validate('01/01/2023'));
    
    // Invalid formats - JavaScript Date is lenient, so use clearly invalid strings
    expectInvalid(validator.validate('not-a-date')); // clearly invalid
    expectInvalid(validator.validate('2023-99-99')); // invalid month/day
    expectInvalid(validator.validate('')); // empty string
  });

  runner.test('should handle method chaining order independence', () => {
    // These should be equivalent
    const validator1 = Schema.string().minLength(3).maxLength(10).pattern(/^[A-Z]/);
    const validator2 = Schema.string().pattern(/^[A-Z]/).maxLength(10).minLength(3);
    const validator3 = Schema.string().maxLength(10).minLength(3).pattern(/^[A-Z]/);
    
    const testValue = 'John';
    expectValid(validator1.validate(testValue));
    expectValid(validator2.validate(testValue));
    expectValid(validator3.validate(testValue));
    
    const invalidValue = 'john'; // fails pattern
    expectInvalid(validator1.validate(invalidValue));
    expectInvalid(validator2.validate(invalidValue));
    expectInvalid(validator3.validate(invalidValue));
  });
});

// OBJECT VALIDATOR TESTS
runner.describe('ObjectValidator Tests', () => {
  
  runner.test('should create object validator', () => {
    const validator = Schema.object({ name: Schema.string() });
    runner.assertTrue(validator instanceof ObjectValidator);
  });

  runner.test('should validate basic object', () => {
    const validator = Schema.object({
      name: Schema.string(),
      age: Schema.number()
    });
    
    expectValid(validator.validate({ name: 'John', age: 25 }));
    expectInvalid(validator.validate('not an object'));
    expectInvalid(validator.validate(null));
    expectInvalid(validator.validate([])); // arrays are not objects
  });

  runner.test('should validate nested object fields', () => {
    const validator = Schema.object({
      name: Schema.string().minLength(2),
      age: Schema.number().min(0).integer(),
      email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    });
    
    // Valid object
    expectValid(validator.validate({
      name: 'John',
      age: 25,
      email: 'john@example.com'
    }));
    
    // Invalid object - multiple field errors
    const result = validator.validate({
      name: 'J', // too short
      age: -5, // negative
      email: 'invalid' // bad format
    });
    
    expectInvalid(result);
    runner.assertTrue(result.fieldErrors !== undefined);
    runner.assertTrue('name' in result.fieldErrors);
    runner.assertTrue('age' in result.fieldErrors);
    runner.assertTrue('email' in result.fieldErrors);
  });

  runner.test('should handle optional object fields', () => {
    const validator = Schema.object({
      name: Schema.string(),
      age: Schema.number().optional(),
      email: Schema.string().optional()
    });
    
    // Valid with optional fields missing
    expectValid(validator.validate({ name: 'John' }));
    
    // Valid with optional fields present
    expectValid(validator.validate({ 
      name: 'John', 
      age: 25, 
      email: 'john@example.com' 
    }));
    
    // Invalid required field
    expectInvalid(validator.validate({ age: 25 })); // missing name
  });

  runner.test('should support nested objects', () => {
    const addressValidator = Schema.object({
      street: Schema.string(),
      city: Schema.string(),
      zipCode: Schema.string().pattern(/^\d{5}$/)
    });
    
    const userValidator = Schema.object({
      name: Schema.string(),
      address: addressValidator
    });
    
    // Valid nested object
    expectValid(userValidator.validate({
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        zipCode: '12345'
      }
    }));
    
    // Invalid nested object
    const result = userValidator.validate({
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        zipCode: 'invalid' // bad zip
      }
    });
    
    expectInvalid(result);
    runner.assertTrue(result.fieldErrors.address !== undefined);
  });

  runner.test('should handle optional objects', () => {
    const validator = Schema.object({
      name: Schema.string(),
      address: Schema.object({
        street: Schema.string()
      }).optional()
    }).optional();
    
    expectValid(validator.validate(undefined), undefined);
    expectValid(validator.validate(null), null);
    expectValid(validator.validate({ name: 'John' })); // optional address missing
    expectValid(validator.validate({ 
      name: 'John', 
      address: { street: '123 Main St' } 
    }));
  });

  runner.test('should use custom error messages', () => {
    const validator = Schema.object({
      name: Schema.string()
    }).withMessage('Invalid user data');
    
    expectInvalid(validator.validate('not object'), 'Invalid user data');
    expectInvalid(validator.validate({ name: 123 }), 'Invalid user data');
  });
});

// ARRAY VALIDATOR TESTS
runner.describe('ArrayValidator Tests', () => {
  
  runner.test('should create array validator', () => {
    const validator = Schema.array(Schema.string());
    runner.assertTrue(validator instanceof ArrayValidator);
  });

  runner.test('should validate basic array', () => {
    const validator = Schema.array(Schema.string());
    
    expectValid(validator.validate(['hello', 'world']));
    expectValid(validator.validate([])); // empty array valid by default
    expectInvalid(validator.validate('not an array'));
    expectInvalid(validator.validate(null));
    expectInvalid(validator.validate({ 0: 'hello' })); // object is not array
  });

  runner.test('should validate array items', () => {
    const validator = Schema.array(Schema.number().min(0));
    
    expectValid(validator.validate([1, 2, 3, 4, 5]));
    expectValid(validator.validate([0]));
    
    // Invalid items
    const result = validator.validate([1, -2, 3, -4]);
    expectInvalid(result);
    runner.assertTrue(result.itemErrors !== undefined);
    runner.assertTrue('1' in result.itemErrors); // index 1 (-2)
    runner.assertTrue('3' in result.itemErrors); // index 3 (-4)
  });

  runner.test('should validate array length constraints', () => {
    const validator = Schema.array(Schema.string()).minLength(2).maxLength(5);
    
    expectValid(validator.validate(['a', 'b'])); // min length
    expectValid(validator.validate(['a', 'b', 'c', 'd', 'e'])); // max length
    expectInvalid(validator.validate(['a']), 'Array must have at least 2 items');
    expectInvalid(validator.validate(['a', 'b', 'c', 'd', 'e', 'f']), 'Array must have no more than 5 items');
  });

  runner.test('should support nested arrays', () => {
    const validator = Schema.array(Schema.array(Schema.number()));
    
    expectValid(validator.validate([[1, 2], [3, 4], [5, 6]]));
    expectValid(validator.validate([[], [1], [2, 3]])); // mixed lengths ok
    expectInvalid(validator.validate([[1, 2], ['invalid'], [5, 6]])); // invalid nested item
  });

  runner.test('should support arrays of objects', () => {
    const userValidator = Schema.array(Schema.object({
      name: Schema.string(),
      age: Schema.number().min(0)
    }));
    
    expectValid(userValidator.validate([
      { name: 'John', age: 25 },
      { name: 'Jane', age: 30 }
    ]));
    
    // Invalid object in array
    const result = userValidator.validate([
      { name: 'John', age: 25 },
      { name: 'Jane', age: -5 } // invalid age
    ]);
    
    expectInvalid(result);
    runner.assertTrue(result.itemErrors !== undefined);
    runner.assertTrue('1' in result.itemErrors); // second item failed
  });

  runner.test('should handle optional arrays', () => {
    const validator = Schema.array(Schema.string()).optional();
    
    expectValid(validator.validate(undefined), undefined);
    expectValid(validator.validate(null), null);
    expectValid(validator.validate(['hello']));
    expectInvalid(validator.validate([123])); // still validates items if provided
  });

  runner.test('should chain array validation methods', () => {
    const validator = Schema.array(Schema.string().minLength(2))
      .minLength(1)
      .maxLength(3)
      .withMessage('Invalid string array');
    
    expectValid(validator.validate(['hello', 'world']));
    expectInvalid(validator.validate([]), 'Invalid string array'); // too short
    expectInvalid(validator.validate(['a', 'b', 'c', 'd']), 'Invalid string array'); // too long
    expectInvalid(validator.validate(['hello', 'a']), 'Invalid string array'); // invalid item
  });

  runner.test('should use custom error messages', () => {
    const validator = Schema.array(Schema.number()).withMessage('Must be number array');
    
    expectInvalid(validator.validate('not array'), 'Must be number array');
    expectInvalid(validator.validate([1, 'two']), 'Must be number array');
  });
});

// COMPLEX NESTED VALIDATION TESTS
runner.describe('Complex Nested Validation Tests', () => {
  
  runner.test('should validate deeply nested structures', () => {
    const commentValidator = Schema.object({
      id: Schema.string(),
      text: Schema.string().minLength(1),
      author: Schema.string()
    });
    
    const postValidator = Schema.object({
      id: Schema.string(),
      title: Schema.string().minLength(1),
      content: Schema.string(),
      tags: Schema.array(Schema.string()),
      comments: Schema.array(commentValidator).optional(),
      metadata: Schema.object({
        created: Schema.date(),
        views: Schema.number().min(0)
      }).optional()
    });
    
    const validPost = {
      id: 'post-1',
      title: 'My Blog Post',
      content: 'This is the content...',
      tags: ['javascript', 'validation'],
      comments: [
        {
          id: 'comment-1',
          text: 'Great post!',
          author: 'reader1'
        }
      ],
      metadata: {
        created: new Date(),
        views: 42
      }
    };
    
    expectValid(postValidator.validate(validPost));
    
    // Test with invalid nested data
    const invalidPost = {
      id: 'post-1',
      title: '', // too short
      content: 'Content',
      tags: [123], // invalid tag type
      comments: [
        {
          id: 'comment-1',
          text: '', // too short
          author: 'reader1'
        }
      ]
    };
    
    expectInvalid(postValidator.validate(invalidPost));
  });

  runner.test('should handle arrays of different validator types', () => {
    const mixedValidator = Schema.object({
      strings: Schema.array(Schema.string()),
      numbers: Schema.array(Schema.number()),
      booleans: Schema.array(Schema.boolean()),
      dates: Schema.array(Schema.date())
    });
    
    expectValid(mixedValidator.validate({
      strings: ['hello', 'world'],
      numbers: [1, 2, 3],
      booleans: [true, false, true],
      dates: [new Date(), '2023-01-01']
    }));
  });

  runner.test('should validate real-world user profile schema', () => {
    const profileValidator = Schema.object({
      personalInfo: Schema.object({
        firstName: Schema.string().minLength(1),
        lastName: Schema.string().minLength(1),
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        birthDate: Schema.date().optional()
      }),
      settings: Schema.object({
        notifications: Schema.boolean(),
        theme: Schema.string().pattern(/^(light|dark)$/),
        language: Schema.string().minLength(2).maxLength(5)
      }).optional(),
      addresses: Schema.array(Schema.object({
        type: Schema.string().pattern(/^(home|work|other)$/),
        street: Schema.string(),
        city: Schema.string(),
        country: Schema.string(),
        isDefault: Schema.boolean()
      })).optional(),
      tags: Schema.array(Schema.string().minLength(1)).optional()
    });
    
    const validProfile = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        birthDate: '1990-01-01'
      },
      settings: {
        notifications: true,
        theme: 'dark',
        language: 'en'
      },
      addresses: [
        {
          type: 'home',
          street: '123 Main St',
          city: 'Anytown',
          country: 'USA',
          isDefault: true
        }
      ],
      tags: ['developer', 'javascript']
    };
    
    expectValid(profileValidator.validate(validProfile));
  });
});

// JAVASCRIPT BEST PRACTICES TESTS
runner.describe('JavaScript Best Practices Tests', () => {
  
  runner.test('should prevent Schema instantiation', () => {
    try {
      new Schema();
      runner.assertTrue(false, 'Expected error when instantiating Schema');
    } catch (error) {
      runner.assertTrue(error.message.includes('Schema class should not be instantiated'));
    }
  });

  runner.test('should validate input parameters properly', () => {
    // String validator parameter validation
    try {
      Schema.string().minLength(-1);
      runner.assertTrue(false, 'Expected error for negative minLength');
    } catch (error) {
      runner.assertTrue(error.message.includes('non-negative integer'));
    }

    try {
      Schema.string().minLength(3.5);
      runner.assertTrue(false, 'Expected error for non-integer minLength');
    } catch (error) {
      runner.assertTrue(error.message.includes('non-negative integer'));
    }

    try {
      Schema.string().pattern('not-a-regex');
      runner.assertTrue(false, 'Expected error for non-RegExp pattern');
    } catch (error) {
      runner.assertTrue(error.message.includes('RegExp object'));
    }
  });

  runner.test('should validate maxLength >= minLength constraints', () => {
    try {
      Schema.string().minLength(10).maxLength(5);
      runner.assertTrue(false, 'Expected error when max < min');
    } catch (error) {
      runner.assertTrue(error.message.includes('greater than or equal to minLength'));
    }

    try {
      Schema.number().min(10).max(5);
      runner.assertTrue(false, 'Expected error when max < min');
    } catch (error) {
      runner.assertTrue(error.message.includes('greater than or equal to min'));
    }
  });

  runner.test('should prevent modification after freeze', () => {
    const validator = Schema.string().minLength(5);
    validator.freeze();
    
    try {
      validator.minLength(10);
      runner.assertTrue(false, 'Expected error when modifying frozen validator');
    } catch (error) {
      runner.assertTrue(error.message.includes('Cannot modify frozen validator'));
    }
  });

  runner.test('should sanitize custom messages', () => {
    try {
      Schema.string().withMessage('');
      runner.assertTrue(false, 'Expected error for empty message');
    } catch (error) {
      runner.assertTrue(error.message.includes('non-empty string'));
    }

    try {
      Schema.string().withMessage('x'.repeat(1001));
      runner.assertTrue(false, 'Expected error for too long message');
    } catch (error) {
      runner.assertTrue(error.message.includes('max length 1000'));
    }

    try {
      Schema.string().withMessage(123);
      runner.assertTrue(false, 'Expected error for non-string message');
    } catch (error) {
      runner.assertTrue(error.message.includes('non-empty string'));
    }
  });

  runner.test('should protect against prototype pollution in ObjectValidator', () => {
    // Test constructor field (this one should work)
    try {
      Schema.object({ 'constructor': Schema.string() });
      runner.assertTrue(false, 'Expected error for constructor field');
    } catch (error) {
      runner.assertTrue(error.message.includes('not allowed'), `Error message was: ${error.message}`);
    }

    // Test prototype field
    try {
      Schema.object({ 'prototype': Schema.string() });
      runner.assertTrue(false, 'Expected error for prototype field');
    } catch (error) {
      runner.assertTrue(error.message.includes('not allowed'), `Error message was: ${error.message}`);
    }

    // Note: __proto__ may be filtered out by JavaScript itself before we can check it
    // so we test other dangerous property names that would definitely be preserved
    try {
      const dangerousSchema = {};
      dangerousSchema.constructor = Schema.string();
      Schema.object(dangerousSchema);
      runner.assertTrue(false, 'Expected error for dangerous schema');
    } catch (error) {
      runner.assertTrue(error.message.includes('not allowed'), `Error message was: ${error.message}`);
    }
  });

  runner.test('should validate schema parameters in ObjectValidator', () => {
    try {
      Schema.object(null);
      runner.assertTrue(false, 'Expected error for null schema');
    } catch (error) {
      runner.assertTrue(error.message.includes('plain object'));
    }

    try {
      Schema.object([]);
      runner.assertTrue(false, 'Expected error for array schema');
    } catch (error) {
      runner.assertTrue(error.message.includes('plain object'));
    }

    try {
      Schema.object({});
      runner.assertTrue(false, 'Expected error for empty schema');
    } catch (error) {
      runner.assertTrue(error.message.includes('cannot be empty'));
    }

    try {
      Schema.object({ field: 'not-a-validator' });
      runner.assertTrue(false, 'Expected error for non-validator field');
    } catch (error) {
      runner.assertTrue(error.message.includes('Validator instance'));
    }
  });

  runner.test('should validate itemValidator in ArrayValidator', () => {
    try {
      Schema.array('not-a-validator');
      runner.assertTrue(false, 'Expected error for non-validator itemValidator');
    } catch (error) {
      runner.assertTrue(error.message.includes('Validator instance'));
    }

    try {
      Schema.array(null);
      runner.assertTrue(false, 'Expected error for null itemValidator');
    } catch (error) {
      runner.assertTrue(error.message.includes('Validator instance'));
    }
  });

  runner.test('should handle date string length validation', () => {
    const validator = Schema.date();
    
    expectInvalid(validator.validate(''), 'Date string length must be between 1 and 100 characters');
    expectInvalid(validator.validate('x'.repeat(101)), 'Date string length must be between 1 and 100 characters');
  });

  runner.test('should test ValidationUtils type checking', () => {
    // Test isPlainObject
    runner.assertTrue(ValidationUtils.isPlainObject({}));
    runner.assertFalse(ValidationUtils.isPlainObject([]));
    runner.assertFalse(ValidationUtils.isPlainObject(null));
    runner.assertFalse(ValidationUtils.isPlainObject(new Date()));

    // Test isNumber (excludes NaN and Infinity based on our implementation)
    runner.assertTrue(ValidationUtils.isNumber(42));
    runner.assertTrue(ValidationUtils.isNumber(3.14));
    runner.assertFalse(ValidationUtils.isNumber(NaN));
    runner.assertFalse(ValidationUtils.isNumber(Infinity));
    runner.assertFalse(ValidationUtils.isNumber('42'));

    // Test isDate
    runner.assertTrue(ValidationUtils.isDate(new Date()));
    runner.assertFalse(ValidationUtils.isDate(new Date('invalid')));
    runner.assertFalse(ValidationUtils.isDate('2023-01-01'));
  });

  runner.test('should test safeClone functionality', () => {
    const original = {
      string: 'hello',
      number: 42,
      boolean: true,
      date: new Date('2023-01-01'),
      array: [1, 2, { nested: 'value' }],
      object: { nested: { deep: 'value' } }
    };

    const cloned = ValidationUtils.safeClone(original);
    
    // Should be different objects
    runner.assertTrue(original !== cloned);
    runner.assertTrue(original.array !== cloned.array);
    runner.assertTrue(original.object !== cloned.object);
    runner.assertTrue(original.date !== cloned.date);
    
    // But have same values
    runner.assertEqual(original.string, cloned.string);
    runner.assertEqual(original.number, cloned.number);
    runner.assertEqual(original.boolean, cloned.boolean);
    runner.assertEqual(original.date.getTime(), cloned.date.getTime());
  });

  runner.test('should handle validation errors gracefully', () => {
    // Create a validator that will throw during validation
    const badValidator = Schema.string();
    badValidator.validateValue = () => {
      throw new Error('Intentional error');
    };

    const result = badValidator.validate('test');
    expectInvalid(result, 'Validation error occurred');
  });
});

// INTEGRATION TESTS
runner.describe('Integration Tests', () => {
  
  runner.test('should work in real-world user validation scenario', () => {
    const usernameValidator = Schema.string()
      .minLength(3)
      .maxLength(20)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-20 chars, letters/numbers/underscore only');
    
    const emailValidator = Schema.string()
      .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      .withMessage('Invalid email format');
    
    const ageValidator = Schema.number()
      .min(13)
      .max(120)
      .integer()
      .optional();
    
    // Valid user data
    expectValid(usernameValidator.validate('john_doe'));
    expectValid(emailValidator.validate('john@example.com'));
    expectValid(ageValidator.validate(25));
    expectValid(ageValidator.validate(undefined)); // age is optional
    
    // Invalid user data
    expectInvalid(usernameValidator.validate('jo')); // too short
    expectInvalid(usernameValidator.validate('john@doe')); // invalid chars
    expectInvalid(emailValidator.validate('not-an-email'));
    expectInvalid(ageValidator.validate(12)); // too young
    expectInvalid(ageValidator.validate(25.5)); // not integer
  });

  runner.test('should validate multiple fields and collect errors', () => {
    const validators = {
      name: Schema.string().minLength(2),
      age: Schema.number().min(0).integer(),
      email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      active: Schema.boolean()
    };
    
    const testData = {
      name: 'J', // too short
      age: -5, // negative
      email: 'invalid', // bad format
      active: 'yes' // wrong type
    };
    
    const results = {};
    const errors = {};
    
    for (const [field, validator] of Object.entries(validators)) {
      const result = validator.validate(testData[field]);
      results[field] = result;
      if (!result.isValid) {
        errors[field] = result.error;
      }
    }
    
    // Should have errors for all fields
    runner.assertEqual(Object.keys(errors).length, 4);
    runner.assertTrue('name' in errors);
    runner.assertTrue('age' in errors);  
    runner.assertTrue('email' in errors);
    runner.assertTrue('active' in errors);
  });
});

// Run all tests
console.log('🧪 Running Schema Validator Test Suite\n');
runner.summary(); 