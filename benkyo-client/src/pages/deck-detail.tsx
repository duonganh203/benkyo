import { useParams } from 'react-router-dom';

const DeckDetail = () => {
    const { id } = useParams();
    return <div>{id}</div>;
};

export default DeckDetail;
