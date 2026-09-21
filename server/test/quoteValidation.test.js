const test = require('node:test');
const assert = require('node:assert/strict');

const {
    validateQuoteInput
} = require('../src/validation/quoteValidation');

function validSingleQuote() {
    return {
        customer_name: 'Taylor Morgan',
        cover_type: 'Single',
        applicant1_age: 35,
        applicant1_cover_history: 'Yes',
        hospital_cover: 'Bronze',
        extras_cover: 'Standard',
        payment_frequency: 'Yearly',
        annual_discount: 5,
        notes: ''
    };
}

test('accepts a valid Single quote', () => {
    const result = validateQuoteInput(validSingleQuote());

    assert.deepEqual(result.errors, []);
    assert.equal(result.value.applicant2_age, null);
    assert.equal(result.value.applicant2_cover_history, null);
});

test('requires Applicant 2 for Couple cover', () => {
    const input = {
        ...validSingleQuote(),
        cover_type: 'Couple'
    };

    const result = validateQuoteInput(input);

    assert.ok(result.errors.includes('Applicant 2 age is required.'));
    assert.ok(
        result.errors.includes('Applicant 2 cover history is required.')
    );
});

test('rejects ages outside 18 to 100', () => {
    const input = {
        ...validSingleQuote(),
        applicant1_age: 0
    };

    const result = validateQuoteInput(input);

    assert.ok(
        result.errors.includes(
            'Applicant 1 age must be a whole number between 18 and 100.'
        )
    );
});

test('rejects discounts outside 0 to 10', () => {
    const input = {
        ...validSingleQuote(),
        annual_discount: 15
    };

    const result = validateQuoteInput(input);

    assert.ok(
        result.errors.includes(
            'Annual discount must be between 0 and 10.'
        )
    );
});

test('sets the annual discount to zero for monthly payment', () => {
    const input = {
        ...validSingleQuote(),
        payment_frequency: 'Monthly',
        annual_discount: 8
    };

    const result = validateQuoteInput(input);

    assert.deepEqual(result.errors, []);
    assert.equal(result.value.annual_discount, 0);
});