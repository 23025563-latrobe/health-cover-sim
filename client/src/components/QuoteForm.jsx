import { useState } from 'react';

const initialFormData = {
    customer_name: '',
    cover_type: 'Single',
    applicant1_age: '',
    applicant1_cover_history: 'Yes',
    applicant2_age: '',
    applicant2_cover_history: 'Yes',
    hospital_cover: 'Bronze',
    extras_cover: 'None',
    payment_frequency: 'Monthly',
    annual_discount: 0,
    notes: ''
};

function createInitialFormData(initialValues) {
    return {
        ...initialFormData,
        ...initialValues,
        applicant1_age: initialValues.applicant1_age ?? '',
        applicant2_age: initialValues.applicant2_age ?? ''
    };
}

function validateForm(formData) {
    const errors = {};

    if (!formData.customer_name.trim()) {
        errors.customer_name = 'Customer name is required.';
    }

    const applicant1Age = Number(formData.applicant1_age);

    if (
        !Number.isInteger(applicant1Age) ||
        applicant1Age < 18 ||
        applicant1Age > 100
    ) {
        errors.applicant1_age =
            'Applicant 1 age must be a whole number between 18 and 100.';
    }

    if (formData.cover_type !== 'Single') {
        const applicant2Age = Number(formData.applicant2_age);

        if (
            !Number.isInteger(applicant2Age) ||
            applicant2Age < 18 ||
            applicant2Age > 100
        ) {
            errors.applicant2_age =
                'Applicant 2 age must be a whole number between 18 and 100.';
        }
    }

    const annualDiscount = Number(formData.annual_discount);

    if (
        !Number.isFinite(annualDiscount) ||
        annualDiscount < 0 ||
        annualDiscount > 10
    ) {
        errors.annual_discount =
            'Annual discount must be between 0 and 10.';
    }

    return errors;
}

function prepareQuotePayload(formData) {
    const includesApplicant2 = formData.cover_type !== 'Single';

    return {
        customer_name: formData.customer_name.trim(),
        cover_type: formData.cover_type,
        applicant1_age: Number(formData.applicant1_age),
        applicant1_cover_history:
        formData.applicant1_cover_history,
        applicant2_age: includesApplicant2
            ? Number(formData.applicant2_age)
            : null,
        applicant2_cover_history: includesApplicant2
            ? formData.applicant2_cover_history
            : null,
        hospital_cover: formData.hospital_cover,
        extras_cover: formData.extras_cover,
        payment_frequency: formData.payment_frequency,
        annual_discount:
            formData.payment_frequency === 'Yearly'
                ? Number(formData.annual_discount)
                : 0,
        notes: formData.notes.trim()
    };
}

