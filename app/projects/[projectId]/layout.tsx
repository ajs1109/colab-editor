import { ProjectLayoutClient } from './ProjectLayoutClient';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProjectLayoutClient />
      {children}
    </>
  );
}
