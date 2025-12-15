import { CreateDeckModal } from '../modals/create-deck-modal';
import { GenerateQuizModal } from '../modals/generate-quiz-modal';
import { RequestPublicDeckModal } from '../modals/request-public-deck-modal';
import { FSRSInfoModal } from '../modals/fsrs-info-modal';

export default function ModalProvider() {
    return (
        <>
            <CreateDeckModal />
            <GenerateQuizModal />
            <RequestPublicDeckModal />
            <FSRSInfoModal />
        </>
    );
}
