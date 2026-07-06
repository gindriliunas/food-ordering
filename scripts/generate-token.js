#!/usr/bin/env node
/**
 * Generate a JWT for local testing / smoke tests.
 * Usage: JWT_SECRET=your-secret node scripts/generate-token.js kitchen-123
 */
const jwt = require('jsonwebtoken');

const kitchenId = process.argv[2] || 'demo-kitchen';
const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const token = jwt.sign({ sub: kitchenId, kitchenId }, secret, { expiresIn: '24h' });
console.log(token);
