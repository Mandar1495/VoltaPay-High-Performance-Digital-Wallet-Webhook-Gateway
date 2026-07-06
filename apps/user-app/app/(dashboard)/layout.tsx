import { SidebarItem } from "../../components/SidebarItem";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex bg-slate-50/50 min-h-screen">
        <div className="w-64 border-r border-slate-200 bg-white min-h-screen pt-24 shrink-0">
            <div className="space-y-1">
                <SidebarItem href={"/dashboard"} icon={<HomeIcon />} title="Home" />
                <SidebarItem href={"/transfer"} icon={<TransferIcon />} title="Transfer" />
                <SidebarItem href={"/transactions"} icon={<TransactionsIcon />} title="Transactions" />
                <SidebarItem href={"/p2p"} icon={<TransferIcon />} title="P2P Transfer" />
                <SidebarItem href={"/qr"} icon={<QrIcon />} title="QR Pay" />
                <SidebarItem href={"/rewards"} icon={<RewardsIcon />} title="Rewards" />
                <SidebarItem href={"/split-bills"} icon={<UsersIcon />} title="Split Bills" />
            </div>
        </div>
        <div className="flex-1 pt-24 pb-12 overflow-y-auto">
            {children}
        </div>
    </div>
  );
}

// Icons Fetched from https://heroicons.com/
function HomeIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
}
function TransferIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
}

function TransactionsIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
}

function QrIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-2.25ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-2.25ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 13.5 7.125v-2.25ZM6.75 6.75h.008v.008H6.75V6.75Zm0 9.75h.008v.008H6.75v-.008Zm9.75-9.75h.008v.008h-.008V6.75ZM13.5 15h.008v.008H13.5V15Zm0 2.25h.008v.008H13.5v-.008Zm2.25-2.25h.008v.008H15.75V15Zm0 2.25h.008v.008H15.75v-.008Zm2.25-2.25h.008v.008H18V15Zm0 2.25h.008v.008H18v-.008Zm0-4.5h.008v.008H18v-.008Zm-2.25 0h.008v.008H15.75v-.008Zm2.25 2.25h.008v.008H18V15Z" />
  </svg>
}

function RewardsIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0-2.625V7.5m0-2.625a2.625 2.625 0 1 1-2.625 2.625H12M12 7.5a2.625 2.625 0 1 0 2.625 2.625H12m-9.75 3.75h19.5" />
  </svg>
}

function UsersIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.018 12.018 0 0 1 12 21c-1.87 0-3.613-.427-5.176-1.192a8.017 8.017 0 0 1-3.07-3.07v-.003A4.125 4.125 0 0 1 11.29 14.37c.78.293 1.62.455 2.5.455h.42c.88 0 1.72-.162 2.5-.455a4.125 4.125 0 0 1 5.79 3.755c0 .038-.002.076-.005.113ZM15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6.25 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>
}