// MODULE: Department & Faculty Management Page - Organizes and displays departments, faculties, and potential leaders for campus organization.
import React from 'react'; // this is a line that imports React because it is needed to build the component
import prisma from '@/lib/prisma'; // this is a line that imports the database tool because we need to fetch academic structure data
import { AdminDepartmentsClient } from './AdminDepartmentsClient'; // this is a line that imports the interactive interface for managing departments because it allows for creating and editing them

export const dynamic = 'force-dynamic';

export default async function AdminDepartmentsPage() { // this is a line that defines the page function because it loads the organizational data for the campus
  const [departments, faculties, potentialHeads] = await Promise.all([ // this is a line that performs three database lookups at once because we need a complete picture of the school structure
    prisma.department.findMany({ // this is a line that gets all departments because we need to list them for the admin
      include: { // this is a line that asks for extra info related to each department because a department has a parent faculty and a leader
        faculty: { select: { id: true, name: true, code: true } }, // this is a line that gets the name of the faculty it belongs to because it shows the hierarchy
        head: { select: { firstName: true, surname: true } }, // this is a line that gets the name of the department head because it shows who is in charge
        _count: { select: { courses: true, users: true } }, // this is a line that counts how many courses and users are in each department because it shows the department's size
      }, // this is a line that ends the extra info request
      orderBy: { name: 'asc' }, // this is a line that sorts departments alphabetically because it's easiest for users to browse
    }), // this is a line that finishes the department search
    prisma.faculty.findMany({ // this is a line that gets all faculties because they are the top-level categories for departments
      include: { // this is a line that asks for extra info for each faculty because a faculty has a dean and multiple departments
        dean: { select: { firstName: true, surname: true } }, // this is a line that gets the dean's name because they are the faculty leader
        _count: { select: { departments: true } }, // this is a line that counts how many departments are in each faculty because it shows its complexity
      }, // this is a line that ends the faculty extra info request
      orderBy: { name: 'asc' }, // this is a line that sorts faculties by name because it maintains a consistent order
    }), // this is a line that finishes the faculty search
    prisma.user.findMany({ // this is a line that finds all potential leaders because we need a list of people who can be heads or deans
      where: { // this is a line that filters the user list because only certain roles can be leaders
        role: { in: ['LECTURER', 'ADMIN', 'SUPERADMIN'] }, // this is a line that only includes teachers and admins because students cannot lead a department
        isActive: true, // this is a line that only includes people who are currently working because you can't assign a leader who is inactive
      }, // this is a line that ends the leader filtering
      select: { // this is a line that gets basic info for these potential leaders because it's all we need for a name list
        id: true, // this is a line that gets their unique ID because it identifies them in the database
        firstName: true, // this is a line that gets their first name because it's part of their identity
        surname: true, // this is a line that gets their last name because it completes their name
        email: true, // this is a line that gets their email because it helps identify them
        role: true, // this is a line that gets their current role because it provides context
      }, // this is a line that ends the selection of leader details
      orderBy: { firstName: 'asc' }, // this is a line that sorts potential leaders alphabetically because it makes finding a name in the list easier
    }), // this is a line that finishes the search for potential leaders
  ]); // this is a line that ends the parallel database fetching

  return ( // this is a line that returns the interactive management interface
    <AdminDepartmentsClient // this is a line that uses the department client component because it handles the display and editing logic
      initialDepartments={departments as any} // this is a line that passes the list of departments because the component needs data to show
      initialFaculties={faculties as any} // this is a line that passes the list of faculties because they are needed for categorization
      potentialHeads={potentialHeads} // this is a line that passes the list of potential leaders because it populates the "assign leader" dropdowns
    /> // this is a line that ends the component call
  ); // this is a line that finishes the visual description
} // this is a line that ends the department management page function
