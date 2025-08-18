import { QRCodeSVG } from 'qrcode.react';

interface QRCodeClassProps {
    classId: string;
    size?: number;
}

const QRCodeClass = ({ classId, size = 200 }: QRCodeClassProps) => {
    const joinUrl = `${window.location.origin}/class/${classId}/request`;

    return (
        <div className='bg-white p-4 rounded-lg'>
            <QRCodeSVG value={joinUrl} size={size} level='M' includeMargin={true} />
        </div>
    );
};

export default QRCodeClass;
