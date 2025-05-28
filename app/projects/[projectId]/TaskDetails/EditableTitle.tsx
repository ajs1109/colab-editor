import { secondaryBtnStyles, successBtnStyles } from '@/app/commonStyles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';

interface Props {
  title: string;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  onSave: (newTitle: string) => Promise<void>;
}

export const EditableTitle = ({
  title,
  isEditing,
  setIsEditing,
  onSave,
}: Props) => {
  const [text, setText] = useState(title);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(text);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save title:', error);
      // Optionally add error handling UI here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setText(title); // Reset to original title
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <>
        <div className="flex-grow mr-2">
          <Input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border border-gray-300 rounded p-1 h-8"
            disabled={isSaving}
          />
        </div>
        <div className="space-x-2">
          <Button
            onClick={handleSave}
            className={cn(successBtnStyles, 'px-2 md:px-4')}
            disabled={isSaving}
          >
            <span className="hidden md:inline">
              {isSaving ? 'Saving...' : 'Save'}
            </span>
            <span className="md:hidden">
              <Check className="w-3 h-3" />
            </span>
          </Button>
          <Button
            onClick={handleCancel}
            className={cn(secondaryBtnStyles, 'px-2 md:px-4')}
            disabled={isSaving}
          >
            <span className="hidden md:inline">Cancel</span>
            <span className="md:hidden">
              <X className="w-3 h-3" />
            </span>
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-grow items-center">
      <h1
        title={title}
        className="text-left text-sm sm:text-md md:text-2xl lg:text-3xl flex-grow truncate"
      >
        {text}
      </h1>
      <Button
        onClick={() => setIsEditing(true)}
        className={cn(secondaryBtnStyles, 'px-2 h-7 hidden md:inline-flex ')}
      >
        Edit
      </Button>
    </div>
  );
};
