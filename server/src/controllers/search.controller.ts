import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Advanced search for persons with multiple filters
export const searchPersons = async (req: Request, res: Response) => {
  try {
    const {
      query,
      firstName,
      lastName,
      email,
      tags,
      fromDate,
      toDate,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};
    const filters: any[] = [];

    // General search query across multiple fields
    if (query) {
      filters.push({
        OR: [
          { firstName: { contains: query as string } },
          { lastName: { contains: query as string } },
          { email: { contains: query as string } },
          { phone: { contains: query as string } },
          { address: { contains: query as string } },
          { tags: { contains: query as string } },
          { notes: { contains: query as string } }
        ]
      });
    }

    // Specific field filters
    if (firstName) {
      filters.push({ firstName: { contains: firstName as string } });
    }

    if (lastName) {
      filters.push({ lastName: { contains: lastName as string } });
    }

    if (email) {
      filters.push({ email: { contains: email as string } });
    }

    if (tags) {
      filters.push({ tags: { contains: tags as string } });
    }

    // Date range filter
    if (fromDate || toDate) {
      const dateFilter: any = {};
      
      if (fromDate) {
        dateFilter.gte = new Date(fromDate as string);
      }
      
      if (toDate) {
        dateFilter.lte = new Date(toDate as string);
      }
      
      filters.push({ createdAt: dateFilter });
    }

    // Combine all filters with AND logic
    if (filters.length > 0) {
      where.AND = filters;
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
    console.error('Search persons error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get person statistics
export const getPersonStats = async (req: Request, res: Response) => {
  try {
    // Total count of persons
    const totalPersons = await prisma.person.count();
    
    // Count persons created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPersons = await prisma.person.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    // Count active records (records with email and phone)
    const activePersons = await prisma.person.count({
      where: {
        AND: [
          { email: { not: null } },
          { phone: { not: null } },
          { email: { not: "" } },
          { phone: { not: "" } }
        ]
      }
    });
    
    // Count incomplete records (missing email or phone)
    const incompletePersons = await prisma.person.count({
      where: {
        OR: [
          { email: null },
          { phone: null },
          { email: "" },
          { phone: "" }
        ]
      }
    });
    
    // Count persons by tags (top 5)
    const personsWithTags = await prisma.person.findMany({
      where: {
        tags: {
          not: null
        }
      },
      select: {
        tags: true
      }
    });
    
    const tagCounts: Record<string, number> = {};
    
    personsWithTags.forEach((person: { tags: string | null }) => {
      if (person.tags) {
        const tags = person.tags.split(',').map(tag => tag.trim());
        tags.forEach(tag => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });
    
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    
    return res.status(200).json({
      stats: {
        totalPersons,
        recentPersons,
        activePersons,
        incompletePersons,
        topTags
      }
    });
  } catch (error) {
    console.error('Get person stats error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get demographic statistics
export const getDemographicStats = async (req: Request, res: Response) => {
  try {
    // Get all persons with their data
    const persons = await prisma.person.findMany({
      select: {
        dateOfBirth: true,
        address: true,
        notes: true,
        phone: true,
        email: true,
      }
    });

    console.log('Fetched persons for demographics:', persons.length);

    // Calculate gender distribution from notes field
    const genderStats = { Male: 0, Female: 0, Other: 0 };
    persons.forEach(person => {
      if (person.notes) {
        const genderMatch = person.notes.match(/Gender:\s*(\w+)/i);
        if (genderMatch) {
          const gender = genderMatch[1].toLowerCase();
          if (gender === 'male') genderStats.Male++;
          else if (gender === 'female') genderStats.Female++;
          else genderStats.Other++;
        }
      }
    });

    console.log('Gender stats:', genderStats);

    // Calculate age groups
    const ageGroups = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '55+': 0 };
    const currentYear = new Date().getFullYear();
    
    persons.forEach(person => {
      if (person.dateOfBirth) {
        const birthYear = new Date(person.dateOfBirth).getFullYear();
        const age = currentYear - birthYear;
        
        if (age >= 18 && age <= 25) ageGroups['18-25']++;
        else if (age >= 26 && age <= 35) ageGroups['26-35']++;
        else if (age >= 36 && age <= 45) ageGroups['36-45']++;
        else if (age >= 46 && age <= 55) ageGroups['46-55']++;
        else if (age > 55) ageGroups['55+']++;
      }
    });

    console.log('Age groups:', ageGroups);

    // Calculate city distribution from address field
    const cityStats: Record<string, number> = {};
    persons.forEach(person => {
      if (person.address && person.address.trim() !== '') {
        // Extract city from address (assuming format: "street, city, state zip")
        const addressParts = person.address.split(',');
        if (addressParts.length >= 2) {
          const city = addressParts[1].trim();
          if (city) {
            cityStats[city] = (cityStats[city] || 0) + 1;
          }
        }
      }
    });

    // Get top 5 cities
    const topCities = Object.entries(cityStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    console.log('Top cities:', topCities);

    // Calculate contact completeness - use actual phone and email fields
    const totalPersons = persons.length;
    const withPhone = persons.filter(p => p.phone && p.phone.trim() !== '').length;
    const withEmail = persons.filter(p => p.email && p.email.trim() !== '').length;
    const withAddress = persons.filter(p => p.address && p.address.trim() !== '').length;

    console.log('Contact completeness:', { total: totalPersons, phone: withPhone, email: withEmail, address: withAddress });

    const result = {
      demographics: {
        gender: genderStats,
        ageGroups,
        topCities,
        contactCompleteness: {
          total: totalPersons,
          phone: withPhone,
          email: withEmail,
          address: withAddress
        }
      }
    };

    console.log('Final demographics result:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Get demographic stats error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Total count of persons
    const totalPersons = await prisma.person.count();
    
    // Count persons created in the last 7 days (this week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newThisWeek = await prisma.person.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });
    
    // Count active searches (activities with search in details)
    const activeSearches = await prisma.activityLog.count({
      where: {
        details: {
          contains: 'search'
        }
      }
    });
    
    // Count searches from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysSearches = await prisma.activityLog.count({
      where: {
        AND: [
          {
            details: {
              contains: 'search'
            }
          },
          {
            timestamp: {
              gte: today
            }
          }
        ]
      }
    });

    console.log('Dashboard stats:', { totalPersons, newThisWeek, activeSearches, todaysSearches });

    return res.status(200).json({
      dashboardStats: {
        totalRecords: totalPersons,
        newThisWeek: newThisWeek,
        activeSearches: todaysSearches, // Using today's searches as "active"
        totalSearches: activeSearches   // Total searches for reference
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};