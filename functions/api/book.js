export async function onRequestPost({ request }) {
  try {
    const payload = await request.json();

    const {
      name = '',
      email = '',
      phone = '',
      contactPref = '',
      wants = 'Not sure yet',
      vehicle = '',
      vin = '',
      message = '',
      waiverAccepted = false
    } = payload;

    if (!name || !email || !phone || !vehicle) {
      return new Response(JSON.stringify({ success: false, error: 'Name, email, phone, and vehicle are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bookingBody = `
New Booking Request from My First Wrench

Name: ${name}
Email: ${email}
Phone: ${phone}
Preferred contact: ${contactPref || 'Not specified'}
Wants to learn: ${wants}
Vehicle: ${vehicle}
VIN: ${vin || 'None provided'}
Additional notes: ${message || 'None'}
Waiver accepted: ${waiverAccepted ? 'YES' : 'NO'}
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })}
    `.trim();

    // Send to Raz
    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: 'myfirstwrench@gmail.com', name: 'Raz' }] }],
        from: { email: 'bookings@myfirstwrench.com', name: 'My First Wrench Booking' },
        subject: `New Booking - ${name} - ${vehicle}`,
        content: [{ type: 'text/plain', value: bookingBody }]
      })
    });

    // Send confirmation to customer
    const confirmBody = `
Thank you for your booking request with My First Wrench!

Your request has been received and Raz will reach out to you shortly to schedule a time.

**Your Booking Summary**
Name: ${name}
Vehicle: ${vehicle}
Interest: ${wants}
Preferred contact: ${contactPref || 'Not specified'}
Phone: ${phone}

Payments are taken after the lesson is completed. Parts and fluids are charged at exact cost.

Thank you,
Raz
My First Wrench
Kuna, Idaho
    `.trim();

    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: email, name: name }] }],
        from: { email: 'bookings@myfirstwrench.com', name: 'My First Wrench' },
        subject: 'Booking Request Received - My First Wrench',
        content: [{ type: 'text/plain', value: confirmBody }]
      })
    });

    return new Response(
      JSON.stringify({ success: true, message: "Booking request sent successfully!" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Booking function error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
