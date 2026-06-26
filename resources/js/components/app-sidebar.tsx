import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building2, Calendar, CalendarDays, ClipboardList, HelpCircle, LayoutGrid, MessageSquare, Shield, Stethoscope, User, Users } from 'lucide-react';
import AppLogo from './app-logo';

const patientNavItems: NavItem[] = [
    { title: 'Главная', url: '/patient/dashboard', icon: LayoutGrid },
    { title: 'Запись к врачу', url: '/patient/appointment', icon: Calendar },
    { title: 'Список врачей', url: '/patient/doctors', icon: Stethoscope },
    { title: 'История визитов', url: '/patient/history', icon: ClipboardList },
    { title: 'Поликлиника', url: '/patient/clinic', icon: Building2 },
    { title: 'ОСМС', url: '/patient/osms', icon: Shield },
];

const doctorNavItems: NavItem[] = [
    { title: 'Главная', url: '/doctor/dashboard', icon: LayoutGrid },
    { title: 'Пациенты', url: '/doctor/patients', icon: Users },
    { title: 'Запись', url: '/doctor/appointments/create', icon: Calendar },
    { title: 'График', url: '/doctor/schedule', icon: CalendarDays },
    { title: 'Профиль', url: '/doctor/profile', icon: User },
];

const adminNavItems: NavItem[] = [
    { title: 'Главная', url: '/admin/dashboard', icon: LayoutGrid },
    { title: 'Врачи', url: '/admin/doctors', icon: Stethoscope },
    { title: 'Пациенты', url: '/admin/patients', icon: Users },
    { title: 'Записи', url: '/admin/appointments', icon: Calendar },
    { title: 'Отзывы', url: '/admin/reviews', icon: MessageSquare },
    { title: 'Вопросы', url: '/admin/questions', icon: HelpCircle },
];

const defaultNavItems: NavItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isPatient = auth.user?.role === 'patient';
    const isDoctor = auth.user?.role === 'doctor';
    const isAdmin = auth.user?.role === 'admin';

    const navItems = isPatient ? patientNavItems : isDoctor ? doctorNavItems : isAdmin ? adminNavItems : defaultNavItems;
    const logoHref = isPatient ? '/patient/dashboard' : isDoctor ? '/doctor/dashboard' : isAdmin ? '/admin/dashboard' : '/dashboard';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={logoHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
                {isPatient && (
                    <div className="px-3 py-2">
                        <Link
                            href="/patient/appointment"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <Calendar className="h-4 w-4" />
                            Записаться к врачу
                        </Link>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
