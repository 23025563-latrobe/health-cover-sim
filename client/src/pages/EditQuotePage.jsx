import { useEffect, useState } from 'react';
import {
    Link,
    useNavigate,
    useParams
} from 'react-router-dom';

import QuoteForm from '../components/QuoteForm';
import {
    getQuote,
    updateQuote
} from '../services/quoteApi';

function EditQuotePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quote, setQuote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [serverErrors, setServerErrors] = useState([]);

    useEffect(() => {
        async function loadQuote() {
            try {
                const response = await getQuote(id);
                setQuote(response.quote);
            } catch (error) {
                setLoadError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadQuote();
    }, [id]);

    async function handleUpdateQuote(quoteData) {
        setIsSubmitting(true);
        setServerErrors([]);

        try {
            const response = await updateQuote(id, quoteData);

            if (!response.quote?.id) {
                throw new Error('The server did not return the updated quote. Please refresh and check the saved record.');
            }

            navigate(`/quotes/${response.quote.id}`, {
                state: {
                    successMessage: 'Quote updated successfully.'
                }
            });
        } catch (error) {
            setServerErrors(
                Array.isArray(error.details) && error.details.length > 0
                    ? error.details.map((detail) => typeof detail === 'string' ? detail : detail.message || JSON.stringify(detail))
                    : [error.message || 'Unable to update the quote. Please try again.']
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <section className="status-panel">
                <p>Loading quote...</p>
            </section>
        );
    }

    if (loadError || !quote) {
        return (
            <section className="empty-state">
                <h1>Quote could not be loaded</h1>
                <p>
                    {loadError ||
                        'The requested quote does not exist.'}
                </p>

                <Link className="button button-primary" to="/">
                    Return to quotes
                </Link>
            </section>
        );
    }

    return (
        <>
            <div className="breadcrumb">
                <Link to="/">Quotes</Link>
                <span>/</span>

                <Link to={`/quotes/${quote.id}`}>
                    Quote #{quote.id}
                </Link>

                <span>/</span>
                <span>Edit</span>
            </div>

            <section className="page-heading">
                <div>
                    <p className="eyebrow">
                        Update estimate
                    </p>

                    <h1>Edit quote</h1>

                    <p>
                        Update the customer, cover or payment details.
                        The premium will be recalculated automatically
                        when the quote is saved.
                    </p>
                </div>

                <Link
                    className="button button-secondary"
                    to={`/quotes/${quote.id}`}
                >
                    Cancel editing
                </Link>
            </section>

            <QuoteForm
                key={quote.id}
                initialValues={quote}
                onSubmit={handleUpdateQuote}
                submitLabel="Save updated quote"
                isSubmitting={isSubmitting}
                serverErrors={serverErrors}
            />
        </>
    );
}

export default EditQuotePage;