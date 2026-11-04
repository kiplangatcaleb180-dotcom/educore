'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  FolderDown,
  FileText,
  Upload,
  Plus,
  X,
  File,
  CheckCircle2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  code: string;
  name: string;
}

interface Material {
  id: number;
  title: string;
  course: { code: string; name: string };
  mimeType: string | null;
  isPublic: boolean;
  createdAt: Date;
  filePath: string;
}

export default function LecturerMaterialsClient({
  courses,
  initialMaterials
}: {
  courses: Course[],
  initialMaterials: Material[]
}) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(true);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title || !courseId) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('courseId', String(courseId));
    formData.append('isPublic', String(isPublic));

    try {
      const res = await fetch('/api/lecturer/materials', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowUploadModal(false);
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setCourseId('');
        router.refresh();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      alert('Error uploading material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Course Materials & Library</h1>
          <p className="text-xs text-slate-400 mt-1">Upload lecture slides, notes, and reference files for students</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info" className="px-3 py-1">
            {initialMaterials.length} Uploaded Resources
          </Badge>
          <Button onClick={() => setShowUploadModal(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> Upload Material
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Resource Title</th>
                <th>Course</th>
                <th>File Type</th>
                <th>Visibility</th>
                <th>Uploaded</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {initialMaterials.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">{m.title}</span>
                    </div>
                  </td>
                  <td className="text-slate-300">{m.course.code}</td>
                  <td><Badge variant="secondary">{m.mimeType?.split('/')[1]?.toUpperCase() || 'PDF'}</Badge></td>
                  <td>
                    <Badge variant={m.isPublic ? 'success' : 'secondary'}>
                      {m.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </td>
                  <td className="text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td>
                    <a href={m.filePath} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </td>
                </tr>
              ))}
              {initialMaterials.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No course materials uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 space-y-6 relative border-indigo-500/30">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Upload Learning Material</h2>
              <p className="text-xs text-slate-400 mt-1">Select a unit and upload your lecture notes or slides.</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">Choose Unit...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Week 1: Introduction to Data Structures"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">File</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-indigo-500/50'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
                  }}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                      <span className="text-sm text-white font-medium">{selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-red-400 mt-2 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-10 h-10 text-slate-600 mb-2" />
                      <p className="text-sm text-slate-400">Click to browse or drag and drop</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1">PDF, DOCX, PPTX supported</p>
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="isPublic" className="text-sm text-slate-300">Make this material public for all enrolled students</label>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? 'Uploading...' : 'Publish Material'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
