
import type { FunctionComponent, SVGProps } from 'react';

import Avatar1 from '@/components/icons/avatars/avatar-1';
import Avatar2 from '@/components/icons/avatars/avatar-2';
import Avatar3 from '@/components/icons/avatars/avatar-3';
import Avatar4 from '@/components/icons/avatars/avatar-4';
import Avatar5 from '@/components/icons/avatars/avatar-5';
import Avatar6 from '@/components/icons/avatars/avatar-6';
import Avatar7 from '@/components/icons/avatars/avatar-7';
import Avatar8 from '@/components/icons/avatars/avatar-8';
import Avatar9 from '@/components/icons/avatars/avatar-9';
import Avatar10 from '@/components/icons/avatars/avatar-10';
import Avatar11 from '@/components/icons/avatars/avatar-11';
import Avatar12 from '@/components/icons/avatars/avatar-12';


export type AvatarInfo = {
    id: string;
    component: FunctionComponent<SVGProps<SVGSVGElement>>;
};

export const ALL_AVATARS: AvatarInfo[] = [
    { id: 'avatar-1', component: Avatar1 }, // Rocket
    { id: 'avatar-2', component: Avatar2 }, // Star
    { id: 'avatar-3', component: Avatar3 }, // Cat
    { id: 'avatar-4', component: Avatar4 }, // Robot
    { id: 'avatar-5', component: Avatar5 }, // Book
    { id: 'avatar-6', component: Avatar6 }, // Lightbulb
    { id: 'avatar-7', component: Avatar7 }, // Planet
    { id: 'avatar-8', component: Avatar8 }, // Ghost
    { id: 'avatar-9', component: Avatar9 }, // Controller
    { id: 'avatar-10', component: Avatar10 },// Pizza
    { id: 'avatar-11', component: Avatar11 },// Winky Face
    { id: 'avatar-12', component: Avatar12 },// Ooh Face
];

const avatarMap = new Map(ALL_AVATARS.map(avatar => [avatar.id, avatar.component]));

export const getAvatar = (id?: string | null): FunctionComponent<SVGProps<SVGSVGElement>> | null => {
    if (!id) return null;
    return avatarMap.get(id) || null;
}
