import Home from '@/components/home'
import TopMenu from '@/components/topMenu'

export default function Index() {
  return (
    <main>
      <div className="flex justify-center max-w-md flex-col mx-auto">
        <TopMenu />
        <Home />
      </div>
    </main>
  )
}
