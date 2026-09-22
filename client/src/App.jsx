import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import QuoteListPage from './pages/QuoteListPage';
import CreateQuotePage from './pages/CreateQuotePage';
import QuoteDetailPage from './pages/QuoteDetailPage';
import EditQuotePage from './pages/EditQuotePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<QuoteListPage />} />
          <Route path="quotes/new" element={<CreateQuotePage />} />
          <Route path="quotes/:id" element={<QuoteDetailPage />} />
          <Route path="quotes/:id/edit" element={<EditQuotePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
  );
}

export default App;