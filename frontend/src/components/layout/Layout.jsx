import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 page-enter pb-24 md:pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
