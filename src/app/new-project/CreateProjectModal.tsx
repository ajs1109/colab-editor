'use client';

import { CreateCustomFieldOptionModal } from '@/components/CreateCustomFieldOptionModal';
import { CreateOrEditLabelForm } from '@/components/CreateOrEditLabelForm';
import { CustomFieldOptions } from '@/components/CustomFieldOptions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  defaultLabels,
  defaultPriorities,
  defaultSizes,
  defaultStatuses,
} from '@/constants/default-options';
import { useModalDialog } from '@/hooks/useModalDialog';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { v4 as uid } from 'uuid';
import { secondaryBtnStyles, successBtnStyles } from '../commonStyles';
import { LabelList } from '../projects/[projectId]/settings/labels/LabelList';
import { useRouter } from 'next/navigation';
import { projects } from '@/utils/projects';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/apiClient';

interface Props {
  projectDetails: {
    name: string;
    description: string;
    readme: string;
    is_public?: boolean;
  };
}

export const CreateProjectModal = ({ projectDetails }: Props) => {
  const { isModalOpen, openModal, closeModal } = useModalDialog();
  const router = useRouter();
  const { toast } = useToast();
  const [statuses, setStatuses] = useState(defaultStatuses);
  const [sizes, setSizes] = useState(defaultSizes);
  const [priorities, setPriorities] = useState(defaultPriorities);
  const [labels, setLabels] = useState(defaultLabels);
  const [showNewLabelCard, setShowNewLabelCard] = useState(false);
  const [skipDefaultOptions, setSkipDefaultOption] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const AddNewOptionBtn = (
    <Button className={cn(secondaryBtnStyles, 'h-7 px-2 rounded-sm mr-2')}>
      <Plus className="w-4 h-4 mr-1" />
      New
    </Button>
  );

  const handleAddNewOptionItem = (
    data: Omit<ICustomFieldData, 'id'>,
    state: CustomFieldDBTableName
  ) => {
    switch (state) {
      case 'sizes':
        setSizes([...sizes, { id: uid(), ...data }]);
        break;
      case 'priorities':
        setPriorities([...priorities, { id: uid(), ...data }]);
        break;
      case 'statuses':
        setStatuses([...statuses, { id: uid(), ...data }]);
        break;
      default:
        break;
    }
  };

  const handleAddNewLabelItem = (data: ICustomFieldData) => {
    setLabels([...labels, data]);
    setShowNewLabelCard(false);
  };

  const handleRemoveLabelItem = (id: string) => {
    setLabels(labels.filter((item) => item.id !== id));
  };

  const handleCreateProject = async () => {
    try {
      setIsCreating(true);
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const projectData = {
        ...projectDetails,
        ...({}),
      };

      const project = await projects.management.create(
        projectData as ProjectWithOptions,
        session.user.id
      );

      toast({
        title: 'Success',
        description: 'Project created successfully',
      });

      closeModal();
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create project. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
              onClick={handleCreateProject}
              className={cn(successBtnStyles, 'w-28')}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
  );
};
