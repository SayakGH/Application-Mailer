const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

class mailer {
  constructor(myemail, password) {
    this.myemail = myemail;
    this.password = password;
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.myemail,
        pass: this.password, // Use env vars or app password
      },
    });
    this.requirements = [];
  }

  addInfo(resumePath, coverLetterPath) {
    this.resumePath = resumePath;
    this.coverLetterPath = coverLetterPath;
    this.requirements.push("coverLetter", "resumePath");
  }

  addSubject(subject) {
    this.subject = subject;
    this.requirements.push("subject");
  }

  addCSV(csvPath, csvHasHeaders = true, emailColumnName = "Email") {
    this.csvPath = csvPath;
    this.csvHasHeaders = csvHasHeaders;
    this.emailColumnName = emailColumnName;
    this.requirements.push("csv");
  }

  Errors() {
    if (this.requirements.length === 0) {
      console.error("No requirements found");
      return true;
    }
    const required = ["subject", "csv", "resumePath", "coverLetter"];
    const missing = required.filter((r) => !this.requirements.includes(r));
    if (missing.length > 0) {
      console.error("Missing requirements:", missing.join(", "));
      return true;
    }
    return false;
  }

  fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (err) {
      return false;
    }
  }

  async sendEmail(email, current, total) {
    try {
      const coverLetter = fs.readFileSync(this.coverLetterPath, "utf-8");
      const mailOptions = {
        from: this.myemail,
        to: email,
        subject: this.subject,
        text: coverLetter,
        attachments: [
          {
            filename: "Resume.pdf",
            path: this.resumePath,
          },
        ],
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✓ [${current}/${total}] Email sent to ${email}`);
      return true;
    } catch (error) {
      console.error(
        `✗ [${current}/${total}] Error sending to ${email}:`,
        error.message
      );
      return false;
    }
  }

  async processApplications() {
    if (!this.fileExists(this.resumePath)) {
      console.error(`✗ Error: Resume file not found at ${this.resumePath}`);
      return;
    }

    if (!this.fileExists(this.csvPath)) {
      console.error(`✗ Error: CSV file not found at ${this.csvPath}`);
      console.log(`Make sure your CSV file is located at: ${this.csvPath}`);
      return;
    }

    console.log(`Starting to process applications from: ${this.csvPath}`);
    const emails = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(this.csvPath)
        .on("error", (error) => {
          console.error(`✗ Error reading CSV file: ${error.message}`);
          reject(error);
        })
        .pipe(csv({ headers: this.csvHasHeaders ? undefined : false }))
        .on("data", (row) => {
          let email;
          if (this.csvHasHeaders === false) {
            email =
              typeof row === "string"
                ? row.trim()
                : Object.values(row)[0].trim();
          } else {
            email = row[this.emailColumnName]?.trim();
          }

          if (email && email.includes("@")) {
            emails.push(email);
          } else {
            console.log(`Invalid email format found: ${email}`);
          }
        })
        .on("end", async () => {
          console.log(`Found ${emails.length} valid email addresses`);

          if (emails.length === 0) {
            console.log(
              "No valid emails found. Please check your CSV file format."
            );
            resolve();
            return;
          }

          let successCount = 0;
          const totalEmails = emails.length;

          console.log(`\nStarting email sending process...`);

          for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            const result = await this.sendEmail(email, i + 1, totalEmails);
            if (result) successCount++;

            if (i < emails.length - 1) {
              await new Promise((res) => setTimeout(res, 2000));
            }
          }

          console.log(`\nProcess completed!`);
          console.log(`Successfully sent: ${successCount}/${totalEmails}`);
          console.log(`Failed: ${totalEmails - successCount}`);
          resolve();
        });
    });
  }
}

module.exports = mailer;
