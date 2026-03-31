export const appointmentReminderTemplate = (
    memberName: string,
    clinicName: string,
    scheduledAt: string,
    phoneNumber: string,
    emailAddress: string,
    location: string,
) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smoll:Appointment Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="https://smoll.me/wp-content/uploads/2023/10/smoll-logo.png" alt="Smoll Logo" style="max-width: 200px; margin-bottom: 20px;">
        <h2 style="color: #4a4a4a;">Appointment Reminder</h2>
        <p>Dear ${memberName ?? '-'},</p>
        <p>This is a friendly reminder about your upcoming appointment at ${clinicName ?? '-'}.</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
            <p style="margin: 0; margin-bottom: 5px;"><strong>Date & Time:</strong> ${scheduledAt ?? '-'}</p>
            <p style="margin: 0; margin-bottom: 5px;"><strong>Phone:</strong> <a href="tel:${phoneNumber}">${phoneNumber ?? '-'}</a></p>
            <p style="margin: 0; margin-bottom: 5px;"><strong>Email:</strong> <a href="mailto:${emailAddress}">${emailAddress ?? '-'}</a></p>
            <p style="margin: 0;"><strong>Location:</strong> ${location ?? '-'}</p>
        </div>
        <p>Please arrive a few minutes early to complete any necessary paperwork or preparations.</p>
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>${clinicName ?? '-'} Team</p>
        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p style="margin: 0; margin-bottom: 10px;"><strong>Smoll Contact Information:</strong></p>
            <p style="margin: 0; margin-bottom: 5px;">Phone: <a href="tel:+97144510090">+971 44510090</a></p>
            <p style="margin: 0; margin-bottom: 5px;">Email: <a href="mailto:care@smoll.me">care@smoll.me</a></p>
        </div>
    </div>
</body>
</html>
`;

export const onlineConsultationReminderTemplate = (
    memberName: string,
    expertName: string,
    consultationDate: string,
    consultationTime: string,
    phoneNumber: string,
    emailAddress: string,
) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smoll:Online Consultation Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="https://smoll.me/wp-content/uploads/2023/10/smoll-logo.png" alt="Smoll Logo" style="max-width: 200px; margin-bottom: 20px;">
        <h2 style="color: #4a4a4a;">Online Video Consultation Reminder</h2>
        <p>Dear ${memberName ?? '-'},</p>
        <p>This is a friendly reminder about your upcoming online video consultation with ${expertName ?? '-'}.</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
            <p style="margin:0; margin-bottom: 5px;"><strong>Date:</strong> ${consultationDate ?? '-'}</p>
            <p style="margin:0; margin-bottom: 5px;"><strong>Time:</strong> ${consultationTime ?? '-'}</p>
            <p style="margin:0; margin-bottom: 5px;"><strong>Phone:</strong> <a href="tel:${phoneNumber}">${phoneNumber ?? '-'}</a></p>
            <p style="margin:0;"><strong>Email:</strong> <a href="mailto:${emailAddress}">${emailAddress ?? '-'}</a></p>
        </div>
        <p>Please ensure you have a stable internet connection and a device with a camera and microphone for the consultation.</p>
        <p>We recommend joining the video call a few minutes early to test your audio and video settings.</p>
        <p>We look forward to meeting you online!</p>
        <p>Best regards,<br>Smoll Team</p>
        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p style="margin: 0; margin-bottom: 10px;"><strong>Smoll Contact Information:</strong></p>
            <p style="margin: 0; margin-bottom: 5px;">Phone: <a href="tel:+97144510090">+971 44510090</a></p>
            <p style="margin: 0; margin-bottom: 5px;">Email: <a href="mailto:care@smoll.me">care@smoll.me</a></p>
        </div>
    </div>
</body>
</html>
`;

