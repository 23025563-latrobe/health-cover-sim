const HOSPITAL_PRICES = {
    None: 0,
    Basic: 90,
    Bronze: 120,
    Silver: 160,
    Gold: 220
};

const EXTRAS_PRICES = {
    None: 0,
    Basic: 25,
    Standard: 45,
    Premium: 70
};

const FAMILY_UPGRADE_FEE = 30;

const LHC_STATEMENT =
    'Lifetime Health Cover loading applies only to hospital cover. It does not apply to extras cover.';

function roundCurrency(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateLoading(age, coverHistory, hospitalCover) {
    if (hospitalCover === 'None') {
        return 0;
    }

    if (coverHistory !== 'No' || age <= 30) {
        return 0;
    }

    return (age - 30) * 0.02;
}

function calculateQuote(quote) {
    const applicants = [
        {
            number: 1,
            age: quote.applicant1_age,
            coverHistory: quote.applicant1_cover_history
        }
    ];

    if (quote.cover_type === 'Couple' || quote.cover_type === 'Family') {
        applicants.push({
            number: 2,
            age: quote.applicant2_age,
            coverHistory: quote.applicant2_cover_history
        });
    }

    const hospitalBasePrice = HOSPITAL_PRICES[quote.hospital_cover];
    const extrasBasePrice = EXTRAS_PRICES[quote.extras_cover];

    const applicantBreakdown = applicants.map((applicant) => {
        const loadingRate = calculateLoading(
            applicant.age,
            applicant.coverHistory,
            quote.hospital_cover
        );

        const hospitalCost = hospitalBasePrice * (1 + loadingRate);

        return {
            applicant_number: applicant.number,
            age: applicant.age,
            cover_history: applicant.coverHistory,
            lhc_loading_percentage: loadingRate * 100,
            hospital_cost: roundCurrency(hospitalCost)
        };
    });

    const hospitalTotal = applicantBreakdown.reduce(
        (total, applicant) => total + applicant.hospital_cost,
        0
    );

    const extrasTotal = extrasBasePrice * applicants.length;

    const familyUpgradeFee =
        quote.cover_type === 'Family'
            ? FAMILY_UPGRADE_FEE
            : 0;

    const monthlyPremium =
        hospitalTotal + extrasTotal + familyUpgradeFee;

    const yearlyBeforeDiscount = monthlyPremium * 12;

    const appliedDiscount =
        quote.payment_frequency === 'Yearly'
            ? quote.annual_discount
            : 0;

    const yearlyAfterDiscount =
        yearlyBeforeDiscount * (1 - appliedDiscount / 100);

    const warnings = applicants
        .filter((applicant) => applicant.coverHistory === 'Not sure')
        .map(
            (applicant) =>
                `Applicant ${applicant.number}: Cover history is unknown - LHC loading has not been applied. This quote may be inaccurate.`
        );

    const calculationExplanation =
        `The hospital premium was calculated separately for ${applicants.length} ` +
        `${applicants.length === 1 ? 'adult' : 'adults'}, including any applicable ` +
        `LHC loading. Extras cover was then calculated per adult. ` +
        `${
            quote.cover_type === 'Family'
                ? 'The $30 monthly family upgrade fee was added once. '
                : ''
        }` +
        `${
            quote.payment_frequency === 'Yearly'
                ? `A ${appliedDiscount}% annual-payment discount was applied to the yearly total.`
                : 'No annual-payment discount was applied because the customer selected monthly payment.'
        }`;

    return {
        adult_count: applicants.length,
        applicants: applicantBreakdown,
        hospital_total: roundCurrency(hospitalTotal),
        extras_total: roundCurrency(extrasTotal),
        family_upgrade_fee: roundCurrency(familyUpgradeFee),
        monthly_premium: roundCurrency(monthlyPremium),
        yearly_before_discount: roundCurrency(yearlyBeforeDiscount),
        annual_discount_percentage: appliedDiscount,
        yearly_after_discount: roundCurrency(yearlyAfterDiscount),
        final_total:
            quote.payment_frequency === 'Yearly'
                ? roundCurrency(yearlyAfterDiscount)
                : roundCurrency(monthlyPremium),
        warnings,
        lhc_statement: LHC_STATEMENT,
        explanation: calculationExplanation
    };
}

module.exports = {
    calculateQuote,
    calculateLoading,
    HOSPITAL_PRICES,
    EXTRAS_PRICES,
    FAMILY_UPGRADE_FEE,
    LHC_STATEMENT
};