/**
 * Module Title: Contact Form API
 * Purpose: This file handles messages sent through the "Contact Us" form on the website.
 */

// import standard tools for sending web responses
import { NextResponse } from 'next/server';

// POST: Handle contact form submissions
export async function POST(req: Request) {
  try {
    // extract the name, email, and message from the data sent by the user
    const { name, email, message } = await req.json();

    // if any of the fields are empty, stop and tell the user they are all required
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // in a real system, we would save this to a database or send an email here
    // for now, we just print it to the server's logs to show it was received
    console.log(`[CONTACT_FORM] From: ${name} <${email}>. Message: ${message}`);

    // send a success message back to the user to let them know we got their message
    return NextResponse.json({
      success: true,
      message: 'Your message has been received. Our team will contact you shortly.',
    });
  } catch (error) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Contact API Error:', error);
    // tell the user that we couldn't send their message right now
    return NextResponse.json(
      { success: false, message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
