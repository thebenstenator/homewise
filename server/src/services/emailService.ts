import { BrevoClient } from '@getbrevo/brevo'

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! })

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? 'reminders@yourhomewise.app'
const FROM_NAME = 'HomeWise'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function sendFeedback(fromName: string, fromEmail: string, message: string, toEmail: string) {
  await client.transactionalEmails.sendTransacEmail({
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: toEmail }],
    replyTo: { email: fromEmail, name: fromName },
    subject: `Feedback from ${fromName}`,
    htmlContent: `<p><strong>From:</strong> ${escapeHtml(fromName)} (${escapeHtml(fromEmail)})</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
  })
}

export async function sendPasswordReset(email: string, resetUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
        <tr><td align="center">
          <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
            <tr>
              <td style="background:#1e293b;padding:24px 32px">
                <p style="margin:0;font-size:22px;font-weight:700;color:#4ade80">HomeWise</p>
                <p style="margin:6px 0 0;font-size:14px;color:#94a3b8">Password reset request</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px">
                <p style="margin:0 0 16px;font-size:15px;color:#334155">We received a request to reset your password. Click the button below to choose a new one.</p>
                <p style="margin:0 0 24px;font-size:15px;color:#334155">This link expires in <strong>1 hour</strong>.</p>
                <a href="${resetUrl}" style="display:block;text-align:center;padding:12px;background:#16a34a;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none">
                  Reset my password →
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #e2e8f0;background:#f8fafc">
                <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">
                  If you didn't request this, you can safely ignore this email. Your password won't change.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`

  await client.transactionalEmails.sendTransacEmail({
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email }],
    subject: 'Reset your HomeWise password',
    htmlContent: html,
  })
}

export interface DueTask {
  applianceId: string
  applianceName: string
  taskId: string
  taskLabel: string
  daysUntilDue: number
  thumbtackCategory: string
  angiCategory: string
}

export interface EmailUser {
  email: string
  name: string
  zipCode: string
  unsubscribeToken?: string
}

export async function sendWeeklyDigest(user: EmailUser, dueTasks: DueTask[]) {
  const thumbtackBase = 'https://www.thumbtack.com/k'
  const appUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
  const unsubscribeUrl = user.unsubscribeToken
    ? `${appUrl}/unsubscribe?token=${user.unsubscribeToken}`
    : `${appUrl}/profile`

  const taskRows = dueTasks
    .map((t) => {
      const dueLabel =
        t.daysUntilDue < 0
          ? `<span style="color:#dc2626">Overdue by ${Math.abs(t.daysUntilDue)} day${Math.abs(t.daysUntilDue) !== 1 ? 's' : ''}</span>`
          : t.daysUntilDue === 0
          ? `<span style="color:#d97706">Due today</span>`
          : `<span style="color:#16a34a">Due in ${t.daysUntilDue} day${t.daysUntilDue !== 1 ? 's' : ''}</span>`

      const diyAppUrl = `${appUrl}/appliances/${t.applianceId}?diy=${t.taskId}`
      const proUrl = `${thumbtackBase}/${t.thumbtackCategory}/near-me/?zip=${user.zipCode}&utm_source=homewise&utm_medium=email`

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e2e8f0">
            <p style="margin:0 0 4px;font-size:13px;color:#64748b">${t.applianceName}</p>
            <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0f172a">${t.taskLabel}</p>
            <p style="margin:0 0 12px;font-size:13px">${dueLabel}</p>
            <a href="${diyAppUrl}" style="display:inline-block;margin-right:8px;padding:6px 14px;background:#f1f5f9;color:#334155;font-size:12px;font-weight:500;border-radius:6px;text-decoration:none">DIY Guide →</a>
            <a href="${proUrl}" style="display:inline-block;padding:6px 14px;background:#16a34a;color:#ffffff;font-size:12px;font-weight:500;border-radius:6px;text-decoration:none">Find a Pro →</a>
          </td>
        </tr>`
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
        <tr><td align="center">
          <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">

            <!-- Header -->
            <tr>
              <td style="background:#1e293b;padding:24px 32px">
                <p style="margin:0;font-size:22px;font-weight:700;color:#4ade80">HomeWise</p>
                <p style="margin:6px 0 0;font-size:14px;color:#94a3b8">Your upcoming maintenance tasks</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px 32px">
                <p style="margin:0 0 20px;font-size:15px;color:#334155">Hi ${user.name}, here's what's coming up:</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${taskRows}
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td style="padding:0 32px 28px">
                <a href="${appUrl}/dashboard" style="display:block;text-align:center;padding:12px;background:#16a34a;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none">
                  View Dashboard →
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #e2e8f0;background:#f8fafc">
                <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">
                  You're receiving this because you have a HomeWise account.
                  <a href="${unsubscribeUrl}" style="color:#64748b">Unsubscribe</a> &nbsp;·&nbsp;
                  <a href="${appUrl}/profile" style="color:#64748b">Manage preferences</a>
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>`

  await client.transactionalEmails.sendTransacEmail({
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: user.email }],
    subject: 'Your HomeWise Maintenance Reminder',
    htmlContent: html,
  })
}
