import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { getQuotes } from '../services/quoteApi';

const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
});

function QuoteListPage() {
    const location = useLocation();

    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [coverFilter, setCoverFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        let isActive = true;

        async function loadQuotes() {
            try {
                const data = await getQuotes();

                if (isActive) {
                    setQuotes(data.quotes);
                }
            } catch (requestError) {
                if (isActive) {
                    setError(requestError.message);
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadQuotes();

        return () => {
            isActive = false;
        };
    }, []);

    const statistics = useMemo(() => {
        const totalMonthlyPremium = quotes.reduce(
            (total, quote) =>
                total + quote.calculation.monthly_premium,
            0
        );

        const totalYearlyPremium = quotes.reduce(
            (total, quote) =>
                total + quote.calculation.yearly_after_discount,
            0
        );

        return {
            totalQuotes: quotes.length,
            totalMonthlyPremium,
            totalYearlyPremium,
            averageMonthlyPremium: quotes.length > 0
                ? totalMonthlyPremium / quotes.length
                : 0
        };
    }, [quotes]);

    const filteredQuotes = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const results = quotes.filter((quote) => {
            const matchesSearch = quote.customer_name
                .toLowerCase()
                .includes(normalizedSearch);

            const matchesCover =
                coverFilter === 'All' ||
                quote.cover_type === coverFilter;

            return matchesSearch && matchesCover;
        });

        results.sort((first, second) => {
            switch (sortOrder) {
                case 'oldest':
                    return first.id - second.id;

                case 'name-asc':
                    return first.customer_name.localeCompare(
                        second.customer_name
                    );

                case 'name-desc':
                    return second.customer_name.localeCompare(
                        first.customer_name
                    );

                case 'premium-low':
                    return first.calculation.monthly_premium -
                        second.calculation.monthly_premium;

                case 'premium-high':
                    return second.calculation.monthly_premium -
                        first.calculation.monthly_premium;

                case 'newest':
                default:
                    return second.id - first.id;
            }
        });

        return results;
    }, [quotes, searchTerm, coverFilter, sortOrder]);

    const hasActiveFilters =
        searchTerm.trim() !== '' ||
        coverFilter !== 'All' ||
        sortOrder !== 'newest';

    function resetFilters() {
        setSearchTerm('');
        setCoverFilter('All');
        setSortOrder('newest');
    }

    if (isLoading) {
        return (
            <section className="status-panel" aria-live="polite">
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
                        Create, explore and manage premium estimates
                        for Single, Couple and Family cover.
                    </p>
                </div>

                <Link
                    className="button button-primary"
                    to="/quotes/new"
                >
                    Create new quote
                </Link>
            </section>

            {location.state?.successMessage && (
                <div
                    className="alert alert-success"
                    role="status"
                >
                    <strong>
                        {location.state.successMessage}
                    </strong>
                </div>
            )}

            {error && (
                <div className="alert alert-error" role="alert">
                    <strong>Quotes could not be loaded.</strong>
                    <span>{error}</span>
                </div>
            )}

            {!error && quotes.length === 0 && (
                <section className="empty-state">
                    <div
                        className="empty-state-icon"
                        aria-hidden="true"
                    >
                        +
                    </div>

                    <h2>No quotes yet</h2>

                    <p>
                        Create your first quote to calculate monthly
                        and yearly premium estimates.
                    </p>

                    <Link
                        className="button button-primary"
                        to="/quotes/new"
                    >
                        Create first quote
                    </Link>
                </section>
            )}

            {!error && quotes.length > 0 && (
                <>
                    <section
                        className="dashboard-stats"
                        aria-label="Quote statistics"
                    >
                        <article className="stat-card">
                            <span>Total saved quotes</span>
                            <strong>
                                {statistics.totalQuotes}
                            </strong>
                            <small>Quotes in the database</small>
                        </article>

                        <article className="stat-card">
                            <span>Combined monthly premiums</span>
                            <strong>
                                {currencyFormatter.format(
                                    statistics.totalMonthlyPremium
                                )}
                            </strong>
                            <small>Across all saved quotes</small>
                        </article>

                        <article className="stat-card">
                            <span>Average monthly premium</span>
                            <strong>
                                {currencyFormatter.format(
                                    statistics.averageMonthlyPremium
                                )}
                            </strong>
                            <small>Per saved quote</small>
                        </article>

                        <article className="stat-card">
                            <span>Combined yearly estimates</span>
                            <strong>
                                {currencyFormatter.format(
                                    statistics.totalYearlyPremium
                                )}
                            </strong>
                            <small>Including applicable discounts</small>
                        </article>
                    </section>

                    <section
                        className="quote-toolbar"
                        aria-label="Search and filter quotes"
                    >
                        <div className="toolbar-field toolbar-search">
                            <label htmlFor="quote-search">
                                Search customer
                            </label>

                            <input
                                id="quote-search"
                                type="search"
                                placeholder="Search by customer name..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />
                        </div>

                        <div className="toolbar-field">
                            <label htmlFor="cover-filter">
                                Cover type
                            </label>

                            <select
                                id="cover-filter"
                                value={coverFilter}
                                onChange={(event) =>
                                    setCoverFilter(event.target.value)
                                }
                            >
                                <option value="All">
                                    All cover types
                                </option>
                                <option value="Single">Single</option>
                                <option value="Couple">Couple</option>
                                <option value="Family">Family</option>
                            </select>
                        </div>

                        <div className="toolbar-field">
                            <label htmlFor="quote-sort">
                                Sort by
                            </label>

                            <select
                                id="quote-sort"
                                value={sortOrder}
                                onChange={(event) =>
                                    setSortOrder(event.target.value)
                                }
                            >
                                <option value="newest">
                                    Newest first
                                </option>
                                <option value="oldest">
                                    Oldest first
                                </option>
                                <option value="name-asc">
                                    Customer name A–Z
                                </option>
                                <option value="name-desc">
                                    Customer name Z–A
                                </option>
                                <option value="premium-low">
                                    Monthly premium: low to high
                                </option>
                                <option value="premium-high">
                                    Monthly premium: high to low
                                </option>
                            </select>
                        </div>
                    </section>

                    <div className="results-heading">
                        <p role="status">
                            Showing <strong>{filteredQuotes.length}</strong>{' '}
                            of <strong>{quotes.length}</strong> quotes
                        </p>

                        {hasActiveFilters && (
                            <button
                                className="button button-secondary"
                                type="button"
                                onClick={resetFilters}
                            >
                                Reset filters
                            </button>
                        )}
                    </div>

                    {filteredQuotes.length === 0 ? (
                        <section className="empty-state">
                            <h2>No matching quotes</h2>

                            <p>
                                Try another customer name or change
                                the selected cover type.
                            </p>

                            <button
                                className="button button-secondary"
                                type="button"
                                onClick={resetFilters}
                            >
                                Clear filters
                            </button>
                        </section>
                    ) : (
                        <section
                            className="quote-grid"
                            aria-label="Saved quotes"
                        >
                            {filteredQuotes.map((quote) => (
                                <article
                                    className="quote-card"
                                    key={quote.id}
                                >
                                    <div className="quote-card-header">
                                        <div>
                                            <span className="quote-number">
                                                Quote #{quote.id}
                                            </span>

                                            <h2>
                                                {quote.customer_name}
                                            </h2>
                                        </div>

                                        <span className="cover-badge">
                                            {quote.cover_type}
                                        </span>
                                    </div>

                                    <dl className="quote-summary">
                                        <div>
                                            <dt>Hospital</dt>
                                            <dd>
                                                {quote.hospital_cover}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>Extras</dt>
                                            <dd>
                                                {quote.extras_cover}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>Monthly estimate</dt>
                                            <dd>
                                                {currencyFormatter.format(
                                                    quote.calculation
                                                        .monthly_premium
                                                )}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                {quote.payment_frequency ===
                                                'Yearly'
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
                                        aria-label={`View quote ${quote.id} for ${quote.customer_name}`}
                                    >
                                        View explanation
                                    </Link>
                                </article>
                            ))}
                        </section>
                    )}
                </>
            )}
        </>
    );
}

export default QuoteListPage;
