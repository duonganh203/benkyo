import useMe from '@/hooks/queries/use-me';

const Home = () => {
    const { data } = useMe();
    return <div>{data?.email}</div>;
};

export default Home;
