'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LogOut, User, FileText, Key, Book } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
    const { user, isAuthenticated } = useAuthStore();
    const { signOut } = useSupabaseAuth();

    if (!isAuthenticated || !user) {
        return null;
    }

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted transition-colors cursor-pointer">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.picture} alt={user.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.picture} alt={user.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/templates" className="flex items-center gap-2 cursor-pointer">
                        <FileText className="h-4 w-4" />
                        My Templates
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/editor" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Editor
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/api-keys" className="flex items-center gap-2 cursor-pointer">
                        <Key className="h-4 w-4" />
                        API Keys
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/docs" className="flex items-center gap-2 cursor-pointer">
                        <Book className="h-4 w-4" />
                        API Documentation
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
