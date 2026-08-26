import { Button } from "@/components/ui/button"

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">OrderFlow Frontend</h1>
        <p className="text-slate-400">Tailwind CSS & Shadcn UI successfully initialized.</p>
        <Button variant="default" onClick={() => alert("Shadcn UI Working!")}>
          Test Shadcn Button
        </Button>
      </div>
    </div>
  )
}