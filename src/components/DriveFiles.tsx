import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DriveFilesProps {
  userType: 'mobile' | 'business';
  hasActiveSubscription: boolean;
}

const DriveFiles = ({ userType, hasActiveSubscription }: DriveFilesProps) => {
  const navigate = useNavigate();

  const handleDriveAccess = () => {
    navigate('/drive-access');
  };

  if (!hasActiveSubscription) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-xl">
        <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          🔐 ড্রাইভ দেখতে সক্রিয় সাবস্ক্রিপশন প্রয়োজন
        </p>
      </div>
    );
  }

  return (
    <Card className="card-hover border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
            <FolderOpen className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {userType === 'mobile' ? '📱 মোবাইল ড্রাইভ' : '📂 বিজনেস ড্রাইভ'}
            </h3>
            <p className="text-muted-foreground mb-4">
              আপনার সকল ফাইল দেখুন এবং ডাউনলোড করুন
            </p>
          </div>
          <Button
            onClick={handleDriveAccess}
            size="lg"
            className="gradient-primary w-full sm:w-auto"
          >
            <FolderOpen className="h-5 w-5 mr-2" />
            ড্রাইভ খুলুন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriveFiles;
