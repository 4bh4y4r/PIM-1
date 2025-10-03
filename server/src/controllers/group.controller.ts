import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new group
export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = (req.user as any).id;

    if (!name) {
      res.status(400).json({ message: 'Group name is required' });
      return;
    }

    const group = await prisma.group.create({
      data: {
        name,
        description
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        details: `Group "${name}" created`,
        user: { connect: { id: userId } }
      }
    });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all groups with pagination
export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const skip = (page - 1) * limit;

    const where = search
      ? {
          name: {
            contains: search
          }
        }
      : {};

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          _count: {
            select: {
              members: true
            }
          }
        }
      }),
      prisma.group.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      groups,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error getting groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get group by ID
export const getGroupById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            person: true
          }
        }
      }
    });

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    res.status(200).json({ group });
  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update group
export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = (req.user as any).id;

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        name,
        description
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        details: `Group "${updatedGroup.name}" updated`,
        user: { connect: { id: userId } }
      }
    });

    res.status(200).json({
      message: 'Group updated successfully',
      group: updatedGroup
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete group
export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Delete all group members first
    await prisma.groupMember.deleteMany({
      where: { groupId: id }
    });

    // Delete the group
    await prisma.group.delete({
      where: { id }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        details: `Group "${existingGroup.name}" deleted`,
        user: { connect: { id: userId } }
      }
    });

    res.status(200).json({
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add person to group
export const addPersonToGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, personId } = req.params;
    const userId = (req.user as any).id;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: personId }
    });

    if (!person) {
      res.status(404).json({ message: 'Person not found' });
      return;
    }

    // Check if person is already in the group
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        personId
      }
    });

    if (existingMember) {
      res.status(400).json({ message: 'Person is already a member of this group' });
      return;
    }

    // Add person to group
    const groupMember = await prisma.groupMember.create({
      data: {
        groupId,
        personId
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        details: `Added ${person.firstName} ${person.lastName} to group "${group.name}"`,
        user: { connect: { id: userId } },
        person: { connect: { id: personId } }
      }
    });

    res.status(201).json({
      message: 'Person added to group successfully',
      groupMember
    });
  } catch (error) {
    console.error('Error adding person to group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove person from group
export const removePersonFromGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, personId } = req.params;
    const userId = (req.user as any).id;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: personId }
    });

    if (!person) {
      res.status(404).json({ message: 'Person not found' });
      return;
    }

    // Check if person is in the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        personId
      }
    });

    if (!groupMember) {
      res.status(404).json({ message: 'Person is not a member of this group' });
      return;
    }

    // Remove person from group
    await prisma.groupMember.delete({
      where: { id: groupMember.id }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        details: `Removed ${person.firstName} ${person.lastName} from group "${group.name}"`,
        user: { connect: { id: userId } },
        person: { connect: { id: person.id } }
      }
    });

    res.status(200).json({
      message: 'Person removed from group successfully'
    });
  } catch (error) {
    console.error('Error removing person from group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};