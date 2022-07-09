document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // send email
  document
    .querySelector("#compose-form")
    .addEventListener("submit", submitEmail);

  // By default, load the inbox
  load_mailbox("inbox");
});

// send the email
function submitEmail(event) {
  // Prevent page from refreshing
  event.preventDefault();
  // Get the form data
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;
  // Call the API
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => {
      // Direst to sent mailbox
      load_mailbox("sent");
     // console.log(response);
    })
    .catch((error) => console.log(error));
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#content-view").style.diaplay = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#content-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Call the API
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      //log emails
      //console.log(emails);

      emails.forEach((email) => {
        // Create a new email element
        const email_element = document.createElement("div");
        email_element.id = "email-element";

        email_element.style.cursor = "pointer";

        //Check if email is read or not
        if (email.read) {
          email_element.className =
            "p-3 mb-2 bg-secondary text-white d-flex justify-content-between border border-secondary rounded";
        } else {
          email_element.className =
            "p-3 mb-2 bg-light d-flex justify-content-between border border-dark rounded";
        }

        // Adding the content
        email_element.innerHTML = ` <div> <b>${email.sender}</b> &nbsp; &nbsp; ${email.subject}</div> <div>${email.timestamp}</div>`;

        // Adding on CLICK event to email
        email_element.addEventListener("click", () =>
          openEmail(email.id, mailbox)
        );

        // Add it to the emails list
        document.querySelector("#emails-view").appendChild(email_element);
      });
    })
    .catch((error) => console.log(error));
}

function openEmail(id, mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#content-view").style.display = "block";

  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      //console.log(email);
      // Add the content
      document.querySelector("#content-view").innerHTML = `<h5><b>Form:</b> ${
        email.sender
      }</h5> 
      <h5><b>To: </b>${email.recipients}</h5>
      <h5><b>Subject: </b>${email.subject}</h5>
      <h5 style="margin-bottom: 30px;"><b>Timestamp: </b>${email.timestamp}</h5>
      <hr />
      <p style="font-size: 18px; font-weight: 550;">${email.body}<p>
      <hr style="margin-top: 36px;"/>   
      ${
        mailbox === "inbox" || mailbox === "archive"
          ? `<button type="button" id="archive" class="btn btn-info float-xl-left" style="width:90px;">${
              email.archived ? "Unarchive" : "Archive"
            }</button>`
          : ""
      }
      <button type="button" id="reply" class="btn btn-success float-xl-right" style="width:90px;">Reply</button>
      `;
      if (mailbox === "inbox" || mailbox === "archive") {
        document
          .querySelector("#archive")
          .addEventListener("click", () => archiveEmail(id, email.archived));
      }
      document
        .querySelector("#reply")
        .addEventListener("click", () => replyEmail(id, email));
    })
    .catch((error) => console.log(error));
  
  // Mark the email as read
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  }).catch((error) => console.log(error));
}

// Archive the email
function archiveEmail(id, archived) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !archived,
    }),
  })
    .then(() => load_mailbox("inbox"))
    .catch((error) => console.log(error));
}

function replyEmail(id, email) {
  // Show the compose-view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#content-view").style.display = "none";

  document.querySelector("#compose-recipients").value = email.recipients;

  if (/^Re:*/.test(email.subject)) {
    document.querySelector("#compose-subject").value = email.subject;
  } else {
    document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
  }

  document.querySelector(
    "#compose-body"
  ).value = `On ${email.timestamp} ${email.sender} wrote: \n\n${email.body}`;
}
