import { Bell, FolderKanban, LayoutDashboard, Users } from "lucide-react";
import type { OrganizationView } from "@/components/app/types";

type AppSidebarProps = {
  userName: string;
  organizations: OrganizationView[];
  activeOrganization: OrganizationView;
};

export function AppSidebar({
  userName,
  organizations,
  activeOrganization,
}: AppSidebarProps) {
  return (
    <aside className="flex min-h-screen w-full flex-col border-r border-line bg-white p-4 lg:w-72">
      <div>
        <p className="text-sm font-semibold text-brand">Donezo</p>
        <h1 className="mt-2 text-xl font-semibold text-ink">
          {activeOrganization.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{userName}</p>
      </div>

      <nav className="mt-8 space-y-1 text-sm font-medium text-slate-700">
        <NavItem href="#dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" active />
        <NavItem href="#projects" icon={<FolderKanban size={18} />} label="Projects" />
        <NavItem href="#notifications" icon={<Bell size={18} />} label="Notifications" />
        <NavItem href="#members" icon={<Users size={18} />} label="Members" />
      </nav>

      <div className="mt-auto pt-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Workspaces
        </p>
        <div className="space-y-2">
          {organizations.map((organization) => (
            <div
              className="rounded border border-line px-3 py-2 text-sm"
              key={organization.id}
            >
              <div className="font-medium text-ink">{organization.name}</div>
              <div className="text-xs text-slate-500">{organization.role}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded px-3 py-2 ${
        active ? "bg-blue-50 text-brand" : "hover:bg-slate-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
