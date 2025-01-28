import useMe from '@/hooks/queries/useMe';

const Home = () => {
    const { data } = useMe();
    return <div>{data?.email}</div>;
};

export default Home;
