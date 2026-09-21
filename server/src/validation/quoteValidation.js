const VALID_OPTIONS = {
    coverTypes: ['Single', 'Couple', 'Family'],
    coverHistories: ['Yes', 'No', 'Not sure'],
    hospitalLevels: ['None', 'Basic', 'Bronze', 'Silver', 'Gold'],
    extrasLevels: ['None', 'Basic', 'Standard', 'Premium'],
    paymentFrequencies: ['Monthly', 'Yearly']
};

function isMissing(value) {
    return value === undefined || value === null || value === '';
}

function validateAge(value, fieldName, errors) {
    if (isMissing(value)) {
        errors.push(`${fieldName} is required.`);
        return null;
    }

    const age = Number(value);

    if (!Number.isInteger(age) || age < 18 || age > 100) {
        errors.push(`${fieldName} must be a whole number between 18 and 100.`);
        return null;
    }

    return age;
}

function validateOption(value, options, fieldName, errors) {
    if (isMissing(value)) {
        errors.push(`${fieldName} is required.`);
        return null;
    }

    if (!options.includes(value)) {
        errors.push(`${fieldName} contains an invalid selection.`);
        return null;
    }

    return value;
}

function validateQuoteInput(input = {}) {
    const errors = [];

    const customerName =
        typeof input.customer_name === 'string'
            ? input.customer_name.trim()
            : '';

    if (!customerName) {
        errors.push('Customer name is required.');
    }

    const coverType = validateOption(
        input.cover_type,
        VALID_OPTIONS.coverTypes,
        'Cover type',
        errors
    );

    const applicant1Age = validateAge(
        input.applicant1_age,
        'Applicant 1 age',
        errors
    );

    const applicant1CoverHistory = validateOption(
        input.applicant1_cover_history,
        VALID_OPTIONS.coverHistories,
        'Applicant 1 cover history',
        errors
    );

    let applicant2Age = null;
    let applicant2CoverHistory = null;

    if (coverType === 'Couple' || coverType === 'Family') {
        applicant2Age = validateAge(
            input.applicant2_age,
            'Applicant 2 age',
            errors
        );

        applicant2CoverHistory = validateOption(
            input.applicant2_cover_history,
            VALID_OPTIONS.coverHistories,
            'Applicant 2 cover history',
            errors
        );
    }

    const hospitalCover = validateOption(
        input.hospital_cover,
        VALID_OPTIONS.hospitalLevels,
        'Hospital cover',
        errors
    );

    const extrasCover = validateOption(
        input.extras_cover,
        VALID_OPTIONS.extrasLevels,
        'Extras cover',
        errors
    );

    const paymentFrequency = validateOption(
        input.payment_frequency,
        VALID_OPTIONS.paymentFrequencies,
        'Payment frequency',
        errors
    );

    let annualDiscount = 0;

    if (!isMissing(input.annual_discount)) {
        annualDiscount = Number(input.annual_discount);

        if (
            !Number.isFinite(annualDiscount) ||
            annualDiscount < 0 ||
            annualDiscount > 10
        ) {
            errors.push('Annual discount must be between 0 and 10.');
        }
    }

    if (paymentFrequency === 'Monthly') {
        annualDiscount = 0;
    }

    const notes =
        typeof input.notes === 'string'
            ? input.notes.trim()
            : '';

    return {
        errors,
        value: {
            customer_name: customerName,
            cover_type: coverType,
            applicant1_age: applicant1Age,
            applicant1_cover_history: applicant1CoverHistory,
            applicant2_age: applicant2Age,
            applicant2_cover_history: applicant2CoverHistory,
            hospital_cover: hospitalCover,
            extras_cover: extrasCover,
            payment_frequency: paymentFrequency,
            annual_discount: annualDiscount,
            notes
        }
    };
}

module.exports = {
    VALID_OPTIONS,
    validateQuoteInput
};