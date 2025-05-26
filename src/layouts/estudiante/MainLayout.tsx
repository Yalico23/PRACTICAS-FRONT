import { Outlet } from 'react-router-dom'
import SideBar from './SideBar'

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <SideBar />
      <main className="flex-1 bg-gray-100 p-4 overflow-y-auto">
        <div className="flex items-center gap-3 px-7 pt-2">
          <img src="/img/logo.png" alt="logo-ZonaTech" className="h-6" />
          <p className="text-xl font-['Quicksand'] font-bold">ZonaTech Perú</p>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout