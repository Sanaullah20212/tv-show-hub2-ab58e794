import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Folder, Film, Image, FileText, File, Download, ArrowUpDown, Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { WORKER_CONFIG, getWorkerUrl } from '@/config/workerConfig';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DriveFile {
  name: string;
  size: string | null;
  isFolder: boolean;
  path: string;
  downloadPath: string | null;
  mimeType: string;
  fileId?: string;
  rawSize?: number;
}

interface DriveExplorerProps {
  userType: 'mobile' | 'business';
}

const DriveExplorer = ({ userType }: DriveExplorerProps) => {
  // Load saved path from localStorage
  const storageKey = `drive-path-${userType}`;
  const [currentPath, setCurrentPath] = useState(() => {
    return localStorage.getItem(storageKey) || '';
  });
  const [currentFolderName, setCurrentFolderName] = useState('রুট');
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Save path to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, currentPath);
  }, [currentPath, storageKey]);

  // Sort files
  const sortFiles = (filesToSort: DriveFile[]) => {
    const sorted = [...filesToSort].sort((a, b) => {
      // Always put folders first
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;

      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'bn');
      } else if (sortBy === 'size') {
        const sizeA = a.rawSize || 0;
        const sizeB = b.rawSize || 0;
        comparison = sizeA - sizeB;
      } else if (sortBy === 'date') {
        // If date info is available in the future, use it here
        comparison = a.name.localeCompare(b.name, 'bn');
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  };

  // Filter files based on search query
  const filterFiles = (filesToFilter: DriveFile[]) => {
    if (!searchQuery.trim()) return filesToFilter;
    
    const query = searchQuery.toLowerCase();
    return filesToFilter.filter(file => 
      file.name.toLowerCase().includes(query)
    );
  };

  const filteredAndSortedFiles = sortFiles(filterFiles(files));

  // Get icon based on file type with enhanced styling
  const getIcon = (mimeType: string, isFolder: boolean) => {
    if (isFolder) return <Folder className="h-6 w-6 text-amber-500" />;
    if (mimeType?.includes('video')) return <Film className="h-6 w-6 text-violet-500" />;
    if (mimeType?.includes('image')) return <Image className="h-6 w-6 text-emerald-500" />;
    if (mimeType?.includes('pdf')) return <FileText className="h-6 w-6 text-rose-500" />;
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('compressed')) {
      return <File className="h-6 w-6 text-orange-500" />;
    }
    return <File className="h-6 w-6 text-slate-500" />;
  };

  // Fetch files from Worker
  const fetchFiles = useCallback(async (path: string) => {
    setIsLoading(true);
    setIsNavigating(true);
    setError(null);

    const workerBaseUrl = getWorkerUrl(userType);
    const fullUrl = `${workerBaseUrl}${WORKER_CONFIG.GDI_PATH_PREFIX}${path}`;
    const headers = {
      'X-Auth-Token': WORKER_CONFIG.WORKER_AUTH_TOKEN,
    };

    try {
      const response = await fetch(fullUrl, { headers });

      if (response.status === 401) {
        throw new Error('অ্যাক্সেস অস্বীকৃত। অবৈধ X-Auth-Token।');
      }
      
      if (!response.ok) {
        const errJson = await response.json();
        let errorMessage = errJson.message || errJson.error || `Worker Error: ${response.status}`;
        
        // Handle specific Worker errors with helpful Bengali messages
        if (errorMessage.includes('Token refresh failed') || errorMessage.includes('OAuth client was not found')) {
          errorMessage = '⚠️ Worker কনফিগারেশন সমস্যা: Google OAuth credentials invalid বা expired। \n\nসমাধান:\n১. Google Cloud Console এ যান\n২. OAuth 2.0 Client ID চেক করুন\n৩. Worker এ নতুন CLIENT_ID, CLIENT_SECRET এবং REFRESH_TOKEN আপডেট করুন';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFiles(data.files || []);
      setCurrentPath(data.currentPath || '');
      setCurrentFolderName(data.currentFolderName || 'রুট');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ড্রাইভ ডেটা লোড করতে ব্যর্থ।';
      console.error('Drive Explorer Error:', err);
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: errorMessage.split('\n')[0], // Show first line in toast
      });
    } finally {
      setIsLoading(false);
      setIsNavigating(false);
    }
  }, [userType]);

  useEffect(() => {
    fetchFiles(currentPath);
  }, []);

  // Handle navigation and download
  const handleNavigation = async (e: React.MouseEvent, file: DriveFile) => {
    e.preventDefault();

    if (file.isFolder) {
      fetchFiles(file.path);
    } else {
      // Show downloading state for this specific file
      setDownloadingFile(file.name);
      
      try {
        const workerBaseUrl = getWorkerUrl(userType);
        
        // Use instant download API if fileId and rawSize are available
        let fullDownloadUrl: string;
        if (file.fileId && file.rawSize !== undefined) {
          // New instant download format (no auth token needed)
          fullDownloadUrl = `${workerBaseUrl}api/download/?id=${file.fileId}&name=${encodeURIComponent(file.name)}&size=${file.rawSize}&mime=${encodeURIComponent(file.mimeType)}`;
        } else {
          // Fallback to old download path method
          fullDownloadUrl = `${workerBaseUrl}${file.downloadPath?.replace('/', '')}`;
        }
        
        // Direct download without opening new tab
        const link = document.createElement('a');
        link.href = fullDownloadUrl;
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "ডাউনলোড শুরু",
          description: `${file.name} ডাউনলোড হচ্ছে...`,
        });
        
        // Reset downloading state after a short delay
        setTimeout(() => setDownloadingFile(null), 1000);
      } catch (err) {
        console.error('Download error:', err);
        toast({
          variant: "destructive",
          title: "ডাউনলোড ত্রুটি",
          description: "ফাইল ডাউনলোড করতে সমস্যা হয়েছে।",
        });
        setDownloadingFile(null);
      }
    }
  };

  // Handle back navigation
  const handleBack = () => {
    const segments = currentPath.split('/').filter(s => s);
    if (segments.length === 0) return;

    const parentPath = segments.slice(0, -1).join('/');
    fetchFiles(parentPath);
  };

  // Skeleton Loading UI for better perceived performance
  if (isLoading && files.length === 0) {
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
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive mb-4">ত্রুটি</p>
            <div className="text-left bg-destructive/10 p-4 rounded-lg mb-4 max-w-2xl mx-auto">
              <pre className="text-sm whitespace-pre-wrap text-foreground font-sans">{error}</pre>
            </div>
            <Button onClick={() => fetchFiles(currentPath)} variant="default">
              আবার চেষ্টা করুন
            </Button>
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
            {currentPath !== '' && (
              <Button onClick={handleBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                পেছনে যান
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <p className="text-sm text-muted-foreground">
              বর্তমান ফোল্ডার: <span className="font-semibold">{currentFolderName}</span>
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="সার্চ..."
                  className="pl-9 pr-9 h-9 w-[180px]"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
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
          <div className="text-center py-12 text-muted-foreground">
            <Folder className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>এই ফোল্ডারে কোনো ফাইল নেই</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAndSortedFiles.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground font-bengali">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>কোনো ফাইল পাওয়া যায়নি</p>
                {searchQuery && (
                  <p className="text-sm mt-2">
                    "{searchQuery}" এর জন্য কোনো ফলাফল নেই
                  </p>
                )}
              </div>
            ) : (
              filteredAndSortedFiles.map((file, index) => (
              <div
                key={index}
                className="flex flex-col p-4 rounded-xl border-2 bg-card hover:bg-accent/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md"
                onClick={(e) => handleNavigation(e, file)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-background/50 group-hover:scale-110 transition-transform duration-300">
                    {getIcon(file.mimeType, file.isFolder)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors leading-tight break-words">
                      {file.name}
                    </p>
                    {file.size && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {file.size}
                      </p>
                    )}
                  </div>
                </div>
                {!file.isFolder && (
                  <div className="flex items-center justify-end mt-auto pt-2 border-t">
                    {downloadingFile === file.name ? (
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>ডাউনলোড হচ্ছে...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                        <Download className="h-4 w-4" />
                        <span>ডাউনলোড করুন</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriveExplorer;
