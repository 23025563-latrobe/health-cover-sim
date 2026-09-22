import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <section className="empty-state">
            <h1>Page not found</h1>
            <p>The page you requested does not exist.</p>

            <Link className="button button-primary" to="/">
                Return to quotes
            </Link>
        </section>
    );
}

export default NotFoundPage;