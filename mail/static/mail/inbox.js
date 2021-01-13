document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    load_mailbox('inbox');
    navbar_active('#inbox');
  });
  document.querySelector('#sent').addEventListener('click', () => {
    load_mailbox('sent');
    navbar_active('#sent');
  });
  document.querySelector('#archive').addEventListener('click', () => {
    load_mailbox('archive');
    navbar_active('#archive');
  });
  document.querySelector('#compose').addEventListener('click', () => {
    compose_email();
    navbar_active('#compose');
  });

  // By default, load the inbox
  load_mailbox('inbox');
  navbar_active('#inbox');
});

// Responsive nav bar implementation
function navbar_active(mailbox){

  const all = ['#inbox', '#sent', '#archive', '#compose'];
  const idx = all.indexOf(mailbox);
  all.splice(idx,1); // removing mailbox from all

  all.forEach(item => {
    document.querySelector(item).classList.remove('active');
  });
  document.querySelector(mailbox).classList.add('active');

  unread_counter();
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  //Navbar response
  navbar_active('#compose');

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
  
  // Nav bar reponse
  navbar_active('#'+mailbox);

  // Show the contents of mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    mail_list = mail_list_create();
    emails.forEach(email => mail_add(mailbox, mail_list, email));
  });

}

// View individual emails
function view_email(email_id, mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    const buttons = (`
      <div class="d-flex flex-row-reverse mb-3">
        <button id="reply_button" type="button" class="btn btn-info col-md-2" style="background-color: MediumBlue; border-color: MediumBlue;">Reply</button>
        <button id="archive_button" type="button" class="btn btn-secondary col-md-2 mr-1">

        </button>
      </div>
    `);

    const email_element = (
      `<div class="p-2">

        <div class="d-flex flex-row mb-2">
          <div class="">
            <span style="font-weight: 500;">Subject: </span><b>${email.subject}</b>
          </div>
        </div>

        <div class="d-flex flex-row">
          <div>
            <span style="font-weight: 500;">From: </span>${email.sender}
          </div>
        </div>

        <div class="d-flex flex-row">
          <div>
            <span style="font-weight: 500;">Recipients: </span>${email.recipients.toString()}
          </div>
        </div>

        <div class="d-flex flex-row-reverse mb-2">
          <div style="color: DarkBlue;">${email.timestamp}</div>
        </div>

        <div class="row" style="padding:10px; white-space: pre-line;">
          <div class="col-12 box">${email.body}</div>
        </div>
  
      </div>`
    );
    document.querySelector('#email-view').innerHTML = buttons
    document.querySelector('#email-view').innerHTML += email_element;

    document.querySelector('#reply_button').onclick = () => {
      reply(email);
    };

    const archive_btn = document.querySelector('#archive_button');
    if (mailbox === 'sent') {
      archive_btn.style.display = 'none';
    }
    else {
      archive_btn.style.display = 'block';
      // Setting initial value of archive button
      if (email.archived) {
        archive_btn.innerHTML = 'Unarchive';
      }
      else {
        archive_btn.innerHTML = 'Archive';
      }
    
      archive_btn.onclick = () => {
        mark_archive(email)
        .then(response => {
          if (!response.ok) {
            throw new Error('Not been able to archive')
          }
          load_mailbox('inbox');
        })
        .catch(error => alert(error));
      };
    }

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
  element.style.cursor = "pointer";
  // Marking email as read
  element.onclick = async () => {
    await mark_read(email);
    view_email(email.id, mailbox);
    unread_counter(); 
  }

  if (email.read) {element.style.backgroundColor = 'lightgrey'}

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

async function mark_read(email) {

  if (!email.read) {
    await fetch(`/emails/${email.id}`, {
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

async function mark_archive(email) {
  if (! email.archived) {
    const response = await fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    });
    return response
  }

  else {
    const response = await fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    });
    return response
  }

}

function reply(email) {
  compose_email();
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-body').value = `\n ----------------- \n On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`;
  // Bringing cursor on the body
  document.querySelector('#compose-body').focus();
  document.querySelector('#compose-body').setSelectionRange(0, 0); 
}

// Sending email
async function sendEmail(data = {}) {

  const response = await fetch('/emails', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response 
}

function unread_counter() {

  var cnt = 0;
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email =>{
      if (!email.read){cnt+=1}
    })
    document.querySelector('#unread').innerHTML = cnt;
  })
}