document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // send email
  document.querySelector('#compose-form').addEventListener('submit', submitEmail);


  // By default, load the inbox
  load_mailbox('inbox');
});


// send the email
function submitEmail(event) {
  // Prevent page from refreshing
  event.preventDefault()
  // Get the form data
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  // Call the API
  fetch('/emails' , {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => {
    // Direst to sent mailbox
    load_mailbox('sent');
    console.log(response);
  })
  .catch(error => console.log(error));

}


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

  // Call the API
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //log emails
    console.log(emails);
    
    emails.forEach(email => {
      // Create a new email element
      const email_element = document.createElement('div');
      email_element.id = "iemail";
      //assign id to each email
      email_element.dataset.id = email.id;

      //Check if email is read or not
      if( email.read){
      email_element.className = 'p-3 mb-2 bg-secondary text-white d-flex justify-content-between border border-secondary rounded';
      } 
      else {
        email_element.className = 'p-3 mb-2 bg-light d-flex justify-content-between border border-dark rounded';
      }
      // Adding the content
      email_element.innerHTML = ` <div> <b>${email.sender}</b> &nbsp; &nbsp; ${email.subject}</div>
      <div>${email.timestamp}</div>`;

      // Add it to the emails list
      document.querySelector('#emails-view').appendChild(email_element);
     })
  })
  .catch(error => console.log(error));
  
}