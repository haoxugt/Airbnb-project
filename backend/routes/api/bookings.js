const express = require('express')
const router = express.Router();

const { Op } = require('sequelize');
const { User, Booking, Spot } = require('../../db/models');
// const bcrypt = require('bcryptjs');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors, validateBookingInput} = require('../../utils/validateInput.js');
const {validateBookingId} = require('../../utils/validateId.js');
const { checkOldBooking, checkBookingConflict, checkBookingStart } = require('../../utils/othermiddlewares.js');
const { checkAuthorization } = require('../../utils/authorization.js');
const { formatDate, getBookingsInfo } = require('../../utils/subroutines.js')


// routers
// Get all bookings
router.get('/', async (req, res) => {
    const bookings = await Booking.findAll();
    return res.json(bookings);
});

// Get current user's booking
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;
    let bookings = await user.getBookings({ order: [['id']]});
    bookings = await getBookingsInfo(bookings);

    return res.json({ Bookings: bookings });
});

// Edit a Booking
router.put('/:bookingId', requireAuth, validateBookingId,
    checkAuthorization, checkOldBooking, validateBookingInput, checkBookingConflict,
    async (req, res) => {
        const { startDate, endDate } = req.body;
        const bookingId = parseInt(req.params.bookingId);
        const bookingToEdit = await Booking.findByPk(bookingId);
        bookingToEdit.startDate = startDate;
        bookingToEdit.endDate = endDate;
        await bookingToEdit.save();
        let bookingResponse = bookingToEdit.toJSON();
        bookingResponse = formatDate(bookingResponse);
        return res.json(bookingResponse);
    });


// Delete a Booking
router.delete('/:bookingId', requireAuth, validateBookingId,
    checkAuthorization, checkBookingStart,
    async (req, res) => {
        const booking = await Booking.findByPk(req.params.bookingId);
        await booking.destroy();
        return res.json({
            "message": "Successfully deleted"
        });
    })

module.exports = router;
