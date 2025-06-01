"use client";

import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface EditorPanelProps {
  initialContent: string;
  language: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function EditorPanel({ initialContent, language, onSave, onCancel }: EditorPanelProps) {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="text-sm font-medium">Editing File</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onSave(content)}
          >
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={(value) => setContent(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>
      
      <div className="p-2 border-t border-border text-xs text-muted-foreground flex justify-between">
        <div>
          <Icons.info className="inline mr-1 h-3 w-3" />
          Editing mode
        </div>
        <div>{language.toUpperCase()}</div>
      </div>
    </div>
  );
}