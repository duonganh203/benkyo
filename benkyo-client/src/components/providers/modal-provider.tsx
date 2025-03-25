import { CreateDeckModal } from '../modals/create-deck-modal';
import { GenerateQuizModal } from '../modals/generate-quiz-modal';

export default function ModalProvider() {
    return (
        <>
            <CreateDeckModal />
            <GenerateQuizModal />
        </>
    );
}
