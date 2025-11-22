import { supabase } from '@/integrations/supabase/client';

export interface DriveFile {
  id: string;
  name: string;
  size: string;
  downloadUrl: string;
  mimeType: string;
}

export const fetchDriveFiles = async (folderName: string): Promise<DriveFile[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-drive-files', {
      body: { folderName },
    });

    if (error) {
      console.error('Error fetching drive files:', error);
      throw error;
    }

    return data?.files || [];
  } catch (error) {
    console.error('Error fetching drive files:', error);
    throw error;
  }
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
