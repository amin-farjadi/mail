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
  document.querySelector('#compose-form').onsubmit = () => {
    // obtain values
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').innerHTML;
    // Post values
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      load_mailbox('sent');
      // Print result
      console.log(result);
    });
  
  };
  



}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


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

  function mail_add(mail_list, email){

    const element = document.createElement('a');
    element.classList.add('list-group-item', 'list-group-item-action');
    //element.href = String.raw`/emails/${email.id}`;
    // Marking email as read
    element.onclick = () => {
      mark_read(email);
      view_email(email.id);
    }

    if (email.read) {element.style = 'background-color:lightgrey;'}

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
  
  // Show the contents of mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    mail_list = mail_list_create();
    emails.forEach(email => mail_add(mail_list, email));
  });

  // document.querySelectorAll('.list-group-item').forEach(email => {
  //   // marking email as read
  //   email.onclick = function() {mark_read(email)};
  // })
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

function mark_archive(email) {

  if (! email.archived) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    });
  }

  else {
    // pass
  }
}

function view_email(email_id) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    const element = (
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
    document.querySelector('#email-view').innerHTML = element;
  })

  
  
}

