import HeroSection from '@/components/hero';
import Header from '@/components/header';
import FeaturesSection from '@/components/feature';
import HowItWorkSection from '@/components/how-it-work';
import TestimonialSection from '@/components/testimonial';
import StudyMethodSection from '@/components/study-method';
import CTASection from '@/components/cta';
import Footer from '@/components/footer';

const Marketing = () => {
    return (
        <>
            <Header />
            <div className='max-w-[1416px] mx-auto min-h-screen'>
                <HeroSection />
                <FeaturesSection />
                <HowItWorkSection />
                <TestimonialSection />
                <StudyMethodSection />
                <CTASection />
            </div>
            <Footer />
        </>
    );
};

export default Marketing;
