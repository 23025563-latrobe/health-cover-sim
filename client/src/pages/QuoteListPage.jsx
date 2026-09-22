import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getQuotes } from '../services/quoteApi';

const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
});

function QuoteListPage() {
    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadQuotes() {
            try {
                const data = await getQuotes();
                setQuotes(data.quotes);
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadQuotes();
    }, []);

    if (isLoading) {
        return (
            <section className="status-panel">
                <p>Loading quotes...</p>
            </section>
        );
    }

    return (
        <>
            <section className="page-heading">
                <div>
                    <p className="eyebrow">Quote management</p>
                    <h1>Health insurance quotes</h1>
                    <p>
                        Create and manage clear premium estimates for Single,
                        Couple and Family cover.
                    </p>
                </div>

                <Link className="button button-primary" to="/quotes/new">
                    Create new quote
                </Link>
            </section>

            {error && (
                <div className="alert alert-error" role="alert">
                    <strong>Quotes could not be loaded.</strong>
                    <span>{error}</span>
                </div>
            )}

            {!error && quotes.length === 0 && (
                <section className="empty-state">
                    <div className="empty-state-icon">+</div>
                    <h2>No quotes yet</h2>
                    <p>
                        Create your first quote to calculate monthly and yearly
                        premium estimates.
                    </p>

                    <Link className="button button-primary" to="/quotes/new">
                        Create first quote
                    </Link>
                </section>
            )}

            {!error && quotes.length > 0 && (
                <section className="quote-grid" aria-label="Saved quotes">
                    {quotes.map((quote) => (
                        <article className="quote-card" key={quote.id}>
                            <div className="quote-card-header">
                                <div>
                                    <span className="quote-number">
                                        Quote #{quote.id}
                                    </span>
                                    <h2>{quote.customer_name}</h2>
                                </div>

                                <span className="cover-badge">
                                    {quote.cover_type}
                                </span>
                            </div>

                            <dl className="quote-summary">
                                <div>
                                    <dt>Hospital</dt>
                                    <dd>{quote.hospital_cover}</dd>
                                </div>

                                <div>
                                    <dt>Extras</dt>
                                    <dd>{quote.extras_cover}</dd>
                                </div>

                                <div>
                                    <dt>Monthly estimate</dt>
                                    <dd>
                                        {currencyFormatter.format(
                                            quote.calculation.monthly_premium
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        {quote.payment_frequency === 'Yearly'
                                            ? 'Discounted yearly estimate'
                                            : 'Yearly estimate'}
                                    </dt>
                                    <dd>
                                        {currencyFormatter.format(
                                            quote.calculation
                                                .yearly_after_discount
                                        )}
                                    </dd>
                                </div>
                            </dl>

                            <Link
                                className="text-link"
                                to={`/quotes/${quote.id}`}
                            >
                                View explanation
                            </Link>
                        </article>
                    ))}
                </section>
            )}
        </>
    );
}

export default QuoteListPage;