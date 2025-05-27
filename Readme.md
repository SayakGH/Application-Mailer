# Application Mailer

This Node.js project automates the process of sending personalized job applications via email. It uses Gmail as the SMTP service and sends a common **cover letter** and **resume** to a list of recipient email addresses from a CSV file.

## ✨ Features

- ✅ Send personalized emails with attachments
- 📎 Attach your resume in PDF format
- 📄 Include cover letter content from a `.txt` file
- 📬 Read recipient emails from a CSV file
- ✅ Skip invalid email entries
- 📊 Logs the success/failure of each email
- ⏱ Introduces a delay between each email to avoid rate-limiting

---

## 📦 Installation

```bash
# Clone the repository
git clonehttps://github.com/SayakGH/Application-Mailer.git
cd ApplicationMailer

# Install dependencies
npm install application-mailer
```

---

## 🚀 Demo

```bash
const Mailer = require("application-mailer");

const mailer = new Mailer("youremail@gmail.com", "your-app-password");

mailer.addInfo("./resume.pdf", "./coverLetter.txt");
mailer.addSubject("Application for Software Developer");
mailer.addCSV("./emails.csv", true, "Email");


if (!mailer.Errors()) {
  mailer.processApplications();
}
```

---

## 📝 TODO (Contributions Welcome)

- Add HTML email support
- Add logging to a .log file
- Retry failed emails
- UI/CLI interface
- Email templates and personalization

---
