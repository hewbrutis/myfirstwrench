export async function onRequestPost({ request, env }) {
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

    if (!email || !name || !vehicle) {
      return new Response(JSON.stringify({ success: false, error: 'Name, email, and vehicle are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bookingBody = `
New Booking Request from My First Wrench

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Preferred contact: ${contactPref || 'Not specified'}
Wants to learn: ${wants}
Vehicle: ${vehicle}
VIN: ${vin || 'None provided'}
Additional notes: ${message || 'None'}
Waiver accepted: ${waiverAccepted ? 'YES' : 'NO'}
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })}
    `.trim();

    // Send to Raz
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
        subject: `New Booking - ${name} - ${vehicle}`,
        content: [{
          type: 'text/plain',
          value: bookingBody
        }]
      })
    });

    let razResult = 'sent';
    if (!razResponse.ok) {
      const errorText = await razResponse.text();
      console.error('MailChannels Raz error:', errorText);
      razResult = 'failed';
    }

    // Send confirmation to customer
    const confirmBody = `
Thank you for your booking request with My First Wrench!

Your request has been received and Raz will reach out to you shortly to schedule a time.

**Your Booking Summary**
Name: ${name}
Vehicle: ${vehicle}
Interest: ${wants}
Preferred contact: ${contactPref || 'Not specified'}

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
          to: [{ email: email, name: name }]
        }],
        from: {
          email: 'bookings@myfirstwrench.com',
          name: 'My First Wrench'
        },
        subject: 'Booking Request Received - My First Wrench',
        content: [{
          type: 'text/plain',
          value: confirmBody
        }]
      })
    });

    if (!customerResponse.ok) {
      const errorText = await customerResponse.text();
      console.error('MailChannels customer error:', errorText);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Booking request sent successfully. Check both inboxes." 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (err) {
    console.error('Booking function error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