export const bookingScheduledTemplate = (
    caseId: string,
    memberName: string,
    partnerName: string,
    scheduledAt: string,
    phoneNumber: string,
    emailAddress: string,
    location: string,
    isRescheduling: boolean,
) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smoll:${isRescheduling ? 'Appointment Rescheduled' : 'Booking Confirmation'}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="https://smoll.me/wp-content/uploads/2023/10/smoll-logo.png" alt="Smoll Logo" style="max-width: 200px; margin-bottom: 20px;">
        <h2 style="color: #4a4a4a;">${isRescheduling ? 'Appointment Rescheduled' : 'Booking Confirmation'}</h2>
        <p>Dear ${memberName ?? '-'},</p>
        <p>${isRescheduling
        ? `We're writing to confirm that your appointment with <strong>${partnerName ?? '-'}</strong> has been successfully rescheduled.`
        : `We're pleased to confirm that your booking with <strong>${partnerName ?? '-'}</strong> has been successfully scheduled.`
    }</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
            <p style="margin: 0; margin-bottom: 5px;"><strong>Case ID:</strong> ${caseId ?? '-'}</p>
            <p style="margin: 0; margin-bottom: 5px;"><strong>${isRescheduling ? 'New Date and Time' : 'Scheduled Date and Time'}:</strong> ${scheduledAt ?? '-'}</p>
            <p style="margin: 0; margin-bottom: 5px;"><strong>Phone:</strong> <a href="tel:${phoneNumber}">${phoneNumber ?? '-'}</a></p>
            <p style="margin: 0; margin-bottom: 5px;"><strong>Email:</strong> <a href="mailto:${emailAddress}">${emailAddress ?? '-'}</a></p>
            <p style="margin: 0;"><strong>Location:</strong> ${location ?? '-'}</p>
        </div>
        <p>Please make sure to arrive on time for your appointment. ${isRescheduling
        ? 'If you need to make any further changes or have any questions, please contact us as soon as possible.'
        : 'If you need to reschedule or have any questions, please contact us as soon as possible.'
    }</p>
        <p>We look forward to serving you!</p>
        <p>Best regards,<br>Smoll Team</p>
        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p style="margin: 0; margin-bottom: 10px;"><strong>Smoll Contact Information:</strong></p>
            <p style="margin: 0; margin-bottom: 5px;">Phone: <a href="tel:+97144510090">+971 44510090</a></p>
            <p style="margin: 0; margin-bottom: 5px;">Email: <a href="mailto:care@smoll.me">care@smoll.me</a></p>
        </div>
    </div>
</body>
</html>
`;

export const bookingScheduledTemplateForPartner = (
    partnerName: string,
    memberName: string,
    vetName: string | undefined,
    scheduledAt: string,
    isRescheduling: boolean,
    isEmergency: boolean,
) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smoll: ${isRescheduling ? 'Appointment Rescheduled' : 'New Booking'} Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="https://smoll.me/wp-content/uploads/2023/10/smoll-logo.png" alt="Smoll Logo" style="max-width: 200px; margin-bottom: 20px;">
        <h2 style="color: #4a4a4a;">${isRescheduling ? 'Appointment Rescheduled' : 'New Booking'} Notification</h2>
        <p>Dear ${partnerName ?? '-'},</p>
        <p>${isRescheduling
        ? `We're writing to inform you that an appointment has been rescheduled with your clinic.`
        : isEmergency
            ? `We're reaching out to inform you about an urgent appointment has been scheduled with your clinic.`
            : `We're pleased to inform you that a new booking has been scheduled with your clinic.`
    }</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
            <p style="margin: 0;"><strong>Client Name:</strong> ${memberName ?? '-'}</p>
            ${vetName ? `<p style="margin: 0;"><strong>Vet Name:</strong> ${vetName ?? '-'}</p>` : ''}
            <p style="margin: 0;"><strong>${isRescheduling ? 'New Date and Time' : 'Scheduled Date and Time'}:</strong> ${scheduledAt ?? '-'}</p>
            ${isEmergency ? `<p style="margin: 0;"><strong>Emergency:</strong> Yes</p>` : ''}
        </div>
        <p>Please ensure you're prepared for this appointment. If you need to make any changes or have any questions, please contact the client as soon as possible.</p>
        <p>Thank you for your continued partnership!</p>
        <p>Best regards,<br>Smoll Team</p>
        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p style="margin: 0; margin-bottom: 10px;"><strong>Smoll Contact Information:</strong></p>
            <p style="margin: 0; margin-bottom: 5px;">Phone: <a href="tel:+97144510090">+971 44510090</a></p>
            <p style="margin: 0; margin-bottom: 5px;">Email: <a href="mailto:care@smoll.me">care@smoll.me</a></p>
        </div>
    </div>
