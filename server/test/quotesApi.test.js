const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';

const app = require('../src/app');
const database = require('../src/db/database');

function validFamilyQuote() {
    return {
        customer_name: 'Jordan Lee',
        cover_type: 'Family',
        applicant1_age: 40,
        applicant1_cover_history: 'No',
        applicant2_age: 35,
        applicant2_cover_history: 'Yes',
        hospital_cover: 'Silver',
        extras_cover: 'Standard',
        payment_frequency: 'Yearly',
        annual_discount: 5,
        notes: 'Assignment worked example'
    };
}

test.beforeEach(() => {
    database.prepare('DELETE FROM quotes').run();
});

test.after(() => {
    database.close();
});

test('performs the complete quote CRUD lifecycle', async () => {
    const createResponse = await request(app)
        .post('/api/quotes')
        .send(validFamilyQuote());

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.quote.customer_name, 'Jordan Lee');
    assert.equal(
        createResponse.body.quote.calculation.monthly_premium,
        472
    );
    assert.equal(
        createResponse.body.quote.calculation.yearly_before_discount,
        5664
    );
    assert.equal(
        createResponse.body.quote.calculation.yearly_after_discount,
        5380.8
    );

    const quoteId = createResponse.body.quote.id;

    const listResponse = await request(app).get('/api/quotes');

    assert.equal(listResponse.status, 200);
    assert.equal(listResponse.body.quotes.length, 1);

    const detailResponse = await request(app).get(
        `/api/quotes/${quoteId}`
    );

    assert.equal(detailResponse.status, 200);
    assert.equal(detailResponse.body.quote.id, quoteId);

    const updateResponse = await request(app)
        .put(`/api/quotes/${quoteId}`)
        .send({
            ...validFamilyQuote(),
            customer_name: 'Jordan Lee Updated',
            annual_discount: 8
        });

    assert.equal(updateResponse.status, 200);
    assert.equal(
        updateResponse.body.quote.customer_name,
        'Jordan Lee Updated'
    );
    assert.equal(
        updateResponse.body.quote.calculation
            .annual_discount_percentage,
        8
    );

    const deleteResponse = await request(app).delete(
        `/api/quotes/${quoteId}`
    );

    assert.equal(deleteResponse.status, 200);

    const missingResponse = await request(app).get(
        `/api/quotes/${quoteId}`
    );

    assert.equal(missingResponse.status, 404);
});

test('rejects Couple cover when Applicant 2 is missing', async () => {
    const response = await request(app)
        .post('/api/quotes')
        .send({
            ...validFamilyQuote(),
            cover_type: 'Couple',
            applicant2_age: null,
            applicant2_cover_history: null
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'Validation failed.');
    assert.ok(
        response.body.details.includes(
            'Applicant 2 age is required.'
        )
    );
    assert.ok(
        response.body.details.includes(
            'Applicant 2 cover history is required.'
        )
    );
});

test('rejects invalid data sent directly to the API', async () => {
    const response = await request(app)
        .post('/api/quotes')
        .send({
            ...validFamilyQuote(),
            applicant1_age: -5,
            annual_discount: 20
        });

    assert.equal(response.status, 400);
    assert.ok(
        response.body.details.includes(
            'Applicant 1 age must be a whole number between 18 and 100.'
        )
    );
    assert.ok(
        response.body.details.includes(
            'Annual discount must be between 0 and 10.'
        )
    );
});

test('returns a clear error for an invalid quote ID', async () => {
    const response = await request(app).get('/api/quotes/invalid');

    assert.equal(response.status, 400);
    assert.equal(
        response.body.error,
        'Quote ID must be a positive integer.'
    );
});


test('returns an empty list when no quotes exist', async () => {
    const response = await request(app).get('/api/quotes');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body.quotes, []);
});

test('rejects an update containing invalid applicant data', async () => {
    const created = await request(app)
        .post('/api/quotes')
        .send(validFamilyQuote());

    assert.equal(created.status, 201);

    const quoteId = created.body.quote.id;

    const response = await request(app)
        .put(`/api/quotes/${quoteId}`)
        .send({
            ...validFamilyQuote(),
            applicant1_age: 101
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'Validation failed.');

    const unchanged = await request(app).get(
        `/api/quotes/${quoteId}`
    );

    assert.equal(unchanged.status, 200);
    assert.equal(unchanged.body.quote.applicant1_age, 40);
});

test('returns 404 when deleting a quote that does not exist', async () => {
    const response = await request(app)
        .delete('/api/quotes/999999');

    assert.equal(response.status, 404);
});

test('returns 404 when updating a quote that does not exist', async () => {
    const response = await request(app)
        .put('/api/quotes/999999')
        .send(validFamilyQuote());

    assert.equal(response.status, 404);
});
