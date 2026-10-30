'use client';

import { EditorProvider } from '@/components/editor/EditorProvider';
import { EditorLayout } from '@/components/editor/EditorLayout';

export default function Home() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}