</body>
</html>
`;

export const accountDeactivationTemplate = (memberName: string) => `  
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smoll: Account Deactivation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="https://smoll.me/wp-content/uploads/2023/10/smoll-logo.png" alt="Smoll Logo" style="max-width: 200px; margin-bottom: 20px;">
        <h2 style="color: #4a4a4a;">Account Deactivation</h2>
        <p>Dear ${memberName ?? '-'},</p>
        <p>We've processed your request to deactivate your Smoll account. Your account has been successfully deactivated as requested.</p>
        <p>Please note that your account data will be retained for 7 days before being permanently deleted. After this period, you will not be able to recover your account information.</p>
        <p>If you change your mind and would like to reactivate your account within this 7-day period, please contact our support team at <a href="mailto:care@smoll.me">care@smoll.me</a>.</p>
        <p>Thank you for your time with Smoll. We appreciate your past engagement and welcome you back anytime.</p>
        <p>Best regards,<br>Smoll Team</p>  
        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p style="margin: 0; margin-bottom: 10px;"><strong>Smoll Contact Information:</strong></p>
            <p style="margin: 0; margin-bottom: 5px;">Phone: <a href="tel:+97144510090">+971 44510090</a></p>
            <p style="margin: 0; margin-bottom: 5px;">Email: <a href="mailto:care@smoll.me">care@smoll.me</a></p>
        </div>
    </div>
</body>
</html>
`;

export const subscriptionActivationtemplate = ({ memberName, petName, planName, petCareId, startDate, endDate, invoicePdfUrl }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Smoll: Subscription Activated</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <img src="https://smoll.me/wp-content/uploads/2023/10/smoll-logo.png" alt="Smoll Logo" style="max-width: 200px; margin-bottom: 20px;">
    
      <h2 style="color: #4a4a4a;">Subscription Activated</h2>
    
      <p>Dear ${memberName ?? '-'},</p>
    
      <p>We’re excited to inform you that <strong>${petName}'s Smoll Care</strong> subscription has been successfully activated!</p>
    
      <p><strong>Plan:</strong> ${planName ?? 'Smoll Care Plan'}<br>
      <p><strong>Pet's care id:</strong> ${petCareId ?? '---'}<br>
      <strong>Start Date:</strong> ${startDate ?? '---'}<br>
      <strong>End Date:</strong> ${endDate ?? '---'}</p>
    
      <p>You can now enjoy all the benefits and features included in your subscription.</p>

       ${invoicePdfUrl
        ? `<p>You can <a href="${invoicePdfUrl}" target="_blank" style="color: #007BFF;">download your invoice</a> from here.</p>`
        : ''
    }

      <p>If you have any questions or need help managing your subscription, feel free to reach out to our support team at <a href="mailto:care@smoll.me">care@smoll.me</a>.</p>
    
      <p>Thank you for choosing Smoll. We’re happy to be part of your care journey!</p>
    
      <p>Best regards,<br>Smoll Team</p>  

      <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p style="margin: 0; margin-bottom: 10px;"><strong>Smoll Contact Information:</strong></p>
          <p style="margin: 0; margin-bottom: 5px;">Phone: <a href="tel:+97144510090">+971 44510090</a></p>
          <p style="margin: 0; margin-bottom: 5px;">Email: <a href="mailto:care@smoll.me">care@smoll.me</a></p>
      </div>
  </div>
</body>
</html>
`;

export const subscriptionCancellationTemplate = ({ memberName, petName, planName, petCareId }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Smoll: Subscription Cancelled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="https://smoll.me/wp-content/uploads/2023/10/smoll-logo.png" alt="Smoll Logo" style="max-width: 200px; margin-bottom: 20px;">

        <h2 style="color: #4a4a4a;">Subscription Cancelled</h2>

        <p>Dear ${memberName ?? '-'},</p>

        <p>We're writing to confirm that <strong>${petName}'s Smoll Care</strong> subscription has been cancelled.</p>

        <p><strong>Plan:</strong> ${planName ?? 'Smoll Care Plan'}<br>
        <strong>Pet's care ID:</strong> ${petCareId ?? '---'}<br>

        <p>Your subscription will remain active until the end date of your plan. After this date, you will no longer have access to the benefits of your Smoll Care plan.</p>

        <p>If this was a mistake or you'd like to reactivate your subscription, please don't hesitate to contact our support team at <a href="mailto:care@smoll.me">care@smoll.me</a>.</p>

        <p>We’re grateful for the time you spent with us and hope to serve you again in the future.</p>

        <p>Best regards,<br>Smoll Team</p>

        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p style="margin: 0; margin-bottom: 10px;"><strong>Smoll Contact Information:</strong></p>
            <p style="margin: 0; margin-bottom: 5px;">Phone: <a href="tel:+97144510090">+971 44510090</a></p>
            <p style="margin: 0; margin-bottom: 5px;">Email: <a href="mailto:care@smoll.me">care@smoll.me</a></p>
        </div>
    </div>
</body>
</html>
`;
