import { Outlet } from "react-router-dom"
import SideBarMentor from "./SideBarMentor"



const MainLayoutMentor = () => {
  return (
    <div className="flex h-screen bg-[#1D1D1D]">
      <SideBarMentor />
      <main className="flex-1 p-4 overflow-y-auto ">
        <div className="flex justify-between">
          <div></div>
          <div className='flex items-center gap-3 px-7 pt-2'>
            <img src="/img/logo.png" alt="logo-ZonaTech" className="h-6 brightness-0 invert" />
            <p className="text-xl font-['Quicksand'] font-bold text-white">ZonaTech Perú</p>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayoutMentor