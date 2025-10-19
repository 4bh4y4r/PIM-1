import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Derive category tags from provided fields and notes
const deriveTags = (input: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string | null;
  dateOfBirth?: string | Date | null;
  notes?: string | null;
}) => {
  const categories: string[] = [];
  const notes = input.notes || '';
  if (
    (input.firstName && input.firstName.trim()) ||
    (input.lastName && input.lastName.trim()) ||
    (input.email && input.email.trim()) ||
    (input.phone && input.phone.trim()) ||
    input.dateOfBirth
  ) {
    categories.push('Personal');
  }
  if (input.address && input.address.trim() && input.address.trim() !== ',' && input.address.trim() !== ', ,') {
    categories.push('Address');
  }
  if (/National ID:\s*\S+/i.test(notes) || /Aadhaar/i.test(notes) || /PAN/i.test(notes) || /Passport/i.test(notes) || /Ration/i.test(notes)) {
    categories.push('Identification');
  }
  if (/Education:\s*\S+/i.test(notes) || /Occupation:\s*\S+/i.test(notes) || /Employer:\s*\S+/i.test(notes)) {
    categories.push('Education');
  }
  if (/Income:\s*\S+/i.test(notes) || /Bank Account:\s*\S+/i.test(notes) || /IFSC/i.test(notes) || /Tax Filing Status:\s*\S+/i.test(notes)) {
    categories.push('Financial');
  }
  if (/Health Info:\s*\S+/i.test(notes) || /Blood Group:\s*\S+/i.test(notes) || /Allergies:\s*\S+/i.test(notes) || /Medical Conditions:\s*\S+/i.test(notes)) {
    categories.push('Health');
  }
  // Ensure unique and stable order
  const seen = new Set<string>();
  return categories.filter((c) => (seen.has(c) ? false : (seen.add(c), true)));
};

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

    // Compute tags server-side to ensure consistent categories
    const computedTags = deriveTags({ firstName, lastName, email, phone, address, dateOfBirth, notes }).join(', ');

    // Safeguard notes size in case DB column has size limits (pre-migration)
    const MAX_NOTES_LENGTH = 180; // keep safely under common VARCHAR limits
    const safeNotes = notes ? String(notes).slice(0, MAX_NOTES_LENGTH) : null;

    const person = await prisma.person.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        tags: computedTags || tags,
        notes: safeNotes,
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
    // Compute tags server-side to ensure consistent categories
    const computedTags = deriveTags({ firstName, lastName, email, phone, address, dateOfBirth, notes }).join(', ');

    const MAX_NOTES_LENGTH_UPDATE = 180;
    const safeNotesUpdate = notes ? String(notes).slice(0, MAX_NOTES_LENGTH_UPDATE) : undefined;

    const updatedPerson = await prisma.person.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        tags: computedTags || tags,
        notes: safeNotesUpdate
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

// Backfill tags for existing records
export const backfillPersonTags = async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const where: any = {};
    if (!isAdmin) {
      where.createdById = req.user.id;
    }

    const persons = await prisma.person.findMany({ where });
    let updatedCount = 0;
    for (const p of persons) {
      const computed = deriveTags({
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email || undefined,
        phone: p.phone || undefined,
        address: p.address || undefined,
        dateOfBirth: p.dateOfBirth || undefined,
        notes: p.notes || undefined,
      }).join(', ');
      if (computed && computed !== (p.tags || '')) {
        await prisma.person.update({
          where: { id: p.id },
          data: { tags: computed }
        });
        updatedCount++;
      }
    }

    return res.status(200).json({ message: 'Backfill complete', updated: updatedCount, total: persons.length });
  } catch (error) {
    console.error('Backfill tags error:', error);
    return res.status(500).json({ message: 'Server error during backfill' });
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