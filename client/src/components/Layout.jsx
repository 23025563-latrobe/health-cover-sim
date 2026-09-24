import { NavLink, Outlet } from 'react-router-dom';

function Layout() {
    return (
        <div className="app-shell">
            <a className="skip-link" href="#main-content">
                Skip to main content
            </a>
            <header className="site-header">
                <div className="container header-content">
                    <NavLink className="brand" to="/">
                        <span className="brand-mark">H</span>

                        <span>
                            <strong>HealthCoverSim</strong>
                            <small>Private health insurance simulator</small>
                        </span>
                    </NavLink>

                    <nav className="main-navigation" aria-label="Main navigation">
                        <NavLink
                            to="/"
                            end
                            className={({isActive}) =>
                                isActive ? 'nav-link active' : 'nav-link'
                            }
                        >
                            Quotes
                        </NavLink>

                        <NavLink
                            to="/quotes/new"
                            className={({isActive}) =>
                                isActive ? 'nav-link active' : 'nav-link'
                            }
                        >
                            Create quote
                        </NavLink>
                    </nav>
                </div>
            </header>

            <main
                id="main-content"
                className="container main-content"
                tabIndex="-1"
            >
                <Outlet/>
            </main>

            <footer className="site-footer">
                <div className="container">
                    <p>
                        HealthCoverSim is a learning simulator only. It is not
                        financial advice.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Layout;