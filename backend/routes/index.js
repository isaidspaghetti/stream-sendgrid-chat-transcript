const express = require('express');
const router = express.Router();
const { StreamChat } = require('stream-chat');
const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require('uuid');

const streamApiKey = process.env.STREAM_API_KEY;
const streamApiSecret = process.env.STREAM_API_SECRET;
const sendgridApiKey = process.env.SENDGRID_API_KEY;

function createUsers(firstName, lastName) {
  const customer = {
    id: `${firstName}-${lastName}`.toLowerCase(),
    name: firstName,
    role: 'user',
  };

  const admin = {
    id: 'admin-id',
    name: 'Support Admin',
    role: 'admin'
  };

  return [customer, admin];
}

router.post('/customer-login', async (req, res) => {
  try {
    const firstName = req.body.firstName.replace(/\s/g, '_');
    const lastName = req.body.lastName.replace(/\s/g, '_');
    const client = new StreamChat(streamApiKey, streamApiSecret);

    [customer, admin] = createUsers(firstName, lastName);

    await client.upsertUsers([
      customer,
      admin
    ]);

    const channel = client.channel('messaging', uuidv4(), {
      members: [customer.id, admin.id],
    });

    const customerToken = client.createToken(customer.id);

    res.status(200).json({
      customerId: customer.id,
      customerToken,
      channelId: channel.id,
      streamApiKey,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/email-transcript', async (req, res) => {
  const messages = req.body.messages;
  const { firstName, lastName, email, createdAt } = req.body;

  let transcript = messages.map((message) => {
    return (`<li>FROM: ${message.user.id}</li>\n<li>MESSAGE: ${message.text}</li>\n`);
  });

  sgMail.setApiKey(sendgridApiKey);

  const msg = {
    to: 'recipient@example.com',
    from: 'yourSendGridVerifiedEmail@example.com',
    subject: 'Stream Chat: Your client started a Support Chat Session',
    html: `Hello, \n Your client, ${firstName} ${lastName} started a chat with the support team chat widget on ${createdAt}. \n
    Here is the transcript of the chat: \n ${transcript} END OF TRANSCRIPT \n You can reach your client at ${email}. \n This message was sent to you from Stream Chat`,
  };

  try {
    sgMail.send(msg);
    res.status(200).end();
  }
  catch{
    (err) => {
      res.status(500).json({ error: err.message });
      console.log(err.response.body);
    };

  }
});

module.exports = router;
