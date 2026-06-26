import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { Check, Globe, LogOut, Monitor, Moon, Sun, UserCircle } from 'lucide-react';
import { useState } from 'react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { appearance, updateAppearance } = useAppearance();

    const [lang, setLang] = useState<'ru' | 'kz' | 'en'>(
        () => (localStorage.getItem('app_lang') as 'ru' | 'kz' | 'en') || 'ru'
    );

    const languages = [
        { value: 'ru' as const, label: 'Русский', short: 'РУС' },
        { value: 'kz' as const, label: 'Қазақша', short: 'ҚАЗ' },
        { value: 'en' as const, label: 'English',  short: 'ENG' },
    ];

    const profileUrl =
        user.role === 'patient'
            ? '/patient/profile/edit'
            : user.role === 'doctor'
              ? '/doctor/profile'
              : '/settings/profile';

    const themes = [
        { value: 'light' as const, label: 'Светлая', icon: Sun },
        { value: 'dark' as const, label: 'Тёмная', icon: Moon },
        { value: 'system' as const, label: 'Системная', icon: Monitor },
    ];

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={profileUrl} as="button" prefetch onClick={cleanup}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        Мой профиль
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Monitor className="mr-2 h-4 w-4" />
                        Внешний вид
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {themes.map(({ value, label, icon: Icon }) => (
                            <DropdownMenuItem key={value} onClick={() => updateAppearance(value)} className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                                {appearance === value && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Globe className="mr-2 h-4 w-4" />
                        Язык
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {languages.map(({ value, label, short }) => (
                            <DropdownMenuItem
                                key={value}
                                onClick={() => { setLang(value); localStorage.setItem('app_lang', value); }}
                                className="flex items-center gap-2"
                            >
                                <span className="w-8 text-xs font-semibold text-muted-foreground">{short}</span>
                                <span>{label}</span>
                                {lang === value && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={cleanup}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                </Link>
            </DropdownMenuItem>
        </>
    );
}
