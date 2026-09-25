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


test('charges extras without LHC when hospital cover is None', () => {
    const result = calculateQuote({
        cover_type: 'Single',
        applicant1_age: 50,
        applicant1_cover_history: 'No',
        hospital_cover: 'None',
        extras_cover: 'Premium',
        payment_frequency: 'Monthly',
        annual_discount: 0
    });

    assert.equal(result.applicants[0].lhc_loading_percentage, 0);
    assert.equal(result.hospital_total, 0);
    assert.equal(result.extras_total, 70);
    assert.equal(result.monthly_premium, 70);
    assert.equal(result.yearly_after_discount, 840);
});

test('calculates different LHC loading for two applicants', () => {
    const result = calculateQuote({
        cover_type: 'Couple',
        applicant1_age: 40,
        applicant1_cover_history: 'No',
        applicant2_age: 35,
        applicant2_cover_history: 'No',
        hospital_cover: 'Silver',
        extras_cover: 'Basic',
        payment_frequency: 'Monthly',
        annual_discount: 0
    });

    assert.equal(result.adult_count, 2);

    assert.equal(result.applicants[0].lhc_loading_percentage, 20);
    assert.equal(result.applicants[0].hospital_cost, 192);

    assert.equal(result.applicants[1].lhc_loading_percentage, 10);
    assert.equal(result.applicants[1].hospital_cost, 176);

    assert.equal(result.hospital_total, 368);
    assert.equal(result.extras_total, 50);
    assert.equal(result.family_upgrade_fee, 0);
    assert.equal(result.monthly_premium, 418);
});

test('adds the family upgrade fee exactly once', () => {
    const result = calculateQuote({
        cover_type: 'Family',
        applicant1_age: 30,
        applicant1_cover_history: 'Yes',
        applicant2_age: 30,
        applicant2_cover_history: 'Yes',
        hospital_cover: 'Basic',
        extras_cover: 'None',
        payment_frequency: 'Monthly',
        annual_discount: 0
    });

    assert.equal(result.hospital_total, 180);
    assert.equal(result.extras_total, 0);
    assert.equal(result.family_upgrade_fee, 30);
    assert.equal(result.monthly_premium, 210);
});

test('creates separate warnings for two unknown cover histories', () => {
    const result = calculateQuote({
        cover_type: 'Couple',
        applicant1_age: 45,
        applicant1_cover_history: 'Not sure',
        applicant2_age: 50,
        applicant2_cover_history: 'Not sure',
        hospital_cover: 'Gold',
        extras_cover: 'None',
        payment_frequency: 'Yearly',
        annual_discount: 0
    });

    assert.equal(result.warnings.length, 2);
    assert.match(result.warnings[0], /Applicant 1/);
    assert.match(result.warnings[1], /Applicant 2/);

    assert.equal(result.applicants[0].lhc_loading_percentage, 0);
    assert.equal(result.applicants[1].lhc_loading_percentage, 0);
});

test('applies the maximum annual discount of 10 percent', () => {
    const result = calculateQuote({
        cover_type: 'Single',
        applicant1_age: 30,
        applicant1_cover_history: 'Yes',
        hospital_cover: 'Gold',
        extras_cover: 'Premium',
        payment_frequency: 'Yearly',
        annual_discount: 10
    });

    assert.equal(result.monthly_premium, 290);
    assert.equal(result.yearly_before_discount, 3480);
    assert.equal(result.annual_discount_percentage, 10);
    assert.equal(result.yearly_after_discount, 3132);
    assert.equal(result.final_total, 3132);
});

test('returns the monthly premium as final total for monthly payment', () => {
    const result = calculateQuote({
        cover_type: 'Single',
        applicant1_age: 30,
        applicant1_cover_history: 'Yes',
        hospital_cover: 'Basic',
        extras_cover: 'Basic',
        payment_frequency: 'Monthly',
        annual_discount: 0
    });

    assert.equal(result.monthly_premium, 115);
    assert.equal(result.final_total, 115);
});
