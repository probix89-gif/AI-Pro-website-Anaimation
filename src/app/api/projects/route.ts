import { NextRequest, NextResponse } from 'next/server';

const projects: any[] = [];

export async function GET() {
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  try {
    const project = await request.json();
    project.id = project.id || `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    project.createdAt = project.createdAt || Date.now();
    project.updatedAt = Date.now();
    projects.push(project);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid project data' }, { status: 400 });
  }
}