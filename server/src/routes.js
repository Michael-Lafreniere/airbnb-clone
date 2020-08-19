const express = require('express');
const monk = require('monk');
const Joi = require('@hapi/joi');
const rateLimit = require('express-rate-limit');

// Configure and set rate limits:
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to x requests per windowMS
});

// Connect to the DB and get our collection:
const db = monk(process.env.MONGO_URI);
const rentalCollection = db.get('rental-data');

// Required information to add/update any entries in the DB:
const schema = Joi.object({
  id: Joi.string().trim().required(),
  listing_url: Joi.string().uri().required(),
  name: Joi.string().trim().required(),
  summary: Joi.string().trim().required(),
  space: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  //experiences_offered: Joi.string().trim().required(),
  neighborhood_overview: Joi.string().trim(),
  notes: Joi.string().trim(),
  transit: Joi.string().trim(),
  access: Joi.string().trim(),
  interaction: Joi.string().trim(),
  house_rules: Joi.string().trim(),
  thumbnail_url: Joi.string(),
  medium_url: Joi.string(),
  picture_url: Joi.string().required(),
  xl_picture: Joi.string(),
  host_url: Joi.string().trim().uri(),
  host_name: Joi.string().trim().required(),
  host_location: Joi.string().trim().required(),
});

const router = express.Router();

// Cache data/time/delay:
let cachedData;
let cachedTime;
const cachedDelay = 60 * 1000; // 1 minute

// Allows up to 10 results (0-9 by default) or a specified range which can be greater than 10:
router.get('/:start,:end', limiter, async (req, res, next) => {
  let { start, end } = req.params;
  // See if we have cached data or if the timer is still valid:
  if (cachedTime && cachedTime > Date.now() - cachedDelay) {
    return res.json(cachedData);
  }

  try {
    cachedData = await rentalCollection.find();
    start = start ? start : 0;
    end = end ? end : 10;
    console.log('start:', start, ', end:', end);
    cachedData = cachedData.slice(start, end);

    cachedTime = Date.now();
    return res.json(cachedData);
  } catch (err) {
    return next(err);
  }
});

// Get one item:
router.get('/:id', limiter, async (req, res, next) => {
  try {
    const { id } = req.params;
    const rental = await rentalCollection.findOne({ _id: id });
    if (!rental) return next();
    return res.json(rental);
  } catch (error) {
    return next(error);
  }
});

// Create a new item:
router.post('/', limiter, async (req, res, next) => {
  try {
    // Validate the data passed in:
    const value = await schema.validateAsync(req.body);
    // Create the new entry:
    const inserted = await rentalCollection.insert(value);
    return res.json(inserted);
  } catch (error) {
    return next(error);
  }
});

// Update an item:
router.put('/:id', limiter, async (req, res, next) => {
  try {
    // Early out, if it does not exist, we cannot update it:
    const { id } = req.params;
    const rental = await rentalCollection.findOne({ _id: id });
    if (!rental) return next();
    // Validate the data:
    const value = await schema.validateAsync(req.body);
    // Finally update:
    await rentalCollection.update({ _id: id }, { $set: value });
    return res.json(value);
  } catch (error) {
    return next(error);
  }
});

// Delete an item:
router.delete('/:id', limiter, async (req, res, next) => {
  try {
    const { id } = req.params;
    await rentalCollection.remove({ _id: id });
    return res.json({ message: 'Success' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
