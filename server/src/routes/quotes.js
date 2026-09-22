const express = require('express');

const database = require('../db/database');
const { calculateQuote } = require('../services/quoteCalculator');
const {
    validateQuoteInput
} = require('../validation/quoteValidation');

const router = express.Router();

const quoteFields = `
    id,
    customer_name,
    cover_type,
    applicant1_age,
    applicant1_cover_history,
    applicant2_age,
    applicant2_cover_history,
    hospital_cover,
    extras_cover,
    payment_frequency,
    annual_discount,
    notes,
    created_at,
    updated_at
`;

function parseQuoteId(value) {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

function findQuoteById(id) {
    return database
        .prepare(`SELECT ${quoteFields} FROM quotes WHERE id = ?`)
        .get(id);
}

function buildQuoteResponse(quote) {
    return {
        ...quote,
        calculation: calculateQuote(quote)
    };
}

router.get('/', (request, response, next) => {
    try {
        const quotes = database
            .prepare(
                `SELECT ${quoteFields}
                 FROM quotes
                 ORDER BY created_at DESC, id DESC`
            )
            .all();

        response.status(200).json({
            quotes: quotes.map(buildQuoteResponse)
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', (request, response, next) => {
    try {
        const id = parseQuoteId(request.params.id);

        if (id === null) {
            return response.status(400).json({
                error: 'Quote ID must be a positive integer.'
            });
        }

        const quote = findQuoteById(id);

        if (!quote) {
            return response.status(404).json({
                error: 'Quote not found.'
            });
        }

        return response.status(200).json({
            quote: buildQuoteResponse(quote)
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/', (request, response, next) => {
    try {
        const { errors, value } = validateQuoteInput(request.body);

        if (errors.length > 0) {
            return response.status(400).json({
                error: 'Validation failed.',
                details: errors
            });
        }

        const statement = database.prepare(`
            INSERT INTO quotes (
                customer_name,
                cover_type,
                applicant1_age,
                applicant1_cover_history,
                applicant2_age,
                applicant2_cover_history,
                hospital_cover,
                extras_cover,
                payment_frequency,
                annual_discount,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = statement.run(
            value.customer_name,
            value.cover_type,
            value.applicant1_age,
            value.applicant1_cover_history,
            value.applicant2_age,
            value.applicant2_cover_history,
            value.hospital_cover,
            value.extras_cover,
            value.payment_frequency,
            value.annual_discount,
            value.notes || null
        );

        const createdQuote = findQuoteById(result.lastInsertRowid);

        return response.status(201).json({
            message: 'Quote created successfully.',
            quote: buildQuoteResponse(createdQuote)
        });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', (request, response, next) => {
    try {
        const id = parseQuoteId(request.params.id);

        if (id === null) {
            return response.status(400).json({
                error: 'Quote ID must be a positive integer.'
            });
        }

        if (!findQuoteById(id)) {
            return response.status(404).json({
                error: 'Quote not found.'
            });
        }

        const { errors, value } = validateQuoteInput(request.body);

        if (errors.length > 0) {
            return response.status(400).json({
                error: 'Validation failed.',
                details: errors
            });
        }

        database.prepare(`
            UPDATE quotes
            SET
                customer_name = ?,
                cover_type = ?,
                applicant1_age = ?,
                applicant1_cover_history = ?,
                applicant2_age = ?,
                applicant2_cover_history = ?,
                hospital_cover = ?,
                extras_cover = ?,
                payment_frequency = ?,
                annual_discount = ?,
                notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            value.customer_name,
            value.cover_type,
            value.applicant1_age,
            value.applicant1_cover_history,
            value.applicant2_age,
            value.applicant2_cover_history,
            value.hospital_cover,
            value.extras_cover,
            value.payment_frequency,
            value.annual_discount,
            value.notes || null,
            id
        );

        const updatedQuote = findQuoteById(id);

        return response.status(200).json({
            message: 'Quote updated successfully.',
            quote: buildQuoteResponse(updatedQuote)
        });
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', (request, response, next) => {
    try {
        const id = parseQuoteId(request.params.id);

        if (id === null) {
            return response.status(400).json({
                error: 'Quote ID must be a positive integer.'
            });
        }

        const result = database
            .prepare('DELETE FROM quotes WHERE id = ?')
            .run(id);

        if (result.changes === 0) {
            return response.status(404).json({
                error: 'Quote not found.'
            });
        }

        return response.status(200).json({
            message: 'Quote deleted successfully.'
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;