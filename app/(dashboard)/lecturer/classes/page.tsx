/**
 * MODULE TITLE: Lecturer Classes Page
 * This file is responsible for displaying all the courses assigned to the logged-in lecturer.
 * It also fetches information about any ongoing live class sessions, allowing the lecturer
 * to jump into a virtual classroom quickly.
 */

import React from 'react'; // this is a line that imports React because it's needed to build the user interface components.
import { getServerSession } from 'next-auth'; // this is a line that imports the session tool because we need to know which lecturer is viewing this page.
import { authOptions } from '@/lib/auth'; // this is a line that imports the login configuration because it's used to verify the user's identity.
import prisma from '@/lib/prisma'; // this is a line that imports the database connection because it allows the app to fetch class information.
import { ClassesClient } from './ClassesClient'; // this is a line that imports the visual part of the classes page because it handles how the data is displayed to the user.

export default async function LecturerClassesPage() { // this is a line that defines the main function for the classes page because it contains the data-fetching logic.
  const session = await getServerSession(authOptions); // this is a line that retrieves the current login session because we need the lecturer's unique details.
  const userObj = session?.user as any; // this is a line that converts the session user info into a usable object because we need to access the "id" property.
  const lecturerId = userObj?.id ? Number(userObj.id) : null; // this is a line that gets the lecturer's ID as a number because the database uses numbers for IDs.

  // Query assigned courses for this lecturer
  const assignedCourses = await prisma.course.findMany({ // this is a line that asks the database for every course this lecturer is teaching because it populates their class list.
    where: lecturerId ? { lecturerId } : {}, // this is a line that filters the search to only show courses for this lecturer because we don't want to list classes they don't teach.
    include: { // this is a line that tells the database to bring back extra related details because we need to show department names and student counts.
      department: { select: { name: true } }, // this is a line that specifically grabs the department name because it helps identify the course's academic area.
      _count: { select: { enrollments: true } }, // this is a line that counts how many students are signed up for each course because it's an important metric.
    },
    orderBy: { createdAt: 'desc' }, // this is a line that sorts the courses by the date they were created because it shows the most recent ones first.
  });

  const formattedCourses = assignedCourses.map((c) => ({ // this is a line that cleans up the database data into a simpler format because the visual component expects specific names for each piece of info.
    id: c.id,
    code: c.code,
    name: c.name,
    department: c.department,
    credits: c.credits,
    enrollmentsCount: c._count.enrollments,
    scheduleDay: c.scheduleDay,
    scheduleTime: c.scheduleTime,
    room: c.room,
    syllabusProgress: c.syllabusProgress,
  }));

  // Query active live class sessions for this lecturer
  const activeLiveClasses = await prisma.liveClass.findMany({ // this is a line that searches for any virtual classes currently in progress because the lecturer might need to join them.
    where: { // this is a line that sets the conditions for finding live classes because we only want specific ones.
      lecturerId: lecturerId || 0, // this is a line that filters for live classes belonging to this lecturer because it's personalized.
      status: 'ACTIVE', // this is a line that only searches for sessions that are currently "ACTIVE" because we don't care about old ones here.
    },
    include: { course: true }, // this is a line that includes the course details for the live class because we need to know which class is live.
    orderBy: { startedAt: 'desc' }, // this is a line that sorts by start time because the most recently started one is likely the most relevant.
  });

  return <ClassesClient courses={formattedCourses} activeLiveClasses={activeLiveClasses} />; // this is a line that sends all the gathered data to the visual component because it will actually draw the page for the lecturer.
}
