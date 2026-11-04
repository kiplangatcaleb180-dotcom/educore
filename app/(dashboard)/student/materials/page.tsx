// Student Study Materials: A digital library where students can browse, view, and download educational resources uploaded by their instructors.
import React from 'react'; // this is a line that imports the React library because it is needed to build the study materials page
import prisma from '@/lib/prisma'; // this is a line that imports the database client because it is needed to fetch resources from the database
import { getServerSession } from 'next-auth'; // this is a line that imports a function to get the current user session because we need to know who is logged in
import { authOptions } from '@/lib/auth'; // this is a line that imports authentication settings because they verify student access
import { Card } from '@/components/ui/Card'; // this is a line that imports a container component because it is used to hold each material item's details
import { Badge } from '@/components/ui/Badge'; // this is a line that imports a small label because it is used to show the file type
import { Button } from '@/components/ui/Button'; // this is a line that imports a button component because it allows students to view or download files
import { FolderDown, FileText, Download, ExternalLink } from 'lucide-react'; // this is a line that imports icons because they help visually identify files and actions like downloading

export default async function StudentMaterialsPage() { // this is a line that defines the main function for the materials page because it is responsible for listing available resources
  const session = await getServerSession(authOptions); // this is a line that retrieves the current login session because we need the student's unique ID
  const userObj = session?.user as any; // this is a line that extracts user details because we need to know their enrolled courses
  const studentId = userObj?.id ? Number(userObj.id) : null; // this is a line that converts the user ID to a number because that matches the database format

  if (!studentId) return null; // this is a line that prevents the page from loading if there is no student ID because we cannot show data for an anonymous user

  // Fetch materials for courses the student is enrolled in
  const materials = await prisma.material.findMany({ // this is a line that fetches all materials that are marked as public and belong to the student's courses because students should only see their own course content
    where: {
      course: { enrollments: { some: { studentId } } },
      isPublic: true,
    },
    include: { // this is a line that includes related course and uploader information because we want to show who shared the file and for which unit
      course: true,
      uploader: { select: { firstName: true, surname: true } }
    },
    orderBy: { createdAt: 'desc' }, // this is a line that sorts the materials by the date they were uploaded because new content should appear first
  });

  return ( // this is a line that starts building the visual layout because it defines how the library of materials will look in the browser
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Study Library</h1>
          <p className="text-sm text-slate-400 mt-1">Access lecture slides, notes, and study resources for your units</p>
        </div>
        <Badge variant="info" className="px-4 py-1.5 text-xs font-bold">
          {materials.length} Resources Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((m) => ( // this is a line that loops through each material found because we need to create a card for every resource
          <Card key={m.id} className="p-5 flex flex-col hover:border-indigo-500/40 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {m.mimeType?.split('/')[1]?.toUpperCase() || 'PDF'}
              </Badge>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-white text-lg line-clamp-1">{m.title}</h3>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-1">
                {m.course.code} — {m.course.name}
              </p>
              <p className="text-xs text-slate-500 mt-3 line-clamp-2 italic">
                {m.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[10px] text-slate-500 font-medium">
                Uploaded: {new Date(m.createdAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <a href={m.filePath} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5 border-slate-700 hover:bg-indigo-500/10 hover:text-indigo-400">
                    <ExternalLink className="w-3.5 h-3.5" /> View
                  </Button>
                </a>
                <a href={m.filePath} download={m.title}>
                  <Button size="sm" className="h-8 px-3 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700">
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        ))}

        {materials.length === 0 && ( // this is a line that shows an empty state message if no files are found because it explains to the student why they see nothing
          <div className="col-span-full py-24 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
            <FolderDown className="w-16 h-16 mx-auto opacity-10 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Your Study Library is empty</h3>
            <p className="max-w-xs mx-auto mt-2 text-sm">Once your lecturers upload notes or slides for your enrolled units, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
