import { CreateDeckModal } from '../modals/create-deck-modal';
import { GenerateQuizModal } from '../modals/generate-quiz-modal';
import { RequestPublicDeckModal } from '../modals/request-public-deck-modal';
import { StreakIconModal } from '../modals/streak-icon-modal';

export default function ModalProvider() {
    return (
        <>
            <CreateDeckModal />
            <GenerateQuizModal />
            <RequestPublicDeckModal />
            <StreakIconModal />
        </>
    );
}
