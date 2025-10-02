import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { getToast } from '@/utils/getToast';

interface QRCodeClassProps {
    classId: string;
    size?: number;
}

const QRCodeClass = ({ classId, size = 200 }: QRCodeClassProps) => {
    const joinUrl = `${window.location.origin}/class/${classId}/request`;
    const containerRef = useRef<HTMLDivElement>(null);

    const handleCopy = async () => {
        try {
            const svg = containerRef.current?.querySelector('svg');
            if (!svg) {
                getToast('error', 'Error when copying QR code');
                return;
            }

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(url);
                    getToast('error', 'Sao chép QR thất bại');
                    return;
                }
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(async (blob) => {
                    try {
                        if (!blob) throw new Error('toBlob failed');
                        await navigator.clipboard.write([new (window as any).ClipboardItem({ [blob.type]: blob })]);
                        getToast('success', 'Copied QR successfully');
                    } catch {
                        const dataUrl = canvas.toDataURL('image/png');
                        await navigator.clipboard.writeText(dataUrl);
                        getToast('success', 'Copied QR (as image link)');
                    } finally {
                        URL.revokeObjectURL(url);
                    }
                }, 'image/png');
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                getToast('error', 'Sao chép QR thất bại');
            };
            img.src = url;
        } catch {
            getToast('error', 'Error when copying QR code');
        }
    };

    return (
        <div>
            <div
                ref={containerRef}
                className='bg-white p-4 rounded-lg cursor-pointer'
                onClick={handleCopy}
                title='Click To Coppy'
            >
                <QRCodeSVG value={joinUrl} size={size} level='M' includeMargin={true} />
            </div>
            <Button variant='outline' size='sm' className='mt-2 w-full' onClick={handleCopy}>
                Coppy QR
            </Button>
        </div>
    );
};

export default QRCodeClass;
