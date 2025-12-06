import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '@/hooks/stores/use-auth-store';
import useGetClassManagementById from '@/hooks/queries/use-get-class-management-id';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import { getToast } from '@/utils/getToast';

import { ClassOverview } from '@/components/class-management/class-overview';
import { ClassTabHeader, Tab } from '@/components/class-management/class-tab-header';
import { ClassMember } from '@/components/class-management/class-member';
import { ClassInvited } from '@/components/class-management/class-invited';
import { ClassRequestJoin } from '@/components/class-management/class-request-join';
import { ClassSetting } from '@/components/class-management/class-setting';
import { ClassVisited } from '@/components/class-management/class-visited';
import { ClassMemberLearningStatus } from '@/components/class-member-learning-status';
import { ClassCreateMooc } from '@/components/class-management/class-create-mooc';
import ClassQuizManagement from './class-quiz-management';

const UserClassManagement = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [currentTab, setCurrentTab] = useState<Tab>(Tab.Home);

    const { data: classItem, isLoading, isError, error, refetch } = useGetClassManagementById(classId || '');
    const { setClassData, setLoading, setError } = useClassManagementStore();

    useEffect(() => {
        if (!user) {
            getToast('error', 'You must be logged in to continue.');
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!classId) {
            getToast('error', 'Class ID is required');
            navigate('/class/list');
        }
    }, [classId, navigate]);

    useEffect(() => {
        if (classItem) setClassData(classItem);
    }, [classItem, setClassData]);

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading, setLoading]);

    useEffect(() => {
        if (isError && error) {
            setError(error.message);
            getToast('error', error.message);
            navigate('/class/list');
        }
    }, [isError, error, setError, navigate]);

    if (isLoading) {
        return (
            <div className='container mx-auto px-4 py-8'>
                <div className='text-center py-8 text-muted-foreground'>Loading class management...</div>
            </div>
        );
    }

    if (!classItem) {
        return (
            <div className='max-w-5xl mx-auto px-4 py-8'>
                <div className='text-center py-8 text-muted-foreground'>Class not found</div>
            </div>
        );
    }

    return (
        <div className='max-w-5xl mx-auto px-4 py-8'>
            <div className='sticky top-0 z-50 bg-transparent pb-4'>
                <ClassTabHeader classItem={classItem} currentTab={currentTab} setTab={setCurrentTab} />
            </div>

            <div className='space-y-6'>
                {currentTab === Tab.Home && <ClassOverview classItem={classItem} classId={classId!} />}
                {currentTab === Tab.Member && <ClassMember onMemberChange={refetch} />}
                {currentTab === Tab.CreateMooc && <ClassCreateMooc />}
                {currentTab === Tab.Invited && <ClassInvited onInvitedChange={refetch} />}
                {currentTab === Tab.RequestJoin && <ClassRequestJoin onMemberChange={refetch} />}
                {currentTab === Tab.LearningStatus && <ClassMemberLearningStatus />}
                {currentTab === Tab.Visited && <ClassVisited />}
                {currentTab === Tab.Setting && <ClassSetting />}
                {currentTab === Tab.Quizzes && <ClassQuizManagement />}
            </div>
        </div>
    );
};

export default UserClassManagement;
