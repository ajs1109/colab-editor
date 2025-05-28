import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface InviteUserEmailProps {
  username?: string;
  invitedByUsername?: string;
  projectName?: string;
  inviteLink?: string;
}

export const InviteUserEmail = ({
  username,
  invitedByUsername,
  projectName,
  inviteLink,
}: InviteUserEmailProps) => {
  const previewText = `Join ${projectName} on Colab Editor`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Join <strong>{projectName}</strong> on <strong>Colab Editor</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {username},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{invitedByUsername}</strong> has invited you to the{' '}
              <strong>{projectName}</strong> project on <strong>Colab Editor</strong>.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-green-500 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                Accept Invite
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Team at Colab Editor
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

InviteUserEmail.PreviewProps = {
  username: 'John Doe',
  invitedByUsername: 'Jane Doe',
  projectName: 'Enigma',
  inviteLink: 'https://projex.com/project/invite/foo',
} as InviteUserEmailProps;

export default InviteUserEmail;
