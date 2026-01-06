import type { EmotionType } from '../lib/animation/types';
export interface AntyChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onEmotion?: (emotion: EmotionType) => void;
}
export declare function AntyChatPanel({ isOpen, onClose, onEmotion }: AntyChatPanelProps): import("react/jsx-runtime").JSX.Element;
