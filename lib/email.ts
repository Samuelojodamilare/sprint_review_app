import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || "Sprint Review App <no-reply@sprintreview.app>";

function baseTemplate(title: string, body: string): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h2 style="font-size:18px;font-weight:600;margin-bottom:8px">${title}</h2>
      <div style="font-size:14px;line-height:1.6;color:#444">${body}</div>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5"/>
      <p style="font-size:12px;color:#888">Sprint Review App &mdash; you received this because you are part of an active sprint.</p>
    </div>
  `;
}

export async function sendTaskPendingEmail(
  adminEmail: string,
  adminName: string,
  memberName: string,
  taskTitle: string,
  points: number,
  isEdit: boolean
) {
  const subject = isEdit
    ? `Task edit pending approval: "${taskTitle}"`
    : `New task pending approval: "${taskTitle}"`;

  const body = `
    <p>Hi ${adminName},</p>
    <p><strong>${memberName}</strong> has submitted ${isEdit ? "an edit to" : "a new task"} that needs your approval:</p>
    <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0;font-weight:600">${taskTitle}</p>
      <p style="margin:4px 0 0;color:#666;font-size:13px">${points} story point${points !== 1 ? "s" : ""}</p>
    </div>
    <p>Log in to your dashboard to approve or decline this task.</p>
  `;

  await transporter.sendMail({
    from: FROM,
    to: adminEmail,
    subject,
    html: baseTemplate(subject, body),
  });
}

export async function sendTaskApprovedEmail(
  memberEmail: string,
  memberName: string,
  taskTitle: string
) {
  const subject = `Your task has been approved: "${taskTitle}"`;
  const body = `
    <p>Hi ${memberName},</p>
    <p>Great news! Your task has been <strong style="color:#1a7a4a">approved</strong> and is now active in the sprint.</p>
    <div style="background:#f0faf5;border:1px solid #b2dfc8;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0;font-weight:600">${taskTitle}</p>
    </div>
    <p>You can now update its status from your dashboard.</p>
  `;

  await transporter.sendMail({
    from: FROM,
    to: memberEmail,
    subject,
    html: baseTemplate(subject, body),
  });
}

export async function sendTaskDeclinedEmail(
  memberEmail: string,
  memberName: string,
  taskTitle: string,
  reason: string
) {
  const subject = `Your task was not approved: "${taskTitle}"`;
  const body = `
    <p>Hi ${memberName},</p>
    <p>Your task was <strong style="color:#b91c1c">declined</strong> by the admin.</p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0;font-weight:600">${taskTitle}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#666"><strong>Reason:</strong> ${reason}</p>
    </div>
    <p>You can revise and resubmit the task from your dashboard.</p>
  `;

  await transporter.sendMail({
    from: FROM,
    to: memberEmail,
    subject,
    html: baseTemplate(subject, body),
  });
}

export async function sendSprintCreatedEmail(
  memberEmail: string,
  memberName: string,
  sprintName: string,
  goal: string,
  startDate: string,
  endDate: string
) {
  const subject = `New sprint started: ${sprintName}`;
  const body = `
    <p>Hi ${memberName},</p>
    <p>A new sprint has been started. Log in and add your tasks!</p>
    <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0;font-weight:600;font-size:16px">${sprintName}</p>
      <p style="margin:6px 0 0;font-size:13px;color:#666">${goal}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#888">${startDate} &rarr; ${endDate}</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: memberEmail,
    subject,
    html: baseTemplate(subject, body),
  });
}

export async function sendSprintClosedEmail(
  memberEmail: string,
  memberName: string,
  sprintName: string,
  summaryNotes: string
) {
  const subject = `Sprint closed: ${sprintName}`;
  const body = `
    <p>Hi ${memberName},</p>
    <p>The sprint <strong>${sprintName}</strong> has been closed.</p>
    ${
      summaryNotes
        ? `<div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0;font-size:13px;color:#444">${summaryNotes}</p>
           </div>`
        : ""
    }
    <p>Any incomplete tasks have been carried over to the next sprint.</p>
  `;

  await transporter.sendMail({
    from: FROM,
    to: memberEmail,
    subject,
    html: baseTemplate(subject, body),
  });
}
