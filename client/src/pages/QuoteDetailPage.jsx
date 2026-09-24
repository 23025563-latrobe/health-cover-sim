import { useEffect, useState } from 'react';
import {
    Link,
    useLocation,
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    deleteQuote,
    getQuote
} from '../services/quoteApi';

const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
});

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short'
});

function formatDate(value) {
    if (!value) {
        return 'Not available';
    }

    const parsedDate = new Date(
        value.includes('T') ? value : `${value.replace(' ', 'T')}Z`
    );

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return dateFormatter.format(parsedDate);
}

function QuoteDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [quote, setQuote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function loadQuote() {
            try {
                const data = await getQuote(id);
                setQuote(data.quote);
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadQuote();
    }, [id]);

    async function handleDelete() {
        const confirmed = window.confirm(
            `Delete the quote for ${quote.customer_name}? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            await deleteQuote(id);
            navigate('/');
        } catch (requestError) {
            setError(requestError.message);
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <section className="status-panel">
                <p>Loading quote details...</p>
            </section>
        );
    }

    if (error && !quote) {
        return (
            <section className="empty-state">
                <h1>Quote could not be loaded</h1>
                <p>{error}</p>

                <Link className="button button-primary" to="/">
                    Return to quotes
                </Link>
            </section>
        );
    }

    const { calculation } = quote;

    return (
        <>
            <div className="breadcrumb">
                <Link to="/">Quotes</Link>
                <span>/</span>
                <span>Quote #{quote.id}</span>
            </div>

            {location.state?.successMessage && (
                <div className="alert alert-success" role="status">
                    <strong>{location.state.successMessage}</strong>
                </div>
            )}

            {error && (
                <div className="alert alert-error" role="alert">
                    <strong>The request could not be completed.</strong>
                    <span>{error}</span>
                </div>
            )}

            <section className="page-heading detail-heading">
                <div>
                    <p className="eyebrow">Quote #{quote.id}</p>
                    <h1>{quote.customer_name}</h1>
                    <p>
                        {quote.cover_type} cover with{' '}
                        {quote.hospital_cover} hospital and{' '}
                        {quote.extras_cover} extras.
                    </p>
                </div>

                <div className="heading-actions">
                    <Link
                        className="button button-secondary"
                        to={`/quotes/${quote.id}/edit`}
                    >
                        Edit quote
                    </Link>

                    <button
                        className="button button-danger"
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete quote'}
                    </button>
                </div>
            </section>

            {calculation.warnings.length > 0 && (
                <section
                    className="alert alert-warning"
                    aria-labelledby="warning-heading"
                >
                    <strong id="warning-heading">
                        Important quote warning
                    </strong>

                    <ul>
                        {calculation.warnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                        ))}
                    </ul>
                </section>
            )}

            <section className="premium-hero">
                <div>
                    <p>Monthly premium estimate</p>
                    <strong>
                        {currencyFormatter.format(
                            calculation.monthly_premium
                        )}
                    </strong>
                    <span>per month</span>
                </div>

                <div>
                    <p>
                        {quote.payment_frequency === 'Yearly'
                            ? 'Discounted yearly total'
                            : 'Yearly equivalent'}
                    </p>
                    <strong>
                        {currencyFormatter.format(
                            calculation.yearly_after_discount
                        )}
                    </strong>
                    <span>
                        {calculation.annual_discount_percentage > 0
                            ? `${calculation.annual_discount_percentage}% annual discount applied`
                            : 'No annual discount applied'}
                    </span>
                </div>
            </section>

            <div className="detail-grid">
                <section className="detail-card">
                    <div className="detail-card-heading">
                        <div>
                            <p className="eyebrow">Calculation</p>
                            <h2>Premium breakdown</h2>
                        </div>
                    </div>

                    <dl className="breakdown-list">
                        <div>
                            <dt>Hospital cover total</dt>
                            <dd>
                                {currencyFormatter.format(
                                    calculation.hospital_total
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt>Extras cover total</dt>
                            <dd>
                                {currencyFormatter.format(
                                    calculation.extras_total
                                )}
                            </dd>
                        </div>

                        {calculation.family_upgrade_fee > 0 && (
                            <div>
                                <dt>Family upgrade fee</dt>
                                <dd>
                                    {currencyFormatter.format(
                                        calculation.family_upgrade_fee
                                    )}
                                </dd>
                            </div>
                        )}

                        <div className="breakdown-total">
                            <dt>Monthly premium</dt>
                            <dd>
                                {currencyFormatter.format(
                                    calculation.monthly_premium
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt>Yearly total before discount</dt>
                            <dd>
                                {currencyFormatter.format(
                                    calculation.yearly_before_discount
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt>Annual discount</dt>
                            <dd>
                                {
                                    calculation
                                        .annual_discount_percentage
                                }
                                %
                            </dd>
                        </div>

                        <div className="breakdown-final">
                            <dt>Yearly total after discount</dt>
                            <dd>
                                {currencyFormatter.format(
                                    calculation.yearly_after_discount
                                )}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="detail-card">
                    <div className="detail-card-heading">
                        <div>
                            <p className="eyebrow">Selection</p>
                            <h2>Quote information</h2>
                        </div>
                    </div>

                    <dl className="information-list">
                        <div>
                            <dt>Cover type</dt>
                            <dd>{quote.cover_type}</dd>
                        </div>

                        <div>
                            <dt>Hospital cover</dt>
                            <dd>{quote.hospital_cover}</dd>
                        </div>

                        <div>
                            <dt>Extras cover</dt>
                            <dd>{quote.extras_cover}</dd>
                        </div>

                        <div>
                            <dt>Payment frequency</dt>
                            <dd>{quote.payment_frequency}</dd>
                        </div>

                        <div>
                            <dt>Created</dt>
                            <dd>{formatDate(quote.created_at)}</dd>
                        </div>

                        <div>
                            <dt>Last updated</dt>
                            <dd>{formatDate(quote.updated_at)}</dd>
                        </div>
                    </dl>
                </section>
            </div>

            <section className="detail-card applicant-details-card">
                <div className="detail-card-heading">
                    <div>
                        <p className="eyebrow">Applicants</p>
                        <h2>LHC calculation by applicant</h2>
                        <p>
                            Hospital premiums and applicable Lifetime
                            Health Cover loading are calculated separately
                            for each adult.
                        </p>
                    </div>
                </div>

                <div className="applicant-table-wrapper">
                    <table className="applicant-table">
                        <thead>
                        <tr>
                            <th>Applicant</th>
                            <th>Age</th>
                            <th>Previous cover</th>
                            <th>LHC loading</th>
                            <th>Hospital cost</th>
                        </tr>
                        </thead>

                        <tbody>
                        {calculation.applicants.map((applicant) => (
                            <tr key={applicant.applicant_number}>
                                <td>
                                    Applicant{' '}
                                    {applicant.applicant_number}
                                </td>
                                <td>{applicant.age}</td>
                                <td>{applicant.cover_history}</td>
                                <td>
                                    {
                                        applicant
                                            .lhc_loading_percentage
                                    }
                                    %
                                </td>
                                <td>
                                    {currencyFormatter.format(
                                        applicant.hospital_cost
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="lhc-statement">
                    <strong>LHC explanation</strong>
                    <p>{calculation.lhc_statement}</p>
                </div>
            </section>

            <section className="detail-card explanation-card">
                <div className="detail-card-heading">
                    <div>
                        <p className="eyebrow">Explanation</p>
                        <h2>How this quote was calculated</h2>
                    </div>
                </div>

                <p>{calculation.explanation}</p>
            </section>

            {quote.notes && (
                <section className="detail-card">
                    <div className="detail-card-heading">
                        <div>
                            <p className="eyebrow">Additional information</p>
                            <h2>Notes</h2>
                        </div>
                    </div>

                    <p className="quote-notes">{quote.notes}</p>
                </section>
            )}
        </>
    );
}

export default QuoteDetailPage;