const test = require('node:test');
const assert = require('node:assert/strict');

const {
    validateQuoteInput
} = require('../src/validation/quoteValidation');

function validSingleQuote() {
    return {
        customer_name: 'Ruixin Test',
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


test('accepts the minimum applicant age of 18', () => {
    const result = validateQuoteInput({
        ...validSingleQuote(),
        applicant1_age: 18
    });

    assert.deepEqual(result.errors, []);
    assert.equal(result.value.applicant1_age, 18);
});

test('accepts the maximum applicant age of 100', () => {
    const result = validateQuoteInput({
        ...validSingleQuote(),
        applicant1_age: 100
    });

    assert.deepEqual(result.errors, []);
    assert.equal(result.value.applicant1_age, 100);
});

test('rejects a decimal applicant age', () => {
    const result = validateQuoteInput({
        ...validSingleQuote(),
        applicant1_age: 25.5
    });

    assert.ok(
        result.errors.includes(
            'Applicant 1 age must be a whole number between 18 and 100.'
        )
    );
});

test('accepts annual discount boundaries of 0 and 10', () => {
    for (const discount of [0, 10]) {
        const result = validateQuoteInput({
            ...validSingleQuote(),
            annual_discount: discount
        });

        assert.deepEqual(result.errors, []);
        assert.equal(result.value.annual_discount, discount);
    }
});

test('rejects an invalid cover type', () => {
    const result = validateQuoteInput({
        ...validSingleQuote(),
        cover_type: 'Business'
    });

    assert.ok(
        result.errors.includes(
            'Cover type contains an invalid selection.'
        )
    );
});

test('removes Applicant 2 information from Single cover', () => {
    const result = validateQuoteInput({
        ...validSingleQuote(),
        applicant2_age: 45,
        applicant2_cover_history: 'No'
    });

    assert.deepEqual(result.errors, []);
    assert.equal(result.value.applicant2_age, null);
    assert.equal(result.value.applicant2_cover_history, null);
});

test('trims customer name and notes', () => {
    const result = validateQuoteInput({
        ...validSingleQuote(),
        customer_name: '  Ruixin Test  ',
        notes: '  Customer requested a quote.  '
    });

    assert.deepEqual(result.errors, []);
    assert.equal(result.value.customer_name, 'Ruixin Test');
    assert.equal(result.value.notes, 'Customer requested a quote.');
});
