document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Form submission
  document.querySelector('#compose-form').onsubmit = (e) => {
    e.preventDefault();
    // Post values
    sendEmail({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value,
    })
    .then(response => {
      if (!response.ok){
        throw new Error('Email not sent, please try again')
      }

      load_mailbox('sent');
    })
    .catch(error => {
      alert(error);
      compose_email();
    });
    
  }
  

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;  
  
  // Show the contents of mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    mail_list = mail_list_create();
    emails.forEach(email => mail_add(mailbox, mail_list, email));
  });

}

// View individual emails
function view_email(email_id) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    const buttons = (`
      <div class="d-flex flex-row-reverse mb-3">
        <button id="reply_button" type="button" class="btn btn-info col-md-3">Reply</button>
        <button id="archive_button" type="button" class="btn btn-secondary col-md-2 mr-1">Archive</button>
      </div>
    `);

    const email_element = (
      `<div class="container">
  
        <div class="row mb-2">
          <div class="col-md-8">${email.subject}</div>
          <div class="col-md-4">${email.timestamp}</div>
        </div>

        <div class="row">
          <div class="col-12">${email.body}</div>
        </div>


        <div class="row">
        </div>
  
      </div>`
    );
    document.querySelector('#email-view').innerHTML = buttons
    document.querySelector('#email-view').innerHTML += email_element;

    document.querySelector('#reply_button').onclick = () => {
      reply(email);
    };
  })

  
}

// Creating email list
function mail_list_create(){
  // delete an already existing mail list
  if (document.querySelector('.list-group') !== null) {
    document.querySelector('.list-group').remove();
  }
  // create a list group
  const mail_list = document.createElement('div');
  mail_list.classList.add('list-group');
  document.querySelector('#emails-view').append(mail_list);
  return mail_list
}

// Adding individual emails
function mail_add(mailbox, mail_list, email){

  const element = document.createElement('a');
  element.classList.add('list-group-item', 'list-group-item-action');
  // Marking email as read
  element.onclick = () => {
    mark_read(email);
    view_email(email.id);
  }

  if (email.read) {element.style = 'background-color:lightgrey;'}

  // Modifying element style
  const div = document.createElement('div');
  div.classList.add('d-flex', 'w-100', 'justify-content-between');

  const person = document.createElement('h6');
  person.classList.add('mb-1');
  if (mailbox === 'sent') {

    if (email.recipients.length > 1){
      const person_first = email.recipients[0];
      person.innerHTML = `${person_first}, ...`;
    }

    else {
      person.innerHTML = email.recipients;
    }

  }
  else {
    person.innerHTML = email.sender;
  }

  const subject = document.createElement('h6');
  subject.classList.add('mb-1');
  subject.innerHTML = `<b> ${email.subject} </b>`;

  const timestamp = document.createElement('small');
  timestamp.classList.add('text-muted');
  timestamp.innerHTML = email.timestamp;

  div.append(person, subject, timestamp);
  element.append(div);

  mail_list.append(element);

}

function mark_read(email) {

  if (!email.read) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    });
  }

  else {
    // pass
  }
}

function archive(email) {

  if (! email.archived) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    .then(response => {
      if (response.ok) {
        return 'Unarchive'
      }
      else {
        // pass
      }
    });
  }

  else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    .then(response => {
      if (response.ok) {
        return 'Archive'
      }
      else {
        // pass
      }
    });
  }
}

function reply(email) {
  compose_email();
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-recipients').value = `${email.recipients}`;
  document.querySelector('#compose-body').value = `\n ----------------- \n On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`;
  // Bringing cursor on the body
  document.querySelector('#compose-body').focus();
  document.querySelector('#compose-body').setSelectionRange(0, 0); 
}

// Sending email
async function sendEmail(data = {}) {
  // Default options are marked with *
  const response = await fetch('/emails', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response
}

