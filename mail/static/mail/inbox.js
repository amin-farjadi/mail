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

  // Creating a table
  const tbl = document.createElement("table");
  document.querySelector('#emails-view').append(tbl);
  const table = document.querySelector("table");

  function create_header(dict) {
    let header = table.createTHead().insertRow();
    for (let key of Object.keys(dict) ) {
      let th = document.createElement("th");
      let txt = document.createTextNode(key);
      th.appendChild(txt);
      header.appendChild(th);
    }
  }

  function create_row(dict) {
    let row = table.insertRow();
    for (let key of Object.keys(dict) ) {
      let cell = row.insertCell();
      let txt = document.createTextNode(dict[key]);
      cell.appendChild(txt);
    }
  }

  // Show the contents of mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    create_header(emails[0]);
    emails.forEach(email => create_row(email));
  });
  // document.querySelector('#emails-view').innerHTML += '<h4> Hi </h4>';
}