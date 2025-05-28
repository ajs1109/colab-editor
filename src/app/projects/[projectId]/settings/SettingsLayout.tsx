'use client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ProjectAction } from '@/consts';
import { useProjectAccess } from '@/hooks/useProjectAccess';
import { cn } from '@/lib/utils';
import {
  ArrowDownNarrowWide,
  ArrowLeft,
  Kanban,
  LineChart,
  Menu,
  Proportions,
  Settings,
  Tags,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const navigationItems: (
  | 'separator'
  | {
      label: string;
      link: string;
      icon: JSX.Element;
      minRole?: Role;
    }
)[] = [
  {
    label: 'Project settings',
    link: '/settings',
    icon: <Settings className="h-4 w-4" />,
    minRole: 'admin',
  },
  {
    label: 'Manage access',
    link: '/settings/access',
    icon: <Users className="h-4 w-4" />,
    minRole: 'admin',
  },
  'separator',
  {
    label: 'Label',
    link: '/settings/labels',
    icon: <Tags className="h-4 w-4" />,
    minRole: 'admin',
  },
  {
    label: 'Status',
    link: '/settings/statuses',
    icon: <Kanban className="h-4 w-4" />,
    minRole: 'admin',
  },
  {
    label: 'Priority',
    link: '/settings/priorities',
    icon: <ArrowDownNarrowWide className="h-4 w-4" />,
    minRole: 'admin',
  },
  {
    label: 'Size',
    link: '/settings/sizes',
    icon: <Proportions className="h-4 w-4" />,
    minRole: 'admin',
  },
];

interface Props {
  title: string;
  children: ReactNode;
}
export const SettingsLayout = ({ title, children }: Props) => {
  const pathname = usePathname();
  const params = useParams();
  const { can } = useProjectAccess({
    projectId: params.projectId as string,
  });

  return (
    <div className="grid h-minus-80 w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r 0 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 dark:bg-gray-950">
            <Link
              href={`/projects/${params.projectId}`}
              className="flex items-center gap-2 font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="mx-2">Settings</span>
            {can(ProjectAction.VIEW_SETTINGS) && (
              <Link
                href={`/projects/${params.projectId}/insights`}
                className="ml-auto"
              >
                <Button
                  title="Insights"
                  variant="outline"
                  size="icon"
                  className="ml-auto h-8 w-8"
                >
                  <LineChart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </Link>
            )}
          </div>
          <div className="flex-1 ">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navigationItems.map((item, i) =>
                item === 'separator' ? (
                  <Separator key={i} className="my-2" />
                ) : can(ProjectAction.UPDATE_OPTIONS) ? (
                  <Link
                    key={item.link}
                    href={`/projects/${params.projectId}${item.link}`}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      pathname === `/projects/${params.projectId}${item.link}`
                        ? 'bg-muted  text-gray-800 dark:text-gray-200'
                        : ''
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <div
                    key={item.link}
                    className="flex items-center gap-3 text-muted-foreground px-3 py-2"
                    title={`You do not have permission to access ${item.label}`}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                )
              )}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6 dark:bg-gray-950">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 ">
                <Link
                  href="/projects/1234"
                  className="flex items-center gap-2 font-semibold"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <span className="mx-2">Settings</span>
                {can(ProjectAction.VIEW_SETTINGS) && (
                  <Link href="/projects/1234/insights" className="ml-auto">
                    <Button
                      title="Insights"
                      variant="outline"
                      size="icon"
                      className="ml-auto h-8 w-8"
                    >
                      <LineChart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </Link>
                )}
              </div>

              <nav className="grid gap-2 text-lg font-medium">
                {navigationItems.map((item, i) =>
                  item === 'separator' ? (
                    <Separator key={i} className="my-2" />
                  ) : can(ProjectAction.VIEW_SETTINGS) ? (
                    <Link
                      key={item.link}
                      href={item.link}
                      className={cn(
                        'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-1 text-muted-foreground hover:text-foreground',
                        pathname === item.link ? 'bg-muted' : ''
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ) : (
                    <div
                      key={item.link}
                      className="flex items-center gap-3 text-muted-foreground px-3 py-2"
                      title={`You do not have permission to access ${item.label}`}
                    >
                      {item.icon}
                      {item.label}
                    </div>
                  )
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
        </header>
        <main>
          <div className="h-full p-10">{children}</div>
        </main>
      </div>
    </div>
  );
};
