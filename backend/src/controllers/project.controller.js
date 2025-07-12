const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new project
async function createProject(req, res) {
  try {
    const data = req.body;
    const project = await prisma.project.create({ data });
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get all projects
async function getProjects(req, res) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: true,
        samples: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get project by ID
async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        samples: true
      }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: error.message });
  }
}

// Update project
async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data
    });
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
}

// Delete project
async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    await prisma.project.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
