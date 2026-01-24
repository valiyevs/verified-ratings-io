import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, Copy, Check, Palette } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  companyId: string;
  companyName: string;
}

export const QRCodeGenerator = ({ companyId, companyName }: QRCodeGeneratorProps) => {
  const [size, setSize] = useState(200);
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code URL using Google Charts API
  const reviewUrl = `${window.location.origin}/company/${companyId}?action=review`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(reviewUrl)}&color=${foreground.replace('#', '')}&bgcolor=${background.replace('#', '')}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrApiUrl;
    link.download = `${companyName.replace(/\s+/g, '-')}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'QR kod yükləndi' });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      toast({ title: 'Link kopyalandı' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: 'Kopyalama xətası', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Kod Generatoru
        </CardTitle>
        <CardDescription>
          Müştərilərin tez rəy yazması üçün QR kod yaradın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Code Preview */}
          <div className="flex flex-col items-center">
            <div 
              className="p-4 rounded-lg border-2 border-dashed"
              style={{ backgroundColor: background }}
            >
              <img 
                src={qrApiUrl} 
                alt="QR Code" 
                width={size} 
                height={size}
                className="rounded"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Bu QR kodu skan edən müştərilər birbaşa rəy yazma səhifəsinə yönləndiriləcək
            </p>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            {/* Size */}
            <div className="space-y-2">
              <Label>Ölçü (px)</Label>
              <Input
                type="number"
                min={100}
                max={500}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  QR Rəngi
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Arxa fon</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* URL Display */}
            <div className="space-y-2">
              <Label>Rəy Linki</Label>
              <div className="flex gap-2">
                <Input
                  value={reviewUrl}
                  readOnly
                  className="text-xs"
                />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Download Button */}
            <Button onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              QR Kodu Yüklə
            </Button>

            {/* Usage Tips */}
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium mb-2">İstifadə tövsiyələri:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Mağazada kassa yanına yerləşdirin</li>
                <li>• Çek/qəbzlərin üzərinə çap edin</li>
                <li>• Vizit kartlarına əlavə edin</li>
                <li>• Sosial mediada paylaşın</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
