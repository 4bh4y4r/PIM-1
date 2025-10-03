import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getFileUrl } from '../utils/upload.utils';

const prisma = new PrismaClient();

// Upload profile image and update person record
export const uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { personId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
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

    // Get file URL
    const fileUrl = getFileUrl(file.filename);

    // Update person with profile image
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: { profileImage: fileUrl }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        details: 'Profile image updated',
        user: { connect: { id: (req.user as any).id } },
        person: { connect: { id: personId } }
      }
    });

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      person: updatedPerson
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};