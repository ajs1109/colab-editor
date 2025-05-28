'use client';
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

interface Props {
  value?: Role;
  onValueChange?: (value: Role) => void;
  disabled?: boolean;
}

export const RoleSelect = ({ value, onValueChange, disabled }: Props) => {
  const getRole = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'write':
        return 'Write';
      case 'read':
        return 'Read';
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-[120px] h-8 focus:ring-0">
        <div className="flex text-xs">
          <span>Role: </span>
          <span className="font-bold mx-1">{getRole(value || 'read')}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="text-sm">
          <SelectItem value="admin">
            <div className="flex items-center">
              <div>
                <p>Admin</p>
                <p className="text-xs text-muted-foreground">
                  Can see, make changes to, and add new collaborators to this
                  project
                </p>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="write">
            <div className="flex items-center">
              <div>
                <p>Write</p>
                <p className="text-xs text-muted-foreground">
                  Can see and make changes to this project
                </p>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="read">
            <div className="flex items-center">
              <div>
                <p>Read</p>
                <p className="text-xs text-muted-foreground">
                  Can see this project
                </p>
              </div>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
