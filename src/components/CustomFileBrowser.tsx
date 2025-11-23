import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Download, FolderOpen, File, ChevronLeft, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DriveFile {
  id: string;
  name: string;
  size: string;
  downloadUrl: string;
  mimeType: string;
  isFolder: boolean;
  path?: string;
}

interface CustomFileBrowserProps {
  userType: 'mobile' | 'business';
}

const CustomFileBrowser = ({ userType }: CustomFileBrowserProps) => {
  // Load saved path from localStorage
  const storageKey = `custom-drive-path-${userType}`;
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(() => {
    return localStorage.getItem(storageKey) || '';
  });
  const [pathHistory, setPathHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${storageKey}-history`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isNavigating, setIsNavigating] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Save path and history to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, currentPath);
    localStorage.setItem(`${storageKey}-history`, JSON.stringify(pathHistory));
  }, [currentPath, pathHistory, storageKey]);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (folderPath: string) => {
    try {
      setLoading(true);
      setIsNavigating(true);
      console.log('Fetching files from path:', folderPath);
      
      const { data, error } = await supabase.functions.invoke('fetch-drive-files', {
        body: { folderName: folderPath },
      });

      if (error) {
        console.error('Error fetching files:', error);
        toast.error('ফাইল লোড করতে সমস্যা হয়েছে');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setFiles([]);
        return;
      }

      console.log('Files received:', data?.files);
      setFiles(data?.files || []);
      
      if (!data?.files || data.files.length === 0) {
        toast.error('কোন ফাইল পাওয়া যায়নি');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('ফাইল লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
      setIsNavigating(false);
    }
  };

  const handleFolderClick = (folder: DriveFile) => {
    setPathHistory([...pathHistory, currentPath]);
    const segment = folder.path || folder.name;
    const newPath = currentPath ? `${currentPath}/${segment}` : segment;
    setCurrentPath(newPath);
  };

  const handleBackClick = () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(pathHistory.slice(0, -1));
      setCurrentPath(previousPath);
    }
  };

  const handleDownload = async (downloadUrl: string, fileName: string) => {
    setDownloadingFile(fileName);
    
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('ডাউনলোড শুরু হয়েছে');
      
      // Reset downloading state after a short delay
      setTimeout(() => setDownloadingFile(null), 1000);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('ডাউনলোড করতে সমস্যা হয়েছে');
      setDownloadingFile(null);
    }
  };

  const isFolder = (file: DriveFile) => {
    return file.isFolder || 
           file.mimeType === 'application/vnd.google-apps.folder' || 
           file.mimeType === 'folder';
  };

  // Sort files
  const sortFiles = (filesToSort: DriveFile[]) => {
    const sorted = [...filesToSort].sort((a, b) => {
      const aIsFolder = isFolder(a);
      const bIsFolder = isFolder(b);
      
      // Always put folders first
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;

      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'bn');
      } else if (sortBy === 'size') {
        const sizeA = parseInt(a.size) || 0;
        const sizeB = parseInt(b.size) || 0;
        comparison = sizeA - sizeB;
      } else if (sortBy === 'date') {
        // If date info is available, use it here
        comparison = a.name.localeCompare(b.name, 'bn');
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  };

  const sortedFiles = sortFiles(files);

  // Skeleton Loading UI for better perceived performance
  if (loading && files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-24" />
          </div>
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      {isNavigating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">ফাইল লোড হচ্ছে...</p>
          </div>
        </div>
      )}
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {userType === 'mobile' ? '📱 মোবাইল ড্রাইভ' : '📂 বিজনেস ড্রাইভ'}
            </CardTitle>
            {currentPath && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackClick}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                ফিরে যান
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            {currentPath && (
              <p className="text-sm text-muted-foreground">
                পথ: /{currentPath}
              </p>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Select value={sortBy} onValueChange={(value: 'name' | 'size' | 'date') => setSortBy(value)}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">নাম অনুযায়ী</SelectItem>
                  <SelectItem value="size">সাইজ অনুযায়ী</SelectItem>
                  <SelectItem value="date">তারিখ অনুযায়ী</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-9 px-3"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center p-8">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">কোনো ফাইল পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedFiles.map((file) => {
              const fileIsFolder = isFolder(file);
              
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {fileIsFolder ? (
                      <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium break-words">{file.name}</p>
                      {file.size && file.size !== '0' && (
                        <p className="text-sm text-muted-foreground">{file.size}</p>
                      )}
                    </div>
                  </div>
                  
                  {fileIsFolder ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFolderClick(file)}
                      className="gap-2 flex-shrink-0"
                    >
                      খুলুন
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDownload(file.downloadUrl, file.name)}
                      className="gap-2 flex-shrink-0"
                      disabled={downloadingFile === file.name}
                    >
                      {downloadingFile === file.name ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      ডাউনলোড
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomFileBrowser;
