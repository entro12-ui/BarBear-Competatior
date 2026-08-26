export async function sendVoteVerificationEmail(params: {
  to: string;
  name: string;
  code: string;
  competitionName: string;
}): Promise<{ sent: boolean; mode: "resend" | "dev" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? "Barbear Voting <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(
      `[vote-otp] Dev mode OTP for ${params.to}: ${params.code} (${params.competitionName})`
    );
    return { sent: false, mode: "dev" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: `Your voting code for ${params.competitionName}`,
      html: `
        <div style="font-family: Georgia, serif; color: #1a1614; line-height: 1.6;">
          <h1 style="font-size: 22px;">Confirm your vote</h1>
          <p>Hi ${params.name},</p>
          <p>Use this verification code to confirm your vote in <strong>${params.competitionName}</strong>:</p>
          <p style="font-size: 32px; letter-spacing: 8px; font-weight: 700;">${params.code}</p>
          <p>This code expires in 15 minutes. If you did not request this, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to send verification email: ${body}`);
  }

  return { sent: true, mode: "resend" };
}
