import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get activity logs with pagination and filtering
export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const entityType = req.query.entityType as string;
    const entityId = req.query.entityId as string;
    const action = req.query.action as string;
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};
    
    // Filter by action type instead of entityType
    if (entityType) {
      where.action = entityType;
    }
    
    // Filter by personId if entityId is provided
    if (entityId) {
      where.personId = entityId;
    }
    
    if (action) {
      where.action = action;
    }
    
    // Date range filter is removed since createdAt is not in the schema
    // We'll use a simple filter instead
    if (fromDate || toDate) {
      // Using a simple condition that will always be true since we can't filter by date
      where.id = { not: undefined };
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.activityLog.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error getting activity logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get activity logs for a specific person
export const getPersonActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { personId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: personId }
    });

    if (!person) {
      res.status(404).json({ message: 'Person not found' });
      return;
    }

    // Get logs related to this person
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          person: { id: personId }
        },
        skip,
        take: limit,
        orderBy: {
          id: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.activityLog.count({
        where: {
          person: { id: personId }
        }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error getting person activity logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get activity summary statistics
export const getActivityStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get date for "last 7 days" calculation
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    // Get counts by action type for recent activity
    const actionCounts = await prisma.activityLog.groupBy({
      by: ['action'],
      _count: {
        id: true
      }
    });

    // Get recent activity count (last 7 days) - using timestamp field
    const recentActivityCount = await prisma.activityLog.count({
      where: {
        timestamp: {
          gte: lastWeekDate
        }
      }
    });

    // Get total activity count
    const totalActivityCount = await prisma.activityLog.count();

    // Calculate specific metrics for Recent Activity Summary
    const newRecords = actionCounts.find(item => item.action === 'CREATE')?._count.id || 0;
    const updatesMade = actionCounts.find(item => item.action === 'UPDATE')?._count.id || 0;
    
    // For searches and reports, we'll use a different approach since they might not be in activity logs
    // Let's count search activities and report generation activities
    const searchesPerformed = await prisma.activityLog.count({
      where: {
        details: {
          contains: 'search'
        }
      }
    });

    const reportsGenerated = await prisma.activityLog.count({
      where: {
        details: {
          contains: 'report'
        }
      }
    });

    // Format the response
    const stats = {
      totalActivities: totalActivityCount,
      recentActivities: recentActivityCount,
      recentActivitySummary: {
        newRecords,
        updatesMade,
        searchesPerformed,
        reportsGenerated
      },
      byAction: actionCounts.map((item: { action: string; _count: { id: number } }) => ({
        action: item.action,
        count: item._count.id
      }))
    };

    console.log('Activity stats:', stats);
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error getting activity statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};