'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useEditorStore } from '@/lib/store';
import type { Project } from '@/types';

interface EditorContextType {
  initializeProject: (project?: Project) => void;
  isInitialized: boolean;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentProject, createProject, projects, setCurrentProject } = useEditorStore();

  const initializeProject = (project?: Project) => {
    if (project) {
      setCurrentProject(project);
    } else if (!currentProject && projects.length === 0) {
      createProject('Untitled Project');
    } else if (!currentProject && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
    setIsInitialized(true);
  };

  useEffect(() => {
    initializeProject();
  }, []);

  return (
    <EditorContext.Provider value={{ initializeProject, isInitialized }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
}