import HeroSection from '@/components/hero';
import Header from '@/components/shared/header';

const Marketing = () => {
    return (
        <>
            <Header />
            <div className='max-w-[1416px] mx-auto min-h-screen'>
                <HeroSection />
            </div>
        </>
    );
};

export default Marketing;
