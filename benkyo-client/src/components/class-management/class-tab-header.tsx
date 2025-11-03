import { Users, Settings, Eye, Calendar, Mail, Shield, AlertTriangle, Plus, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ClassManagementResponseDto } from '@/types/class';

export const enum Tab {
    Home = 'HOME',
    Member = 'MEMBER',
    Deck = 'DECK',
    Invited = 'INVITED',
    RequestJoin = 'REQUEST_JOIN',
    Setting = 'SETTING',
    Visited = 'VISITED',
    LearningStatus = 'LEARNING_STATUS',
    CreateMooc = 'CREATE_MOOC',
    Quizzes = 'QUIZZES'
}

interface ClassTabHeaderProps {
    classItem: Partial<ClassManagementResponseDto> | null;
    currentTab: Tab;
    setTab: (tab: Tab) => void;
}

export const ClassTabHeader = ({ classItem, currentTab, setTab }: ClassTabHeaderProps) => (
    <Card className='mb-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg'>
        <CardContent className='p-4'>
            <div className='flex flex-wrap gap-3 justify-center'>
                <Button
                    variant={currentTab === Tab.Home ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTab(Tab.Home)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                        currentTab === Tab.Home
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Eye className='w-4 h-4 mr-2' />
                    Overview
                </Button>
                <Button
                    variant={currentTab === Tab.Member ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTab(Tab.Member)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                        currentTab === Tab.Member
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Users className='w-4 h-4 mr-2' />
                    Members ({classItem?.users?.length || 0})
                </Button>
                <Button
                    variant={currentTab === Tab.Deck ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTab(Tab.Deck)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                        currentTab === Tab.Deck
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Calendar className='w-4 h-4 mr-2' />
                    Decks ({classItem?.decks?.length || 0})
                </Button>
                <Button
                    variant={currentTab === Tab.CreateMooc ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTab(Tab.CreateMooc)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                        currentTab === Tab.CreateMooc
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Plus className='w-4 h-4 mr-2' />
                    Create MOOC
                </Button>
                <Button
                    variant={currentTab === Tab.Quizzes ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTab(Tab.Quizzes)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                        currentTab === Tab.Quizzes
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <BookOpen className='w-4 h-4 mr-2' />
                    Quizzes
                </Button>

                <Button
                    variant={currentTab === Tab.Invited ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTab(Tab.Invited)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                        currentTab === Tab.Invited
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Mail className='w-4 h-4 mr-2' />
                    Invited ({classItem?.invitedUsers?.length || 0})
                </Button>
                <Button
                    variant={currentTab === Tab.RequestJoin ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTab(Tab.RequestJoin)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                        currentTab === Tab.RequestJoin
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Shield className='w-4 h-4 mr-2' />
                    Join Requests ({classItem?.joinRequests?.length || 0})
                </Button>
                <Button
                    variant={currentTab === Tab.LearningStatus ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTab(Tab.LearningStatus)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                        currentTab === Tab.LearningStatus
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <AlertTriangle className='w-4 h-4 mr-2' />
                    Learning Status
                </Button>
                <Button
                    variant={currentTab === Tab.Visited ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTab(Tab.Visited)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                        currentTab === Tab.Visited
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Eye className='w-4 h-4 mr-2' />
                    Visited
                </Button>
                <Button
                    variant={currentTab === Tab.Setting ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTab(Tab.Setting)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                        currentTab === Tab.Setting
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Settings className='w-4 h-4 mr-2' />
                    Settings
                </Button>
            </div>
        </CardContent>
    </Card>
);
