const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email function
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.to}`);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    // Don't throw error - just log it
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">🚀 Welcome to Service Booking!</h1>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for joining our platform! You can now:</p>
      <ul>
        <li>Browse and book services from trusted providers</li>
        <li>Manage your bookings</li>
        <li>Rate and review services</li>
      </ul>
      <p>Click the button below to get started:</p>
      <a href="http://localhost:5173/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        Go to Dashboard
      </a>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        If you didn't create this account, please ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: '🚀 Welcome to Service Booking!',
    html
  });
};

// Send booking notification to provider
const sendBookingNotification = async (booking, provider, customer) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">📋 New Booking Request!</h1>
      <p>Hi <strong>${provider.name}</strong>,</p>
      <p>You have a new booking request from <strong>${customer.name}</strong>!</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Service:</strong> ${booking.serviceId?.title || 'Service'}</p>
        <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        <p><strong>Price:</strong> $${booking.totalAmount}</p>
        ${booking.customerNotes ? `<p><strong>Notes:</strong> ${booking.customerNotes}</p>` : ''}
      </div>
      <p>Please log in to accept or decline this booking:</p>
      <a href="http://localhost:5173/provider/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        View Booking
      </a>
    </div>
  `;

  await sendEmail({
    to: provider.email,
    subject: '📋 New Booking Request',
    html
  });
};

// Send booking confirmation to customer
const sendBookingConfirmation = async (booking, customer, provider) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #22c55e;">✅ Booking Confirmed!</h1>
      <p>Hi <strong>${customer.name}</strong>,</p>
      <p>Great news! <strong>${provider.name}</strong> has confirmed your booking!</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Service:</strong> ${booking.serviceId?.title || 'Service'}</p>
        <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        <p><strong>Price:</strong> $${booking.totalAmount}</p>
      </div>
      <p>You can view your booking details here:</p>
      <a href="http://localhost:5173/bookings/${booking._id}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        View Booking
      </a>
    </div>
  `;

  await sendEmail({
    to: customer.email,
    subject: '✅ Booking Confirmed!',
    html
  });
};

// Send booking completed notification
const sendBookingCompleted = async (booking, customer, provider) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">✅ Service Completed!</h1>
      <p>Hi <strong>${customer.name}</strong>,</p>
      <p>Your service with <strong>${provider.name}</strong> has been completed!</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Service:</strong> ${booking.serviceId?.title || 'Service'}</p>
        <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
      </div>
      <p>Please log in to confirm completion and leave a review:</p>
      <a href="http://localhost:5173/bookings/${booking._id}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        Rate & Review
      </a>
    </div>
  `;

  await sendEmail({
    to: customer.email,
    subject: '✅ Service Completed!',
    html
  });
};

// Send booking cancellation notification
const sendBookingCancelled = async (booking, customer, provider, cancelledBy) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ef4444;">❌ Booking Cancelled</h1>
      <p>Hi ${customer.name},</p>
      <p>Your booking with <strong>${provider.name}</strong> has been <strong>cancelled</strong>.</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Service:</strong> ${booking.serviceId?.title || 'Service'}</p>
        <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
        ${booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : ''}
      </div>
      <p>If this was a mistake, please contact support.</p>
    </div>
  `;

  await sendEmail({
    to: customer.email,
    subject: '❌ Booking Cancelled',
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendBookingNotification,
  sendBookingConfirmation,
  sendBookingCompleted,
  sendBookingCancelled
};