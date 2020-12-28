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
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // Creating email list
  function mail_list_create(){
    const mail_list = document.createElement('div');
    mail_list.classList.add('list-group');
    document.querySelector('#emails-view').append(mail_list);
    return mail_list
  }

  function mail_add(mail_list, email){

    const element = document.createElement('a');
    element.classList.add('list-group-item', 'list-group-item-action');
    element.href = "#";

    const div = document.createElement('div');
    div.classList.add('d-flex', 'w-100', 'justify-content-between');

    const person = document.createElement('h6');
    person.classList.add('mb-1');
    person.innerHTML = email.sender;

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
    console.log(emails);
    //create_header(emails[0]);
    mail_list = mail_list_create();
    emails.forEach(email => mail_add(mail_list, email));
  });
  
}