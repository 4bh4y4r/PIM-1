import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a new person
export const createPerson = async (req: Request, res: Response) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      dateOfBirth, 
      tags, 
      notes 
    } = req.body;

    const userId = req.user.id;

    const person = await prisma.person.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        tags,
        notes,
        createdBy: { connect: { id: userId } }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        details: `Created person: ${firstName} ${lastName}`,
        user: { connect: { id: userId } },
        person: { connect: { id: person.id } }
      }
    });

    return res.status(201).json({ 
      message: 'Person created successfully', 
      person 
    });
  } catch (error) {
    console.error('Create person error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all persons with pagination and filtering
export const getPersons = async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};
    
    // Add user-specific filter unless user is admin
    if (req.user.role !== 'ADMIN') {
      where.createdById = req.user.id;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { email: { contains: search as string } },
        { tags: { contains: search as string } }
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.person.count({ where });

    // Get persons with pagination and sorting
    const persons = await prisma.person.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      persons,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Get persons error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get person by ID
export const getPersonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        groups: {
          include: {
            group: true
          }
        }
      }
    });

    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    return res.status(200).json({ person });
  } catch (error) {
    console.error('Get person by ID error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update person
export const updatePerson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      dateOfBirth, 
      tags, 
      notes 
    } = req.body;

    // Check if person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id }
    });

    if (!existingPerson) {
      return res.status(404).json({ message: 'Person not found' });
    }

    // Update person
    const updatedPerson = await prisma.person.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        tags,
        notes
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        details: `Updated person: ${firstName} ${lastName}`,
        user: { connect: { id: userId } },
        person: { connect: { id: id } }
      }
    });

    return res.status(200).json({ 
      message: 'Person updated successfully', 
      person: updatedPerson 
    });
  } catch (error) {
    console.error('Update person error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete person
export const deletePerson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id }
    });

    if (!existingPerson) {
      return res.status(404).json({ message: 'Person not found' });
    }

    // Log activity before deletion
    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        details: `Deleted person: ${existingPerson.firstName} ${existingPerson.lastName}`,
        user: { connect: { id: userId } }
      }
    });

    // Delete person
    await prisma.person.delete({
      where: { id }
    });

    return res.status(200).json({ 
      message: 'Person deleted successfully' 
    });
  } catch (error) {
    console.error('Delete person error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};