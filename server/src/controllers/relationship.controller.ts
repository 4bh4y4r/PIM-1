import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new relationship between two persons
export const createRelationship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { personId, relatedPersonId, relationshipType, notes } = req.body;
    const userId = (req.user as any).id;

    if (!personId || !relatedPersonId || !relationshipType) {
      res.status(400).json({ message: 'Person IDs and relationship type are required' });
      return;
    }

    // Check if both persons exist
    const [person1, person2] = await Promise.all([
      prisma.person.findUnique({ where: { id: personId } }),
      prisma.person.findUnique({ where: { id: relatedPersonId } })
    ]);

    if (!person1 || !person2) {
      res.status(404).json({ message: 'One or both persons not found' });
      return;
    }

    // Check if relationship already exists
    const existingRelationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { personId, relatedPersonId },
          { personId: relatedPersonId, relatedPersonId: personId }
        ]
      }
    });

    if (existingRelationship) {
      res.status(400).json({ message: 'Relationship already exists between these persons' });
      return;
    }

    // Create relationship
    const relationship = await prisma.relationship.create({
      data: {
        personId,
        relatedPersonId,
        type: relationshipType
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        details: `Created ${relationshipType} relationship between ${person1.firstName} ${person1.lastName} and ${person2.firstName} ${person2.lastName}`,
        user: { connect: { id: userId } },
        person: { connect: { id: personId } }
      }
    });

    res.status(201).json({
      message: 'Relationship created successfully',
      relationship
    });
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all relationships for a person
export const getPersonRelationships = async (req: Request, res: Response): Promise<void> => {
  try {
    const { personId } = req.params;

    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: personId }
    });

    if (!person) {
      res.status(404).json({ message: 'Person not found' });
      return;
    }

    // Get relationships where person is either the primary or related person
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [
          { personId },
          { relatedPersonId: personId }
        ]
      },
      include: {
        person: true,
        relatedPerson: true
      }
    });

    // Format relationships for better readability
    const formattedRelationships = relationships.map((rel: any) => {
      // Determine if the requested person is the primary or related person
      const isPrimary = rel.personId === personId;
      
      return {
        id: rel.id,
        relationshipType: rel.relationshipType,
        notes: rel.notes,
        createdAt: rel.createdAt,
        updatedAt: rel.updatedAt,
        // Always show the other person in the relationship
        relatedPerson: isPrimary ? rel.relatedPerson : rel.person
      };
    });

    res.status(200).json({
      relationships: formattedRelationships
    });
  } catch (error) {
    console.error('Error getting relationships:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update relationship
export const updateRelationship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { relationshipType, notes } = req.body;
    const userId = (req.user as any).id;

    // Check if relationship exists
    const existingRelationship = await prisma.relationship.findUnique({
      where: { id },
      include: {
        person: true,
        relatedPerson: true
      }
    });

    if (!existingRelationship) {
      res.status(404).json({ message: 'Relationship not found' });
      return;
    }

    // Update relationship
    const updatedRelationship = await prisma.relationship.update({
      where: { id },
      data: {
        type: relationshipType
      },
      include: {
        person: true,
        relatedPerson: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        details: `Updated relationship between ${existingRelationship.person.firstName} ${existingRelationship.person.lastName} and ${existingRelationship.relatedPerson.firstName} ${existingRelationship.relatedPerson.lastName}`,
        user: { connect: { id: userId } },
        person: { connect: { id: existingRelationship.personId } }
      }
    });

    res.status(200).json({
      message: 'Relationship updated successfully',
      relationship: updatedRelationship
    });
  } catch (error) {
    console.error('Error updating relationship:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete relationship
export const deleteRelationship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;

    // Check if relationship exists
    const existingRelationship = await prisma.relationship.findUnique({
      where: { id },
      include: {
        person: true,
        relatedPerson: true
      }
    });

    if (!existingRelationship) {
      res.status(404).json({ message: 'Relationship not found' });
      return;
    }

    // Delete relationship
    await prisma.relationship.delete({
      where: { id }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        details: `Deleted relationship between ${existingRelationship.person.firstName} ${existingRelationship.person.lastName} and ${existingRelationship.relatedPerson.firstName} ${existingRelationship.relatedPerson.lastName}`,
        user: { connect: { id: userId } },
        person: { connect: { id: existingRelationship.personId } }
      }
    });

    res.status(200).json({
      message: 'Relationship deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting relationship:', error);
    res.status(500).json({ message: 'Server error' });
  }
};