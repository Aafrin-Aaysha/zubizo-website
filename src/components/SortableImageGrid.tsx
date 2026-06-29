'use client';

import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Plus, GripHorizontal, Star } from 'lucide-react';

interface SortableItemProps {
    id: string;
    url: string;
    index: number;
    showPrimaryButton?: boolean;
    onRemove: (id: string) => void;
    onMakePrimary?: (id: string) => void;
    aspectRatio?: 'square' | 'portrait';
}

function SortableItem({ id, url, index, showPrimaryButton, onRemove, onMakePrimary, aspectRatio = 'square' }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    const aspectRatioClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-[3/4]';

    return (
        <div ref={setNodeRef} style={style} className={`${aspectRatioClass} rounded-2xl overflow-hidden relative group border border-gray-50 bg-gray-50 ${isDragging ? 'shadow-2xl ring-2 ring-lavender opacity-80' : ''}`}>
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
            
            <button 
                type="button" 
                {...attributes} 
                {...listeners} 
                className="absolute top-2 left-2 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-xl flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing border border-white/20 hover:text-lavender"
            >
                <GripHorizontal size={14} />
            </button>

            <button 
                type="button" 
                onClick={() => onRemove(id)} 
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-xl flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all border border-white/20 hover:bg-red-500/80 hover:text-white"
            >
                <Trash2 size={14} />
            </button>

            {showPrimaryButton && index > 0 && onMakePrimary && (
                <button 
                    type="button" 
                    onClick={() => onMakePrimary(id)} 
                    className="absolute top-2 right-12 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-xl flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all border border-white/20 hover:text-yellow-400" 
                    title="Make Primary"
                >
                    <Star size={14} />
                </button>
            )}
        </div>
    );
}

interface SortableImageGridProps {
    images: string[];
    onChange: (images: string[]) => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    aspectRatio?: 'square' | 'portrait';
    showPrimaryButton?: boolean;
    uploadText?: string;
}

export function SortableImageGrid({ images, onChange, onUpload, aspectRatio = 'square', showPrimaryButton = false, uploadText = 'Add Images' }: SortableImageGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Requires 5px movement before dragging starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.indexOf(active.id as string);
            const newIndex = images.indexOf(over.id as string);
            onChange(arrayMove(images, oldIndex, newIndex));
        }
    };

    const handleMakePrimary = (id: string) => {
        const idx = images.indexOf(id);
        if (idx > 0) {
            const newImages = [id, ...images.filter(img => img !== id)];
            onChange(newImages);
        }
    }

    const aspectRatioClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-[3/4]';
    const gridClass = aspectRatio === 'square' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2';

    return (
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className={`grid ${gridClass} gap-4`}>
                <SortableContext 
                    items={images}
                    strategy={rectSortingStrategy}
                >
                    {images.map((img, idx) => (
                        <SortableItem 
                            key={img} 
                            id={img} 
                            url={img} 
                            index={idx}
                            aspectRatio={aspectRatio}
                            showPrimaryButton={showPrimaryButton}
                            onRemove={(id) => onChange(images.filter(i => i !== id))} 
                            onMakePrimary={handleMakePrimary}
                        />
                    ))}
                </SortableContext>
                
                <label className={`${aspectRatioClass} rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-lavender hover:text-lavender transition-all cursor-pointer bg-gray-50/30 hover:bg-lavender/5 group`}>
                    <input type="file" multiple className="hidden" onChange={onUpload} accept="image/*" />
                    <div className="w-10 h-10 rounded-full bg-white group-hover:bg-lavender/10 flex items-center justify-center shadow-sm transition-all">
                        <Plus size={20} />
                    </div>
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-center px-2">{uploadText}</span>
                </label>
            </div>
        </DndContext>
    );
}
