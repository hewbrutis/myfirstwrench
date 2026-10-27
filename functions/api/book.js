/**
 * Legacy booking endpoint.
 * Older cached pages still POST JSON here. Forward those to Formspree
 * so Raz and the customer both get email without MailChannels.
 */
const FORMSPREE = "https://formspree.io/f/mbggobpn";
const OWNER = "myfirstwrench@gmail.com";

function text(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { "Content-Type": "application/json" }
  });
}

async function readBody(request) {
  const type = (request.headers.get("content-type") || "").toLowerCase();
  if (type.includes("application/json")) {
    return await request.json();
  }
  const fd = await request.formData();
  const obj = {};
  fd.forEach(function (value, key) {
    obj[key] = String(value);
  });
  return obj;
}

export async function onRequestPost({ request }) {
  try {
    const payload = await readBody(request);
    const name = String(payload.name || "").trim();
    const email = String(payload.email || payload._replyto || "").trim();
    const phone = String(payload.phone || "").trim();
    const contactPref = String(payload.contactPref || payload["contact-pref"] || "").trim();
    const wants = String(payload.wants || payload.package || payload.skill || "Not sure yet").trim();
    const vehicle = String(payload.vehicle || [payload.year, payload.make, payload.model].filter(Boolean).join(" ")).trim();
    const vin = String(payload.vin || "").trim();
    const message = String(payload.message || "").trim();
    const waiver = payload.waiverAccepted || payload.waiver || "";

    if (!name || !email || !phone || !vehicle) {
      return text({ success: false, error: "Name, email, phone, and vehicle are required" }, 400);
    }

    const body = new URLSearchParams();
    body.set("_subject", "New Booking Request - My First Wrench");
    body.set("_replyto", email);
    body.set("_cc", OWNER + "," + email);
    body.set("name", name);
    body.set("email", email);
    body.set("phone", phone);
    body.set("contact-pref", contactPref);
    body.set("wants", wants);
    body.set("vehicle", vehicle);
    body.set("vin", vin);
    body.set("message", message);
    body.set("waiver", String(waiver || "accepted"));

    const res = await fetch(FORMSPREE, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });

    let data = {};
    try {
      data = await res.json();
    } catch (err) {
      data = {};
    }

    if (!res.ok) {
      return text({
        success: false,
        error: (data && data.error) || "Formspree rejected the booking"
      }, res.status || 502);
    }

    return text({
      success: true,
      ok: true,
      message: "Booking request sent successfully! Raz will be reaching out shortly."
    }, 200);
  } catch (err) {
    console.error("Booking function error:", err);
    return text({
      success: false,
      error: "Internal error - please try again or email myfirstwrench@gmail.com directly"
    }, 500);
  }
}
