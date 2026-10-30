'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Plus,
  FolderOpen,
  FileText,
  MoreHorizontal,
  Trash2,
  Copy,
  Share2,
  Download,
  Eye,
  Edit,
  ChevronRight,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { Project } from '@/types';

interface ProjectListProps {
  searchQuery: string;
}

export function ProjectList({ searchQuery }: ProjectListProps) {
  const { projects, currentProject, setCurrentProject, deleteProject, duplicateProject } = useEditorStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const filteredProjects = projects.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project);
  };

  const handleDuplicate = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    duplicateProject(project.id);
  };

  const handleDelete = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (confirm(`Delete "${project.name}"?`)) {
      deleteProject(project.id);
    }
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <FolderOpen className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="font-medium mb-2">No projects yet</h3>
        <p className="text-sm max-w-xs">Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredProjects.map((project) => (
        <div
          key={project.id}
          className={cn(
            'group relative rounded-lg p-2 transition-colors cursor-pointer',
            currentProject?.id === project.id
              ? 'bg-primary/10 border border-primary/30'
              : 'hover:bg-accent'
          )}
          onClick={() => handleProjectClick(project)}
          onMouseEnter={() => setHoveredProject(project.id)}
          onMouseLeave={() => setHoveredProject(null)}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                currentProject?.id === project.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{project.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {project.canvasSize.width}×{project.canvasSize.height} •{' '}
                {project.elements.length} elements •{' '}
                {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleDuplicate(e, project)}
                className="p-1.5 rounded hover:bg-accent transition-colors"
                title="Duplicate"
                aria-label="Duplicate project"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => handleDelete(e, project)}
                className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                title="Delete"
                aria-label="Delete project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}