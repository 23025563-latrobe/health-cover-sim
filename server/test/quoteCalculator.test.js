const test = require('node:test');
const assert = require('node:assert/strict');

const {
    calculateQuote,
    calculateLoading
} = require('../src/services/quoteCalculator');

test('matches the assignment Family worked example', () => {
    const quote = {
        cover_type: 'Family',
        applicant1_age: 40,
        applicant1_cover_history: 'No',
        applicant2_age: 35,
        applicant2_cover_history: 'Yes',
        hospital_cover: 'Silver',
        extras_cover: 'Standard',
        payment_frequency: 'Yearly',
        annual_discount: 5
    };

    const result = calculateQuote(quote);

    assert.equal(result.applicants[0].lhc_loading_percentage, 20);
    assert.equal(result.applicants[0].hospital_cost, 192);
    assert.equal(result.applicants[1].lhc_loading_percentage, 0);
    assert.equal(result.applicants[1].hospital_cost, 160);
    assert.equal(result.hospital_total, 352);
    assert.equal(result.extras_total, 90);
    assert.equal(result.family_upgrade_fee, 30);
    assert.equal(result.monthly_premium, 472);
    assert.equal(result.yearly_before_discount, 5664);
    assert.equal(result.yearly_after_discount, 5380.8);
});

test('does not apply LHC loading when hospital cover is None', () => {
    assert.equal(calculateLoading(50, 'No', 'None'), 0);
});

test('does not apply LHC loading to an applicant with prior cover', () => {
    assert.equal(calculateLoading(45, 'Yes', 'Gold'), 0);
});

test('does not apply LHC loading when the applicant is age 30 or younger', () => {
    assert.equal(calculateLoading(30, 'No', 'Bronze'), 0);
});

test('does not apply an annual discount to monthly payment', () => {
    const result = calculateQuote({
        cover_type: 'Single',
        applicant1_age: 40,
        applicant1_cover_history: 'No',
        hospital_cover: 'Basic',
        extras_cover: 'Basic',
        payment_frequency: 'Monthly',
        annual_discount: 10
    });

    assert.equal(result.annual_discount_percentage, 0);
    assert.equal(result.monthly_premium, 133);
    assert.equal(result.yearly_before_discount, 1596);
    assert.equal(result.yearly_after_discount, 1596);
});

test('creates an individual warning for Not sure history', () => {
    const result = calculateQuote({
        cover_type: 'Single',
        applicant1_age: 45,
        applicant1_cover_history: 'Not sure',
        hospital_cover: 'Gold',
        extras_cover: 'None',
        payment_frequency: 'Yearly',
        annual_discount: 0
    });

    assert.equal(result.applicants[0].lhc_loading_percentage, 0);
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /Applicant 1/);
});