'use client';

import { useEditorStore } from '@/lib/store';
import { MainWorkspace } from '@/components/workspace/MainWorkspace';
import { EditorProvider } from '@/components/editor/EditorProvider';
import { EditorLayout } from '@/components/editor/EditorLayout';

export default function Home() {
  const { currentProject } = useEditorStore();

  if (!currentProject) {
    return <MainWorkspace />;
  }

  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}
