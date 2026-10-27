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

    if (!email) {
      return new Response(JSON.stringify({ success: false, error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bookingBody = `
New Booking Request from My First Wrench website

Name: ${name}
Email: ${email}
Phone: ${phone || 'not provided'}
Preferred contact: ${contactPref}
Wants to learn: ${wants}
Vehicle: ${vehicle}
VIN: ${vin || 'none'}
Additional notes: ${message || 'none'}
Waiver accepted: ${waiverAccepted ? 'YES' : 'NO'}
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })}
    `.trim();

    // Send notification to Raz
    const razResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'myfirstwrench@gmail.com', name: 'Raz' }]
        }],
        from: {
          email: 'bookings@myfirstwrench.com',
          name: 'My First Wrench Booking'
        },
        subject: `New Booking - ${name || 'Customer'} - ${vehicle || 'No vehicle'}`,
        content: [{
          type: 'text/plain',
          value: bookingBody
        }]
      })
    });

    if (!razResponse.ok) {
      console.error('Failed to send to Raz:', await razResponse.text());
    }

    // Send confirmation to customer
    const confirmBody = `
Thank you for booking with My First Wrench!

Your request has been received.

**Summary**
Name: ${name}
Vehicle: ${vehicle}
Lesson interest: ${wants}

Raz will reach out to you shortly to schedule a time that works for you.

Payments are taken after the lesson is completed. Parts and fluids are charged at exact cost.

Thank you,
Raz
My First Wrench
Kuna, Idaho
    `.trim();

    const customerResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email, name: name || 'Customer' }]
        }],
        from: {
          email: 'bookings@myfirstwrench.com',
          name: 'My First Wrench'
        },
        subject: 'Your booking request has been received - My First Wrench',
        content: [{
          type: 'text/plain',
          value: confirmBody
        }]
      })
    });

    if (!customerResponse.ok) {
      console.error('Failed to send confirmation:', await customerResponse.text());
    }

    return new Response(
      JSON.stringify({ success: true, message: "Booking request sent successfully" }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (err) {
    console.error('Booking error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
