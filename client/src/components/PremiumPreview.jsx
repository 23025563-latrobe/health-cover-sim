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

const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
});

function roundCurrency(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isValidAge(value) {
    if (value === '' || value === null || value === undefined) {
        return false;
    }

    const age = Number(value);

    return Number.isInteger(age) && age >= 18 && age <= 100;
}

function calculateApplicantHospitalCost(age, history, basePrice) {
    const loading =
        history === 'No' && age > 30 && basePrice > 0
            ? (age - 30) * 0.02
            : 0;

    return {
        loadingPercentage: loading * 100,
        hospitalCost: roundCurrency(basePrice * (1 + loading))
    };
}

function PremiumPreview({ formData }) {
    const includesApplicant2 = formData.cover_type !== 'Single';

    const agesAreValid =
        isValidAge(formData.applicant1_age) &&
        (!includesApplicant2 || isValidAge(formData.applicant2_age));

    const discount = Number(formData.annual_discount);

    const discountIsValid =
        Number.isFinite(discount) &&
        discount >= 0 &&
        discount <= 10;

    const canCalculate = agesAreValid && discountIsValid;

    if (!canCalculate) {
        return (
            <aside
                className="premium-preview"
                aria-label="Premium estimate"
            >
                <div className="premium-preview-heading">
                    <span className="preview-label">Live estimate</span>
                    <h2>Your premium preview</h2>
                    <p>
                        Enter a valid age for each applicant to see
                        the estimated premium.
                    </p>
                </div>

                <div className="preview-placeholder">
                    <span aria-hidden="true">◇</span>
                    <strong>Waiting for applicant details</strong>
                    <p>
                        Your estimate will update automatically as
                        you complete the form.
                    </p>
                </div>
            </aside>
        );
    }

    const hospitalBasePrice =
        HOSPITAL_PRICES[formData.hospital_cover];

    const extrasBasePrice =
        EXTRAS_PRICES[formData.extras_cover];

    const applicants = [
        {
            age: Number(formData.applicant1_age),
            history: formData.applicant1_cover_history
        }
    ];

    if (includesApplicant2) {
        applicants.push({
            age: Number(formData.applicant2_age),
            history: formData.applicant2_cover_history
        });
    }

    const applicantCosts = applicants.map((applicant) =>
        calculateApplicantHospitalCost(
            applicant.age,
            applicant.history,
            hospitalBasePrice
        )
    );

    const hospitalTotal = roundCurrency(
        applicantCosts.reduce(
            (total, applicant) => total + applicant.hospitalCost,
            0
        )
    );

    const extrasTotal = extrasBasePrice * applicants.length;

    const familyFee =
        formData.cover_type === 'Family' ? 30 : 0;

    const monthlyPremium = roundCurrency(
        hospitalTotal + extrasTotal + familyFee
    );

    const yearlyBeforeDiscount = roundCurrency(
        monthlyPremium * 12
    );

    const appliedDiscount =
        formData.payment_frequency === 'Yearly'
            ? discount
            : 0;

    const discountAmount = roundCurrency(
        yearlyBeforeDiscount * appliedDiscount / 100
    );

    const yearlyAfterDiscount = roundCurrency(
        yearlyBeforeDiscount * (1 - appliedDiscount / 100)
    );

    const hasUnknownHistory = applicants.some(
        (applicant) => applicant.history === 'Not sure'
    );

    const isYearly = formData.payment_frequency === 'Yearly';

    return (
        <aside
            className="premium-preview"
            aria-label="Premium estimate"
        >
            <div className="premium-preview-heading">
                <span className="preview-label">Live estimate</span>
                <h2>Your premium preview</h2>
                <p>
                    Updates automatically as you change the
                    quote details.
                </p>
            </div>

            <div className="preview-hero">
                <span>
                    {isYearly
                        ? 'Estimated yearly payment'
                        : 'Estimated monthly payment'}
                </span>

                <strong>
                    {currencyFormatter.format(
                        isYearly
                            ? yearlyAfterDiscount
                            : monthlyPremium
                    )}
                </strong>

                <small>
                    {isYearly ? 'per year' : 'per month'}
                </small>
            </div>

            <dl className="preview-breakdown">
                <div>
                    <dt>Hospital cover</dt>
                    <dd>
                        {currencyFormatter.format(hospitalTotal)}
                    </dd>
                </div>

                <div>
                    <dt>Extras cover</dt>
                    <dd>
                        {currencyFormatter.format(extrasTotal)}
                    </dd>
                </div>

                {formData.cover_type === 'Family' && (
                    <div>
                        <dt>Family upgrade</dt>
                        <dd>
                            {currencyFormatter.format(familyFee)}
                        </dd>
                    </div>
                )}

                <div className="preview-subtotal">
                    <dt>Monthly premium</dt>
                    <dd>
                        {currencyFormatter.format(monthlyPremium)}
                    </dd>
                </div>

                <div>
                    <dt>Yearly before discount</dt>
                    <dd>
                        {currencyFormatter.format(
                            yearlyBeforeDiscount
                        )}
                    </dd>
                </div>

                {isYearly && (
                    <div className="preview-discount">
                        <dt>
                            Annual discount ({appliedDiscount}%)
                        </dt>
                        <dd>
                            −{currencyFormatter.format(
                            discountAmount
                        )}
                        </dd>
                    </div>
                )}

                <div className="preview-final">
                    <dt>Yearly after discount</dt>
                    <dd>
                        {currencyFormatter.format(
                            yearlyAfterDiscount
                        )}
                    </dd>
                </div>
            </dl>

            {applicantCosts.some(
                (applicant) => applicant.loadingPercentage > 0
            ) && (
                <div className="preview-notice">
                    <strong>LHC loading included</strong>
                    <p>
                        Applicable loading has been included in
                        the hospital premium for each applicant.
                    </p>
                </div>
            )}

            {hasUnknownHistory && (
                <div className="preview-warning" role="status">
                    <strong>Cover history is uncertain</strong>
                    <p>
                        No LHC loading has been applied for an
                        applicant whose cover history is
                        &quot;Not sure&quot;. The estimate may be
                        inaccurate.
                    </p>
                </div>
            )}

            <p className="preview-disclaimer">
                Lifetime Health Cover loading applies only to
                hospital cover. It does not apply to extras cover.
            </p>

            <p className="preview-footnote">
                This is an indicative estimate. The final quote
                is calculated and saved by the server.
            </p>
        </aside>
    );
}

export default PremiumPreview;
