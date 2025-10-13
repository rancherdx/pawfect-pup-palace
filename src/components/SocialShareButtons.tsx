import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Instagram, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  title,
  description = '',
  url,
  imageUrl,
}) => {
  const shareUrl = url || window.location.href;
  const shareText = description || title;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        // User cancelled the share, don't show error
      }
    } else {
      handleCopyLink();
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  const handleInstagramShare = () => {
    handleCopyLink();
    toast.success('Link copied! Paste it in your Instagram post or story.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="flex flex-wrap gap-2">
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleTwitterShare}
        className="gap-2"
      >
        <Twitter className="h-4 w-4" />
        Twitter
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleFacebookShare}
        className="gap-2"
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleInstagramShare}
        className="gap-2"
      >
        <Instagram className="h-4 w-4" />
        Instagram
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-2"
      >
        <LinkIcon className="h-4 w-4" />
        Copy Link
      </Button>
    </div>
  );
};