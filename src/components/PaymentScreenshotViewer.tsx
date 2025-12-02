import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Image, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentScreenshotViewerProps {
  screenshotUrl: string | null;
  size?: 'sm' | 'md';
}

export const PaymentScreenshotViewer = ({ screenshotUrl, size = 'md' }: PaymentScreenshotViewerProps) => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!screenshotUrl) {
    return (
      <span className="text-xs text-muted-foreground font-bengali">
        স্ক্রিনশট নেই
      </span>
    );
  }

  const handleViewImage = async () => {
    if (imageUrl) {
      setDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('payment-screenshots')
        .createSignedUrl(screenshotUrl, 3600); // 1 hour expiry

      if (error) throw error;
      
      if (data?.signedUrl) {
        setImageUrl(data.signedUrl);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Error loading screenshot:', error);
      toast({
        title: "লোড করতে ব্যর্থ",
        description: "স্ক্রিনশট লোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  const buttonSize = size === 'sm' ? 'sm' : 'default';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Button
        onClick={handleViewImage}
        disabled={loading}
        size={buttonSize}
        variant="outline"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className={`${iconSize} animate-spin`} />
            <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>লোড হচ্ছে...</span>
          </>
        ) : (
          <>
            <Image className={iconSize} />
            <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-bengali`}>দেখুন</span>
          </>
        )}
      </Button>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-bengali flex items-center justify-between">
            <span>পেমেন্ট স্ক্রিনশট</span>
            <Button
              onClick={handleDownload}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="font-bengali">খুলুন</span>
            </Button>
          </DialogTitle>
        </DialogHeader>
        {imageUrl ? (
          <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
            <img
              src={imageUrl}
              alt="Payment Screenshot"
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