function QuoteForm({
                       initialValues = initialFormData,
                       onSubmit,
                       submitLabel,
                       isSubmitting,
                       serverErrors = []
                   }) {
    const [formData, setFormData] = useState(() =>
        createInitialFormData(initialValues)
    );
    const [fieldErrors, setFieldErrors] = useState({});

    const includesApplicant2 =
        formData.cover_type !== 'Single';
    const isYearlyPayment =
        formData.payment_frequency === 'Yearly';

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => {
            const updatedData = {
                ...currentData,
                [name]: value
            };

            if (
                name === 'cover_type' &&
                value === 'Single'
            ) {
                updatedData.applicant2_age = '';
                updatedData.applicant2_cover_history = 'Yes';
            }

            if (
                name === 'payment_frequency' &&
                value === 'Monthly'
            ) {
                updatedData.annual_discount = 0;
            }

            return updatedData;
        });

        setFieldErrors((currentErrors) => ({
            ...currentErrors,
            [name]: undefined
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        const validationErrors = validateForm(formData);
        setFieldErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        onSubmit(prepareQuotePayload(formData));
    }

    return (
        <form
            className="quote-form"
            onSubmit={handleSubmit}
            noValidate
        >
            {serverErrors.length > 0 && (
                <div
                    className="alert alert-error"
                    role="alert"
                >
                    <strong>
                        The quote could not be saved.
                    </strong>

                    <ul>
                        {serverErrors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <section className="form-section">
                <div className="form-section-heading">
                    <span className="section-number">
                        1
                    </span>

                    <div>
                        <h2>Customer and cover</h2>

                        <p>
                            Enter the customer’s name and
                            required type of cover.
                        </p>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-field form-field-wide">
                        <label htmlFor="customer_name">
                            Customer name
                        </label>

                        <input
                            id="customer_name"
                            name="customer_name"
                            type="text"
                            value={formData.customer_name}
                            onChange={handleChange}
                            aria-invalid={Boolean(
                                fieldErrors.customer_name
                            )}
                            aria-describedby={
                                fieldErrors.customer_name
                                    ? 'customer_name_error'
                                    : undefined
                            }
                        />

                        {fieldErrors.customer_name && (
                            <span
                                id="customer_name_error"
                                className="field-error"
                            >
                                {fieldErrors.customer_name}
                            </span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="cover_type">
                            Cover type
                        </label>

                        <select
                            id="cover_type"
                            name="cover_type"
                            value={formData.cover_type}
                            onChange={handleChange}
                        >
                            <option value="Single">
                                Single
                            </option>

                            <option value="Couple">
                                Couple
                            </option>

                            <option value="Family">
                                Family
                            </option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="form-section">
                <div className="form-section-heading">
                    <span className="section-number">
                        2
                    </span>

                    <div>
                        <h2>Applicant details</h2>

                        <p>
                            Cover history is used to determine
                            whether an LHC loading may apply.
                        </p>
                    </div>
                </div>

                <fieldset className="applicant-panel">
                    <legend>Applicant 1</legend>

                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="applicant1_age">
                                Age
                            </label>

                            <input
                                id="applicant1_age"
                                name="applicant1_age"
                                type="number"
                                min="18"
                                max="100"
                                step="1"
                                value={
                                    formData.applicant1_age
                                }
                                onChange={handleChange}
                                aria-invalid={Boolean(
                                    fieldErrors.applicant1_age
                                )}
                                aria-describedby={
                                    fieldErrors.applicant1_age
                                        ? 'applicant1_age_error'
                                        : undefined
                                }
                            />

                            {fieldErrors.applicant1_age && (
                                <span
                                    id="applicant1_age_error"
                                    className="field-error"
                                >
                                    {
                                        fieldErrors
                                            .applicant1_age
                                    }
                                </span>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="applicant1_cover_history">
                                Previous hospital cover
                            </label>

                            <select
                                id="applicant1_cover_history"
                                name="applicant1_cover_history"
                                value={
                                    formData
                                        .applicant1_cover_history
                                }
                                onChange={handleChange}
                            >
                                <option value="Yes">
                                    Yes
                                </option>

                                <option value="No">
                                    No
                                </option>

                                <option value="Not sure">
                                    Not sure
                                </option>
                            </select>
                        </div>
                    </div>
                </fieldset>

                {includesApplicant2 && (
                    <fieldset className="applicant-panel">
                        <legend>Applicant 2</legend>

                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="applicant2_age">
                                    Age
                                </label>

                                <input
                                    id="applicant2_age"
                                    name="applicant2_age"
                                    type="number"
                                    min="18"
                                    max="100"
                                    step="1"
                                    value={
                                        formData
                                            .applicant2_age
                                    }
                                    onChange={handleChange}
                                    aria-invalid={Boolean(
                                        fieldErrors
                                            .applicant2_age
                                    )}
                                    aria-describedby={
                                        fieldErrors
                                            .applicant2_age
                                            ? 'applicant2_age_error'
                                            : undefined
                                    }
                                />

                                {fieldErrors.applicant2_age && (
                                    <span
                                        id="applicant2_age_error"
                                        className="field-error"
                                    >
                                        {
                                            fieldErrors
                                                .applicant2_age
                                        }
                                    </span>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="applicant2_cover_history">
                                    Previous hospital cover
                                </label>

                                <select
                                    id="applicant2_cover_history"
                                    name="applicant2_cover_history"
                                    value={
                                        formData
                                            .applicant2_cover_history
                                    }
                                    onChange={handleChange}
                                >
                                    <option value="Yes">
                                        Yes
                                    </option>

                                    <option value="No">
                                        No
                                    </option>

                                    <option value="Not sure">
                                        Not sure
                                    </option>
                                </select>
                            </div>
                        </div>
                    </fieldset>
                )}
            </section>

            <section className="form-section">
                <div className="form-section-heading">
                    <span className="section-number">
                        3
                    </span>

                    <div>
                        <h2>Cover selection</h2>

                        <p>
                            Select the hospital and extras cover
                            levels used in the estimate.
                        </p>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="hospital_cover">
                            Hospital cover
                        </label>

                        <select
                            id="hospital_cover"
                            name="hospital_cover"
                            value={formData.hospital_cover}
                            onChange={handleChange}
                        >
                            <option value="None">
                                None
                            </option>

                            <option value="Basic">
                                Basic
                            </option>

                            <option value="Bronze">
                                Bronze
                            </option>

                            <option value="Silver">
                                Silver
                            </option>

                            <option value="Gold">
                                Gold
                            </option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="extras_cover">
                            Extras cover
                        </label>

                        <select
                            id="extras_cover"
                            name="extras_cover"
                            value={formData.extras_cover}
                            onChange={handleChange}
                        >
                            <option value="None">
                                None
                            </option>

                            <option value="Basic">
                                Basic
                            </option>

                            <option value="Standard">
                                Standard
                            </option>

                            <option value="Premium">
                                Premium
                            </option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="form-section">
                <div className="form-section-heading">
                    <span className="section-number">
                        4
                    </span>

                    <div>
                        <h2>Payment and notes</h2>

                        <p>
                            Annual discounts apply only when
                            yearly payment is selected.
                        </p>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="payment_frequency">
                            Payment frequency
                        </label>

                        <select
                            id="payment_frequency"
                            name="payment_frequency"
                            value={
                                formData.payment_frequency
                            }
                            onChange={handleChange}
                        >
                            <option value="Monthly">
                                Monthly
                            </option>

                            <option value="Yearly">
                                Yearly
                            </option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="annual_discount">
                            Annual discount (%)
                        </label>

                        <input
                            id="annual_discount"
                            name="annual_discount"
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={formData.annual_discount}
                            onChange={handleChange}
                            disabled={!isYearlyPayment}
                            aria-invalid={Boolean(
                                fieldErrors.annual_discount
                            )}
                            aria-describedby={
                                fieldErrors.annual_discount
                                    ? 'annual_discount_error'
                                    : !isYearlyPayment
                                        ? 'annual_discount_help'
                                        : undefined
                            }
                        />

                        {fieldErrors.annual_discount && (
                            <span
                                id="annual_discount_error"
                                className="field-error"
                            >
                                {
                                    fieldErrors
                                        .annual_discount
                                }
                            </span>
                        )}

                        {!isYearlyPayment && (
                            <span
                                id="annual_discount_help"
                                className="field-help"
                            >
                                Discounts are unavailable for
                                monthly payment.
                            </span>
                        )}
                    </div>

                    <div className="form-field form-field-wide">
                        <label htmlFor="notes">
                            Notes (optional)
                        </label>

                        <textarea
                            id="notes"
                            name="notes"
                            rows="4"
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </section>

            <div className="form-actions">
                <button
                    className="button button-primary"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? 'Saving quote...'
                        : submitLabel}
                </button>
            </div>
        </form>
    );
}

export default QuoteForm;