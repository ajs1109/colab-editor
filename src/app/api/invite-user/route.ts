import { InviteUserEmail } from '@/emails/invite-user';
import { NextResponse } from 'next/server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, username, projectName, invitedByUsername, projectId, role } =
      await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Colab Editor <noreply@mrshadrack.com>',
      to,
      subject: 'Invitation to join a project',
      react: InviteUserEmail({
        username,
        projectName,
        invitedByUsername,
        inviteLink: `${request.headers.get('origin')}/invites/${projectId}?role=${role}`,
      }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
