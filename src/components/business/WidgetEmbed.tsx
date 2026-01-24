import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, Copy, Check, Star, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WidgetEmbedProps {
  companyId: string;
  companyName: string;
  averageRating: number | null;
  reviewCount: number | null;
}

export const WidgetEmbed = ({ 
  companyId, 
  companyName, 
  averageRating, 
  reviewCount 
}: WidgetEmbedProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = window.location.origin;
  const companyUrl = `${baseUrl}/company/${companyId}`;

  // HTML Badge Widget
  const badgeCode = `<!-- ratings.az Badge Widget -->
<a href="${companyUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; border-radius: 8px; text-decoration: none; font-family: system-ui, sans-serif; font-size: 14px; box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
  <span style="font-weight: 600;">${averageRating?.toFixed(1) || '0.0'}</span>
  <span style="opacity: 0.9;">(${reviewCount || 0} rəy)</span>
  <span style="font-size: 12px; opacity: 0.8;">ratings.az</span>
</a>`;

  // JavaScript Widget
  const jsWidgetCode = `<!-- ratings.az Dynamic Widget -->
<div id="ratings-az-widget" data-company-id="${companyId}"></div>
<script>
(function() {
  var widget = document.getElementById('ratings-az-widget');
  var iframe = document.createElement('iframe');
  iframe.src = '${baseUrl}/embed/${companyId}';
  iframe.style.cssText = 'border:none;width:300px;height:120px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);';
  widget.appendChild(iframe);
})();
</script>`;

  // Simple Link
  const simpleLinkCode = `<a href="${companyUrl}" target="_blank">
  ${companyName} üzrə ${reviewCount || 0} rəy - ratings.az
</a>`;

  // Markdown
  const markdownCode = `[![ratings.az](${baseUrl}/api/badge/${companyId})](${companyUrl})`;

  const handleCopy = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(type);
      toast({ title: 'Kod kopyalandı' });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({ title: 'Kopyalama xətası', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Widget Embed
        </CardTitle>
        <CardDescription>
          Saytınıza ratings.az reytinqini yerləşdirin
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Preview */}
        <div className="mb-6 p-6 rounded-lg bg-muted flex items-center justify-center">
          <a 
            href={companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-shadow"
          >
            <Star className="h-5 w-5 fill-current" />
            <span className="font-bold">{averageRating?.toFixed(1) || '0.0'}</span>
            <span className="opacity-90">({reviewCount || 0} rəy)</span>
            <span className="text-xs opacity-80">ratings.az</span>
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </div>

        <Tabs defaultValue="badge" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="badge">Badge</TabsTrigger>
            <TabsTrigger value="widget">Widget</TabsTrigger>
            <TabsTrigger value="link">Sadə Link</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>

          <TabsContent value="badge" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>HTML Badge Kodu</Label>
              <Badge variant="secondary">Ən populyar</Badge>
            </div>
            <div className="relative">
              <Textarea
                value={badgeCode}
                readOnly
                className="font-mono text-xs h-40"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(badgeCode, 'badge')}
              >
                {copied === 'badge' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Bu kodu saytınızın istədiyiniz yerinə yapışdırın. Heç bir əlavə quraşdırma tələb etmir.
            </p>
          </TabsContent>

          <TabsContent value="widget" className="space-y-4">
            <Label>JavaScript Widget Kodu</Label>
            <div className="relative">
              <Textarea
                value={jsWidgetCode}
                readOnly
                className="font-mono text-xs h-32"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(jsWidgetCode, 'widget')}
              >
                {copied === 'widget' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Bu widget real-time yenilənir və həmişə aktual məlumatları göstərir.
            </p>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <Label>Sadə HTML Link</Label>
            <div className="relative">
              <Textarea
                value={simpleLinkCode}
                readOnly
                className="font-mono text-xs h-20"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(simpleLinkCode, 'link')}
              >
                {copied === 'link' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="markdown" className="space-y-4">
            <Label>Markdown (GitHub, README)</Label>
            <div className="relative">
              <Textarea
                value={markdownCode}
                readOnly
                className="font-mono text-xs h-20"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(markdownCode, 'markdown')}
              >
                {copied === 'markdown' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
