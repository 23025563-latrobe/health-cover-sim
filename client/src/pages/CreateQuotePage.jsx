import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import QuoteForm from '../components/QuoteForm';
import { createQuote } from '../services/quoteApi';

function CreateQuotePage() {
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverErrors, setServerErrors] = useState([]);

    async function handleCreateQuote(quoteData) {
        setIsSubmitting(true);
        setServerErrors([]);

        try {
            const response = await createQuote(quoteData);

            navigate(`/quotes/${response.quote.id}`, {
                state: {
                    successMessage: 'Quote created successfully.'
                }
            });
        } catch (error) {
            setServerErrors(
                error.details.length > 0
                    ? error.details
                    : [error.message]
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <div className="breadcrumb">
                <Link to="/">Quotes</Link>
                <span>/</span>
                <span>Create quote</span>
            </div>

            <section className="page-heading">
                <div>
                    <p className="eyebrow">New estimate</p>
                    <h1>Create a quote</h1>
                    <p>
                        Enter the customer, cover and payment details to
                        calculate a health insurance premium estimate.
                    </p>
                </div>
            </section>

            <QuoteForm
                onSubmit={handleCreateQuote}
                submitLabel="Calculate and save quote"
                isSubmitting={isSubmitting}
                serverErrors={serverErrors}
            />
        </>
    );
}

export default CreateQuotePage;