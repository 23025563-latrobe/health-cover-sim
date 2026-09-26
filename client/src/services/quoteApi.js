async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`/api${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            data.error || 'The request could not be completed.'
        );

        error.details = Array.isArray(data.details) ? data.details : [];
        error.status = response.status;

        throw error;
    }

    return data;
}

export function getQuotes() {
    return apiRequest('/quotes');
}

export function getQuote(id) {
    return apiRequest(`/quotes/${id}`);
}

export function createQuote(quote) {
    return apiRequest('/quotes', {
        method: 'POST',
        body: JSON.stringify(quote)
    });
}

export function updateQuote(id, quote) {
    return apiRequest(`/quotes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(quote)
    });
}

export function deleteQuote(id) {
    return apiRequest(`/quotes/${id}`, {
        method: 'DELETE'
    });
}
